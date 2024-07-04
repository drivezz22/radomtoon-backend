const { APPROVAL_STATUS_ID, IMAGE_DIR } = require("../constants");
const productService = require("../services/product-service");
const tierService = require("../services/tier-service");
const uploadService = require("../services/upload-service");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch-wrapper");
const fs = require("fs-extra");

const tierController = {};

tierController.createTier = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const tierData = req.body;

    const existTier = await tierService.getTierByProductIdAndRankId(
      +productId,
      +tierData.tierRankId
    );

    if (existTier) {
      createError({
        message: "This tier rank of this product already exist in DB",
        statusCode: 400,
      });
    }

    const existProduct = await productService.findProductByCreatorIdAndProductId(
      +req.user.id,
      +productId
    );

    if (!existProduct) {
      createError({
        message: "No product in DB",
        statusCode: 400,
      });
    }

    if (existProduct.approvalStatusId === APPROVAL_STATUS_ID.SUCCESS) {
      createError({
        message: "This product has already passed approval",
        statusCode: 400,
      });
    }

    if (existProduct.approvalStatusId === APPROVAL_STATUS_ID.PENDING) {
      createError({
        message: "This product has pending approval",
      });
    }

    if (!req.file) {
      createError({
        message: "Please select your tier image by form data",
        statusCode: 400,
      });
    }

    tierData.tierImage = await uploadService.upload(req.file.path);
    tierData.productId = +productId;
    tierData.price = +tierData.price;
    tierData.tierRankId = +tierData.tierRankId;

    const result = await tierService.createTier(tierData);
    res.status(201).json({ message: "Tier created", tier: result });
  } catch (err) {
    next(err);
  } finally {
    fs.emptyDirSync(IMAGE_DIR);
  }
};

tierController.updateTier = async (req, res, next) => {
  try {
    const { tierId } = req.params;
    const tierData = req.body;

    const existTier = await tierService.getTierById(+tierId);
    if (!existTier) {
      createError({
        message: "This tier does not exist in DB",
        statusCode: 400,
      });
    }
    const existProduct = await productService.findProductByCreatorIdAndProductId(
      +req.user.id,
      existTier.productId
    );

    if (!existProduct) {
      createError({
        message: "No product in DB",
        statusCode: 400,
      });
    }

    if (existProduct.approvalStatusId === APPROVAL_STATUS_ID.SUCCESS) {
      createError({
        message: "This product has already passed approval",
        statusCode: 400,
      });
    }

    if (existProduct.approvalStatusId === APPROVAL_STATUS_ID.PENDING) {
      createError({
        message: "This product has pending approval",
      });
    }

    if (req.file) {
      if (existTier.tierImage) {
        await uploadService.delete(existTier.tierImage);
      }
      tierData.tierImage = await uploadService.upload(req.file.path);
    }
    tierData.price = +tierData.price;

    const result = await tierService.updateTier(+tierId, tierData);
    res.status(200).json({ message: "Tier updated", tier: result });
  } catch (err) {
    next(err);
  } finally {
    fs.emptyDirSync(IMAGE_DIR);
  }
};

tierController.deleteTier = tryCatch(async (req, res) => {
  const { tierId } = req.params;
  const existTier = await tierService.getTierById(+tierId);
  if (!existTier) {
    return res.status(204).end();
  }

  if (existTier.tierImage) {
    await uploadService.delete(existTier.tierImage);
  }

  await tierService.deleteTier(+tierId);
  res.status(204).json({ message: "Tier deleted" });
});

module.exports = tierController;
