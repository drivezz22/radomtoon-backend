const { PRODUCT_STATUS_ID, APPROVAL_STATUS_ID, IMAGE_DIR } = require("../constants");
const milestoneService = require("../services/milestone-service");
const uploadService = require("../services/upload-service");
const createError = require("../utils/create-error");
const fs = require("fs-extra");
const tryCatch = require("../utils/try-catch-wrapper");

const milestoneController = {};

milestoneController.updateMilestone = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;
    const data = req.input;
    const existMilestone = await milestoneService.getMilestoneById(+milestoneId);
    if (!existMilestone) {
      createError({
        message: "This milestone does not exist in DB",
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
        message: "Cannot send the evidence when funding is not successful",
        statusCode: 400,
      });
    }

    if (existMilestone.approvalStatusId === APPROVAL_STATUS_ID.SUCCESS) {
      createError({
        message: "This milestone already approval",
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
        message: "Previous milestones are not finished",
        statusCode: 400,
      });
    }

    if (req.file) {
      if (existMilestone.evidenceImage) {
        await uploadService.delete(existMilestone.evidenceImage);
      }
      data.evidenceImage = await uploadService.upload(req.file.path);
    } else if (data.evidenceImage) {
      createError({
        message: "Please select image by form data",
        statusCode: 400,
      });
    }

    data.approvalStatusId = APPROVAL_STATUS_ID.PENDING;
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

milestoneController.failApproval = tryCatch(async (req, res, next) => {
  const { milestoneId } = req.params;
  const data = req.body;

  const existMilestone = await milestoneService.getMilestoneById(+milestoneId);

  if (!existMilestone) {
    createError({
      message: "This milestone does not exist in DB",
      statusCode: 400,
    });
  }

  if (existMilestone.product.productStatusId !== PRODUCT_STATUS_ID.SUCCESS) {
    createError({
      message: "Cannot send the evidence when funding is not successful",
      statusCode: 400,
    });
  }

  if (existMilestone.approvalStatusId === APPROVAL_STATUS_ID.SUCCESS) {
    createError({
      message: "This milestone already approval",
      statusCode: 400,
    });
  }

  if (existMilestone.approvalStatusId === APPROVAL_STATUS_ID.FAILED) {
    createError({
      message: "Please update your milestone evidence and send it again",
      statusCode: 400,
    });
  }

  await milestoneService.failApproval(+milestoneId);

  res
    .status(200)
    .json({ message: "fail approval in this milestone", comment: data.comment });
});

milestoneController.getPendingApprovalMilestone = tryCatch(async (req, res, next) => {
  const pendingApprovalMilestone = await milestoneService.getPendingApprovalMilestone();
  res.status(200).json({ pendingApprovalMilestone });
});

module.exports = milestoneController;
