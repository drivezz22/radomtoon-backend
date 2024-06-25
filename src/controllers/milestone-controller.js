const { PRODUCT_STATUS_ID, APPROVAL_STATUS_ID, IMAGE_DIR } = require("../constants");
const milestoneService = require("../services/milestone-service");
const uploadService = require("../services/upload-service");
const createError = require("../utils/create-error");
const fs = require("fs-extra");

const milestoneController = {};

milestoneController.updateMilestone = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;
    const data = req.input;
    const existMilestone = await milestoneService.getMilestoneById(+milestoneId);
    if (!existMilestone) {
      createError({
        message: "This milestone is not exist in DB",
        statusCode: 400,
      });
    }

    if (!existMilestone.evidenceImage && !req.file) {
      createError({
        message: "No image in DB and no evidence image in data",
        statusCode: 400,
      });
    }

    if (existMilestone.product.productStatusId !== PRODUCT_STATUS_ID.SUCCESS) {
      createError({
        message: "Can send the evidence when funding is success",
        statusCode: 400,
      });
    }

    const milestoneByProductId = await milestoneService.getMilestoneByProductId(
      existMilestone.productId
    );

    const unfinishedPrevMilestoneTier = milestoneByProductId.filter(
      (el) =>
        el.milestoneRankId < existMilestone.milestoneRankId &&
        el.approvalStatusId !== APPROVAL_STATUS_ID.SUCCESS
    );

    if (unfinishedPrevMilestoneTier.length > 0) {
      createError({
        message: "Previous milestone is not finished",
        statusCode: 400,
      });
    }

    if (req.file) {
      if (existMilestone.evidenceImage) {
        await uploadService.delete(existMilestone.evidenceImage);
      }

      data.evidenceImage = await uploadService.upload(req.file.path);
    }

    const updateMilestone = await milestoneService.updateMilestoneById(
      +milestoneId,
      data
    );

    res.status(200).json({ message: "milestone updated", milestone: updateMilestone });
  } catch (err) {
    next(err);
  } finally {
    fs.emptyDirSync(IMAGE_DIR);
  }
};

module.exports = milestoneController;
