const dayjs = require("dayjs");
const tierService = require("../services/tier-service");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch-wrapper");
const {
  PRODUCT_STATUS_ID,
  DELIVERY_STATUS_ID,
  APPROVAL_STATUS_ID,
  MILESTONE_RANK_MUST_PASS,
} = require("../constants");
const supportProductService = require("../services/support-product-service");
const productService = require("../services/product-service");

const supportProductController = {};

supportProductController.createSupportProduct = tryCatch(async (req, res) => {
  const { tierId } = req.params;
  const existTier = await tierService.getTierById(+tierId);

  const today = dayjs();
  const deadline = dayjs(existTier.product.deadline);
  if (deadline.diff(today, "day") < 0) {
    createError({
      message: "Over deadline, cannot support this project",
      statusCode: 400,
    });
  }

  if (existTier.product.productStatusId !== PRODUCT_STATUS_ID.PENDING) {
    createError({
      message: "Can support the product only if it is in pending status",
      statusCode: 400,
    });
  }

  const existSupport = await supportProductService.getSupportBySupporterIdAndProductId(
    +req.user.id,
    existTier.productId
  );

  if (existSupport) {
    createError({
      message: "Can support only once in a project",
      statusCode: 400,
    });
  }

  const supportProductData = {
    userId: req.user.id,
    productId: existTier.productId,
    tierId: +tierId,
    deliveryStatusId: DELIVERY_STATUS_ID.PENDING,
  };

  const totalFund = existTier.price + existTier.product.totalFund;

  await productService.updateFund(existTier.productId, totalFund);

  const supportResult = await supportProductService.createSupportProduct(
    supportProductData
  );

  res
    .status(201)
    .json({ message: "Product is supported", supportProduct: supportResult });
});

supportProductController.cancelSupport = tryCatch(async (req, res) => {
  const { productId } = req.params;
  const existSupport = await supportProductService.getSupportBySupporterIdAndProductId(
    +req.user.id,
    +productId
  );

  if (!existSupport) {
    createError({
      message: "You do not support this product",
      statusCode: 400,
    });
  }

  const today = dayjs();
  const deadline = dayjs(existSupport.product.deadline);
  if (deadline.diff(today, "day") < 0) {
    createError({
      message: "Over deadline, cannot unsupport this project",
      statusCode: 400,
    });
  }

  if (existSupport.product.productStatusId !== PRODUCT_STATUS_ID.PENDING) {
    createError({
      message: "Can unsupport the product only if it is in pending status",
      statusCode: 400,
    });
  }

  const totalFund = existSupport.product.totalFund - existSupport.tier.price;

  await productService.updateFund(existSupport.productId, totalFund);

  await supportProductService.deleteSupportProductById(existSupport.id);

  res.status(204).end();
});

supportProductController.updateDelivery = tryCatch(async (req, res) => {
  const { productId, supporterId } = req.params;
  const existSupport = await supportProductService.getSupportBySupporterIdAndProductId(
    +supporterId,
    +productId
  );

  if (!existSupport) {
    createError({
      message: "This supporter does not support this project",
      statusCode: 400,
    });
  }

  if (existSupport.deliveryStatusId === DELIVERY_STATUS_ID.DELIVERED) {
    createError({
      message: "This supporter has already received the product",
      statusCode: 400,
    });
  }

  if (existSupport.product.productStatusId !== PRODUCT_STATUS_ID.SUCCESS) {
    createError({
      message: "Only successful products can be sent",
      statusCode: 400,
    });
  }

  const checkPassMilestone = existSupport.product.productMilestones.filter(
    (el) =>
      el.approvalStatusId === APPROVAL_STATUS_ID.SUCCESS &&
      MILESTONE_RANK_MUST_PASS.includes(el.milestoneRankId)
  );

  if (checkPassMilestone.length < 2) {
    createError({
      message: "Should pass milestone 1 and 2 before sending the product",
      statusCode: 400,
    });
  }

  await supportProductService.updateDeliveryById(existSupport.id);

  res.status(200).json({ message: "This product has been sent to the supporter" });
});

module.exports = supportProductController;
