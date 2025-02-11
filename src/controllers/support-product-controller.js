const dayjs = require("dayjs");
const tierService = require("../services/tier-service");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch-wrapper");
const {
  PRODUCT_STATUS_ID,
  DELIVERY_STATUS_ID,
  APPROVAL_STATUS_ID,
  MILESTONE_RANK_MUST_PASS,
  CATEGORIES_TYPE_NAME,
} = require("../constants");
const supportProductService = require("../services/support-product-service");
const productService = require("../services/product-service");
const { sendEmail } = require("../utils/node-mailer-config");
const { cancelSupport } = require("../utils/mail-content/cancel-support");
const { supportProject } = require("../utils/mail-content/support-project");
const userService = require("../services/user-service");
const { deliveryMail } = require("../utils/mail-content/delivery");

const supportProductController = {};

supportProductController.createSupportProduct = tryCatch(async (req, res) => {
  const { tierId } = req.params;
  const existTier = await tierService.getTierById(+tierId);
  const existUser = await userService.findUserById(+req.user.id);

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

  const deliveryStatus =
    supportResult.product.productStatus.id === PRODUCT_STATUS_ID.SUCCESS
      ? supportResult.deliveryStatus.status
      : "NOT AVAILABLE";
  const fundingStatus = supportResult.deletedAt
    ? "CANCELED"
    : supportResult.product.productStatus.status;
  const supportResultSelect = {
    productId: supportResult.product.id,
    projectName: supportResult.product.productName,
    projectImage: supportResult.product.productImage,
    projectCategory: CATEGORIES_TYPE_NAME[supportResult.product.categoryId],
    tierId: supportResult.tierId,
    tierName: supportResult.tier.tierName,
    price: supportResult.tier.price,
    date: supportResult.createdAt,
    fundingStatus,
    deliveryStatus,
  };
  await sendEmail(existUser.email, "Support Confirmation", supportProject);

  res
    .status(201)
    .json({ message: "Product is supported", supporterHistory: supportResultSelect });
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

  await sendEmail(
    existSupport.user.email,
    "Support Cancellation Confirmation",
    cancelSupport
  );
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
  await sendEmail(existSupport.user.email, "Delivery", deliveryMail);

  res.status(200).json({ message: "This product has been sent to the supporter" });
});

module.exports = supportProductController;
