const dayjs = require("dayjs");
const {
  MILESTONE_RANK_ID,
  APPROVAL_STATUS_ID,
  USER_ROLE,
  TIER_RANK_ID,
  MIN_DEADLINE_DAYS,
} = require("../constants");
const milestoneService = require("../services/milestone-service");
const productService = require("../services/product-service");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch-wrapper");
const tierService = require("../services/tier-service");
const { sendEmail } = require("../utils/node-mailer-config");
const { projectReject } = require("../utils/mail-content/project-reject");
const { projectApprove } = require("../utils/mail-content/project-approve");
const uploadService = require("../services/upload-service");

const productController = {};

const validateUniqueRanks = (detailList, rankKey, rankConstants) => {
  const ranks = detailList.map((el) => el[rankKey]);
  const ranksSet = new Set(ranks);

  if (ranksSet.size !== ranks.length) {
    createError({
      message: "Some items have the same rank",
      statusCode: 400,
    });
  }

  const isValidRank = ranks.every((r) => Object.values(rankConstants).includes(r));
  if (!isValidRank) {
    createError({
      message: "Incorrect rank",
      statusCode: 400,
    });
  }

  const hasOverMaximumRank = detailList.filter((el) => el[rankKey] > detailList.length);
  if (hasOverMaximumRank.length > 0) {
    createError({
      message: "Please select rank not over the number of ranks",
      statusCode: 400,
    });
  }
};

const validateDeadline = (deadline) => {
  const today = dayjs(new Date());
  const dateFromDB = dayjs(new Date(deadline));
  if (dateFromDB.diff(today, "day") < MIN_DEADLINE_DAYS) {
    createError({
      message: `Deadline should be more than ${MIN_DEADLINE_DAYS} days`,
      statusCode: 400,
    });
  }
};

productController.createProduct = tryCatch(async (req, res) => {
  const {
    productName,
    goal,
    deadline,
    story,
    categoryId,
    productVideo,
    milestoneDetailList = [],
    tierDetailList = [],
  } = req.body;

  validateDeadline(deadline);
  validateUniqueRanks(milestoneDetailList, "rank", MILESTONE_RANK_ID);
  validateUniqueRanks(tierDetailList, "tierRankId", TIER_RANK_ID);

  if (!req.file) {
    createError({
      message: "Please select your product image by form data",
      statusCode: 400,
    });
  }
  // upload image
  const productImage = await uploadService.upload(req.file.path);

  const productData = {
    creatorId: req.user.id,
    productName,
    goal: +goal,
    deadline: new Date(deadline),
    story,
    categoryId,
    productImage,
    productVideo,
  };

  const productResult = await productService.createProduct(productData);

  const milestonePromises = milestoneDetailList.map((el) => {
    const milestoneData = {
      productId: productResult.id,
      milestoneRankId: el.rank,
      milestoneDetail: el.detail,
    };
    return milestoneService.createMilestone(milestoneData);
  });

  const milestoneResult = await Promise.all(milestonePromises);

  const tierPromises = tierDetailList.map((el) => {
    const tierData = {
      tierName: el.tierName,
      tierRankId: el.tierRankId,
      productId: productResult.id,
      price: el.price,
      tierDetail: el.tierDetail,
    };
    return tierService.createTier(tierData);
  });

  const tierDetailResult = await Promise.all(tierPromises);

  res.status(201).json({
    message: "Product is created",
    productDetail: productResult,
    milestoneDetail: milestoneResult,
    tierDetail: tierDetailResult,
  });
});

productController.deleteProduct = tryCatch(async (req, res) => {
  const { productId } = req.params;
  const existProduct = await productService.findProductByCreatorIdAndProductId(
    req.user.id,
    +productId
  );
  if (!existProduct) {
    return res.status(204).end();
  }

  if (existProduct.approvalStatusId === APPROVAL_STATUS_ID.SUCCESS) {
    createError({
      message: "Product is already approved",
      statusCode: 400,
    });
  }
  await milestoneService.deleteByProductId(+productId);
  await tierService.deleteByProductId(+productId);
  await productService.deleteProductById(+productId);
  return res.status(204).end();
});

productController.updateProduct = tryCatch(async (req, res) => {
  const {
    productName,
    goal,
    deadline,
    story,
    categoryId,
    productVideo,
    milestoneDetailList = [],
    tierDetailList = [],
  } = req.body;
  const { productId } = req.params;
  const existProduct = await productService.findProductByCreatorIdAndProductId(
    req.user.id,
    +productId
  );

  if (!existProduct) {
    createError({
      message: "No this product in DB",
      statusCode: 400,
    });
  }
  if (
    [APPROVAL_STATUS_ID.SUCCESS, APPROVAL_STATUS_ID.PENDING].includes(
      existProduct.approvalStatusId
    )
  ) {
    createError({
      message: `Product is already ${
        existProduct.approvalStatusId === APPROVAL_STATUS_ID.SUCCESS
          ? "approved"
          : "pending approval"
      }`,
      statusCode: 400,
    });
  }

  if (deadline) {
    validateDeadline(deadline);
  }

  let productImage;
  if (req.file) {
    if (existProduct.productImage) {
      await uploadService.delete(existProduct.productImage);
    }
    productImage = await uploadService.upload(req.file.path);
  } else if (req.body.productImage) {
    createError({
      message: "Please select image by form data",
      statusCode: 400,
    });
  }

  const productData = {
    productName,
    goal: +goal,
    deadline: deadline ? new Date(deadline) : undefined,
    story,
    categoryId,
    productImage,
    productVideo,
  };

  const filteredProductData = Object.fromEntries(
    Object.entries(productData).filter(([_, v]) => v != null)
  );

  const productResult = await productService.updateProductById(
    +productId,
    filteredProductData
  );

  let milestoneResult = [];

  if (milestoneDetailList.length > 0) {
    validateUniqueRanks(milestoneDetailList, "rank", MILESTONE_RANK_ID);
    await milestoneService.deleteByProductId(+productId);

    const milestonePromises = milestoneDetailList.map((el) => {
      const milestoneData = {
        productId: productResult.id,
        milestoneRankId: el.rank,
        milestoneDetail: el.detail,
      };
      return milestoneService.createMilestone(milestoneData);
    });
    milestoneResult = await Promise.all(milestonePromises);
  } else {
    milestoneResult = await milestoneService.getMilestoneByProductId(+productId);
  }

  let tierDetailResult = [];
  if (tierDetailList.length > 0) {
    validateUniqueRanks(tierDetailList, "tierRankId", TIER_RANK_ID);

    await tierService.deleteByProductId(+productId);

    const tierPromises = tierDetailList.map((el) => {
      const tierData = {
        tierName: el.tierName,
        tierRankId: el.tierRankId,
        productId: productResult.id,
        price: el.price,
        tierDetail: el.tierDetail,
      };
      return tierService.createTier(tierData);
    });
    tierDetailResult = await Promise.all(tierPromises);
  } else {
    tierDetailResult = await tierService.getTierByProductId(+productId);
  }

  res.status(200).json({
    message: "Product is updated",
    productDetail: productResult,
    milestoneDetail: milestoneResult,
    tierDetail: tierDetailResult,
  });
});

productController.getAllProduct = tryCatch(async (req, res) => {
  if (req.user.role === USER_ROLE.SUPPORTER) {
    const allProduct = await productService.getAllProduct();
    return res.status(200).json({ productList: allProduct });
  }

  if (req.user.role === USER_ROLE.CREATOR) {
    const allProductByCreatorId = await productService.getAllProductByCreatorId(
      req.user.id
    );
    return res.status(200).json({ productList: allProductByCreatorId });
  }
});

productController.getAllProductForAdmin = tryCatch(async (req, res) => {
  const allProductForAdmin = await productService.getAllProductForAdmin();
  res.status(200).json({ productList: allProductForAdmin });
});

productController.failApproval = tryCatch(async (req, res) => {
  const { productId } = req.params;
  const { comment } = req.body;

  const existProduct = await productService.findProductById(+productId);
  if (!existProduct) {
    createError({
      message: "This product does not exist",
      statusCode: 400,
    });
  }

  if (existProduct.approvalStatusId === APPROVAL_STATUS_ID.SUCCESS) {
    createError({
      message: "This product has already passed approval",
      statusCode: 400,
    });
  }
  await sendEmail(existProduct.creator.email, "Project Rejected", projectReject(comment));
  await productService.failApproval(+productId);
  res.status(200).json({ message: "Approval failure updated" });
});

productController.passApproval = tryCatch(async (req, res) => {
  const { productId } = req.params;

  const existProduct = await productService.findProductById(+productId);
  if (!existProduct) {
    createError({
      message: "This product does not exist",
      statusCode: 400,
    });
  }

  if (existProduct.approvalStatusId === APPROVAL_STATUS_ID.SUCCESS) {
    createError({
      message: "This product is already passed approval",
      statusCode: 400,
    });
  }

  await sendEmail(existProduct.creator.email, "Project Approved", projectApprove);
  await productService.passApproval(+productId);
  res.status(200).json({ message: "Approval success updated" });
});

productController.getPendingApprovalProduct = tryCatch(async (req, res) => {
  const pendingApprovalProduct = await productService.getPendingApprovalProduct();
  res.status(200).json({ pendingApprovalProduct });
});

module.exports = productController;
