const dayjs = require("dayjs");
const { APPROVAL_STATUS_ID, TIER_RANK_ID, MIN_DEADLINE_DAYS } = require("../constants");
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
  const { productName, goal, deadline, categoryId, productVideo, summaryDetail } =
    req.body;
  validateDeadline(deadline);

  if (!req.file) {
    createError({
      message: "Please select your product image by form data",
      statusCode: 400,
    });
  }

  const productImage = await uploadService.upload(req.file.path);

  const productData = {
    creatorId: req.user.id,
    productName,
    goal: +goal,
    deadline: new Date(deadline),
    categoryId: +categoryId,
    productImage,
    productVideo,
    summaryDetail,
  };

  const productResult = await productService.createProduct(productData);

  productResult.creatorName = `${productResult.creator.firstName} ${productResult.creator.lastName}`;
  productResult.profileImage = productResult.creator.profileImage;
  delete productResult.creator;

  res.status(201).json({
    message: "Product is created",
    productDetail: productResult,
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
  if (existProduct.productImage) {
    await uploadService.delete(existProduct.productImage);
  }

  if (existProduct.approvalStatusId === APPROVAL_STATUS_ID.SUCCESS) {
    createError({
      message: "Product is already approved",
      statusCode: 400,
    });
  }
  const tierData = await tierService.getTierByProductId(+productId);

  const tierImageList = tierData.map((el) => {
    if (el.tierImage) {
      return uploadService.delete(el.tierImage);
    }
  });

  await Promise.all(tierImageList);
  await milestoneService.deleteByProductId(+productId);
  await tierService.deleteByProductId(+productId);
  await productService.deleteProductById(+productId);
  return res.status(204).end();
});

productController.updateProduct = tryCatch(async (req, res) => {
  const { productName, goal, deadline, story, categoryId, productVideo, summaryDetail } =
    req.body;

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

  if (existProduct.approvalStatusId === APPROVAL_STATUS_ID.PENDING) {
    createError({
      message: "Product is already approved",
      statusCode: 400,
    });
  }

  if (existProduct.approvalStatusId === APPROVAL_STATUS_ID.SUCCESS) {
    createError({
      message: "Product is pending approval",
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
    productImage = req.body.productImage;
  }

  const productData = {
    productName,
    goal: +goal,
    deadline: deadline ? new Date(deadline) : undefined,
    story,
    categoryId: +categoryId,
    productImage,
    productVideo,
    summaryDetail,
  };

  const filteredProductData = Object.fromEntries(
    Object.entries(productData).filter(([_, v]) => v != null)
  );

  const productResult = await productService.updateProductById(
    +productId,
    filteredProductData
  );

  res.status(200).json({
    message: "Product is updated",
    productDetail: productResult,
  });
});

productController.updateStory = tryCatch(async (req, res) => {
  const { productId } = req.params;
  const data = req.body;

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

  if (existProduct.approvalStatusId === APPROVAL_STATUS_ID.PENDING) {
    createError({
      message: "Product is already approved",
      statusCode: 400,
    });
  }

  if (existProduct.approvalStatusId === APPROVAL_STATUS_ID.SUCCESS) {
    createError({
      message: "Product is pending approval",
      statusCode: 400,
    });
  }

  const productResult = await productService.updateProductById(+productId, data);

  res.status(200).json({
    message: "Product story is updated",
    productDetail: productResult,
  });
});

productController.getAllProductByCreatorId = tryCatch(async (req, res) => {
  const allProduct = await productService.getAllProductByCreatorId(req.user.id);
  const dropCreatorAllProduct = allProduct.map((el) => {
    el.creatorName = `${el.creator.firstName} ${el.creator.lastName}`;
    el.creatorProfileImage = el.profileImage;
    delete el.creator;
    return el;
  });
  return res.status(200).json({ productList: dropCreatorAllProduct });
});

productController.updateApprovePending = tryCatch(async (req, res) => {
  const { productId } = req.params;

  const existProduct = await productService.findProductByCreatorIdAndProductId(
    +req.user.id,
    +productId
  );

  if (!existProduct) {
    createError({
      message: "No this product in DB",
      statusCode: 400,
    });
  }

  if (existProduct.approvalStatusId === APPROVAL_STATUS_ID.SUCCESS) {
    createError({
      message: "Product is already approved",
      statusCode: 400,
    });
  }

  if (existProduct.approvalStatusId === APPROVAL_STATUS_ID.PENDING) {
    createError({
      message: "Product is already pending approval",
      statusCode: 400,
    });
  }

  if (existProduct.productMilestones.length !== Object.keys(TIER_RANK_ID).length) {
    createError({
      message: "Milestone is not completed",
      statusCode: 400,
    });
  }

  if (existProduct.productTiers.length === 0) {
    createError({
      message: "Tier should be minimum 1",
      statusCode: 400,
    });
  }

  await productService.updateApprovePending(+productId);
  res.status(200).json({ message: "Approval status is updated" });
});

productController.getAllProduct = tryCatch(async (req, res) => {
  const allProduct = await productService.getAllProduct();
  const dropCreatorAllProduct = allProduct.map((el) => {
    el.creatorName = `${el.creator.firstName} ${el.creator.lastName}`;
    el.profileImage = el.creator.profileImage;
    delete el.creator;
    return el;
  });
  return res.status(200).json({ productList: dropCreatorAllProduct });
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
