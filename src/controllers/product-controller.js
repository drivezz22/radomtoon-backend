const dayjs = require("dayjs");
const { MILESTONE_RANK_ID, APPROVAL_STATUS_ID, USER_ROLE } = require("../constants");
const milestoneService = require("../services/milestone-service");
const productService = require("../services/product-service");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch-wrapper");

const productController = {};

const validateMilestones = (milestoneDetailList) => {
  const milestoneRanks = milestoneDetailList.map((el) => el.rank);
  const milestoneRanksSet = new Set(milestoneRanks);
  if (milestoneDetailList.length !== Object.values(MILESTONE_RANK_ID).length) {
    createError({
      message: "Array length should be 3",
      statusCode: 400,
    });
  }

  if (milestoneRanksSet.size !== milestoneRanks.length) {
    createError({
      message: "Some milestones have the same rank",
      statusCode: 400,
    });
  }

  const isFoundAllMilestoneRank = milestoneRanks.every((r) =>
    Object.values(MILESTONE_RANK_ID).includes(r)
  );
  if (!isFoundAllMilestoneRank) {
    createError({
      message: "Incorrect milestone rank",
      statusCode: 400,
    });
  }
};

const validateDeadline = (deadline) => {
  const today = dayjs(new Date());
  const dateFromDB = dayjs(new Date(deadline));
  if (dateFromDB.diff(today, "day") < 15) {
    createError({
      message: "Deadline should be more than 15 days",
      statusCode: 400,
    });
  }
};

productController.createProduct = tryCatch(async (req, res, next) => {
  const {
    productName,
    goal,
    deadline,
    story,
    categoryId,
    milestoneDetailList = [],
  } = req.body;
  validateDeadline(deadline);

  const productData = {
    creatorId: req.user.id,
    productName,
    goal: +goal,
    deadline: new Date(deadline),
    story,
    categoryId,
  };
  const productResult = await productService.createProduct(productData);

  validateMilestones(milestoneDetailList);

  const milestonePromises = milestoneDetailList.map((el) => {
    const milestoneData = {
      productId: productResult.id,
      milestoneRankId: el.rank,
      approvalStatusId: APPROVAL_STATUS_ID.PENDING,
      milestoneDetail: el.detail,
    };
    return milestoneService.createMilestone(milestoneData);
  });
  const milestoneResult = await Promise.all(milestonePromises);

  res.status(201).json({
    message: "Product is created",
    productDetail: productResult,
    milestoneDetail: milestoneResult,
  });
});

productController.deleteProduct = tryCatch(async (req, res, next) => {
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
  await productService.deleteProductById(+productId);
  return res.status(204).end();
});

productController.updateProduct = tryCatch(async (req, res, next) => {
  const {
    productName,
    goal,
    deadline,
    story,
    categoryId,
    milestoneDetailList = [],
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

  const productData = {
    productName,
    goal: +goal,
    deadline: deadline ? new Date(deadline) : undefined,
    story,
    categoryId,
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
    validateMilestones(milestoneDetailList);
    await milestoneService.deleteByProductId(+productId);

    const milestonePromises = milestoneDetailList.map((el) => {
      const milestoneData = {
        productId: productResult.id,
        milestoneRankId: el.rank,
        approvalStatusId: APPROVAL_STATUS_ID.PENDING,
        milestoneDetail: el.detail,
      };
      return milestoneService.createMilestone(milestoneData);
    });
    milestoneResult = await Promise.all(milestonePromises);
  } else {
    milestoneResult = await milestoneService.getMilestoneByProductId(+productId);
  }
  res.status(200).json({
    message: "Product is updated",
    productDetail: productResult,
    milestoneDetail: milestoneResult,
  });
});

productController.getAllProduct = tryCatch(async (req, res, next) => {
  if (req.user.role === USER_ROLE.SUPPORTER) {
    const allProduct = await productService.getAllProduct();
    res.status(200).json({ productList: allProduct });
  } else if (req.user.role === USER_ROLE.CREATOR) {
    const allProductByCreatorId = await productService.getAllProductByCreatorId(
      req.user.id
    );
    res.status(200).json({ productList: allProductByCreatorId });
  }
});

productController.getAllProductForAdmin = tryCatch(async (req, res, next) => {
  console.log("Ssss");
  const allProductForAdmin = await productService.getAllProductForAdmin();
  res.status(200).json({ productList: allProductForAdmin });
});

productController.failApproval = tryCatch(async (req, res, next) => {
  const { productId } = req.params;
  const data = req.body;
  const existProduct = await productService.findProductById(+productId);
  if (!existProduct) {
    createError({
      message: "This product is not exist",
      statusCode: 400,
    });
  }

  if (existProduct.approvalStatusId === APPROVAL_STATUS_ID.SUCCESS) {
    createError({
      message: "This product is already pass approval",
      statusCode: 400,
    });
  }
  await productService.failApproval(+productId);
  res.status(200).json({ message: "Fail Approval is updated", comment: data.comment });
});

productController.passApproval = tryCatch(async (req, res, next) => {
  const { productId } = req.params;
  const existProduct = await productService.findProductById(+productId);
  if (!existProduct) {
    createError({
      message: "This product is not exist",
      statusCode: 400,
    });
  }

  if (existProduct.approvalStatusId === APPROVAL_STATUS_ID.SUCCESS) {
    createError({
      message: "This product is already pass approval",
      statusCode: 400,
    });
  }

  await productService.passApproval(+productId);
  res.status(200).json({ message: "Pass Approval is updated" });
});

module.exports = productController;
