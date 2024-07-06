const {
  PRODUCT_STATUS_ID,
  APPROVAL_STATUS_ID,
  IMAGE_DIR,
  MILESTONE_PERCENT_PAYMENT,
  WEBSITE_PERCENT_PROFIT,
} = require("../constants");
const milestoneService = require("../services/milestone-service");
const uploadService = require("../services/upload-service");
const createError = require("../utils/create-error");
const fs = require("fs-extra");
const tryCatch = require("../utils/try-catch-wrapper");
const productService = require("../services/product-service");
const webProfitService = require("../services/web-profit-service");
const { sendEmail } = require("../utils/node-mailer-config");
const { milestoneApproval } = require("../utils/mail-content/milestone-approve");
const { milestoneReject } = require("../utils/mail-content/milestone-reject");

const milestoneController = {};

const checkMilestoneExistence = (existMilestone) => {
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
      message: "This milestone already approved",
      statusCode: 400,
    });
  }

  if (existMilestone.approvalStatusId === APPROVAL_STATUS_ID.FAILED) {
    createError({
      message: "Please update your milestone evidence and send it again",
      statusCode: 400,
    });
  }
};

const checkUnfinishedMilestones = async (existMilestone) => {
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
};

milestoneController.updateMilestoneEvidence = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;
    const data = req.input;
    const existMilestone = await milestoneService.getMilestoneById(+milestoneId);

    checkMilestoneExistence(existMilestone);
    await checkUnfinishedMilestones(existMilestone);

    if (!existMilestone.evidenceImage && !req.file) {
      createError({
        message: "No image in DB and no evidence image in data",
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

milestoneController.failApproval = tryCatch(async (req, res) => {
  const { milestoneId } = req.params;
  const { comment } = req.body;

  const existMilestone = await milestoneService.getMilestoneById(+milestoneId);

  checkMilestoneExistence(existMilestone);
  await checkUnfinishedMilestones(existMilestone);

  await sendEmail(
    existMilestone.product.creator.email,
    `Milestone ${existMilestone.milestoneRankId} Rejected`,
    milestoneReject(existMilestone.milestoneRankId, comment)
  );

  await milestoneService.failApproval(+milestoneId);

  res.status(200).json({ message: "fail approval in this milestone" });
});

milestoneController.getPendingApprovalMilestone = tryCatch(async (req, res) => {
  const pendingApprovalMilestone = await milestoneService.getPendingApprovalMilestone();
  res.status(200).json({ pendingApprovalMilestone });
});

milestoneController.passApproval = tryCatch(async (req, res) => {
  const { milestoneId } = req.params;

  const existMilestone = await milestoneService.getMilestoneById(+milestoneId);
  checkMilestoneExistence(existMilestone);
  await checkUnfinishedMilestones(existMilestone);

  await sendEmail(
    existMilestone.product.creator.email,
    `Milestone ${existMilestone.milestoneRankId} Approved`,
    milestoneApproval(existMilestone.milestoneRankId)
  );

  const MilestonePercent = MILESTONE_PERCENT_PAYMENT[existMilestone.milestoneRankId];
  const totalFund = existMilestone.product.totalFund * (1 - MilestonePercent);
  const availableFund = totalFund * (1 - WEBSITE_PERCENT_PROFIT);
  const webProfitFund = totalFund * WEBSITE_PERCENT_PROFIT;

  await productService.updateAvailableFund(existMilestone.productId, availableFund);

  const existWebProfit = await webProfitService.findProfitById(existMilestone.productId);
  if (existWebProfit) {
    const totalProfit = existWebProfit.totalProfit + webProfitFund;
    await webProfitService.updateProfitById(existMilestone.productId, totalProfit);
  } else {
    const profitData = {
      productId: existMilestone.productId,
      totalProfit: webProfitFund,
    };
    await webProfitService.createProfit(profitData);
  }

  await milestoneService.passApproval(+milestoneId);

  res.status(200).json({ message: "pass approval in this milestone" });
});

milestoneController.createMilestone = tryCatch(async (req, res) => {
  const { productId } = req.params;
  const data = req.body;
  const existMilestone = await milestoneService.getMilestoneByProductIdAndRankId(
    +productId,
    data.milestoneRankId
  );

  if (existMilestone) {
    createError({
      message: "This milestone rank of this product already exist in DB",
      statusCode: 400,
    });
  }

  const existProduct = await productService.findProductByCreatorIdAndProductId(
    +req.user.id,
    +productId
  );

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
  data.productId = +productId;
  const milestoneData = await milestoneService.createMilestone(data);
  res.status(201).json({ message: "Milestone is created", milestoneData });
});

milestoneController.updateMilestone = tryCatch(async (req, res) => {
  const { milestoneId } = req.params;
  const existMilestone = await milestoneService.getMilestoneById(+milestoneId);
  if (!existMilestone) {
    createError({
      message: "This milestone does not exist in DB",
      statusCode: 400,
    });
  }

  const milestoneData = await milestoneService.updateMilestoneById(
    +milestoneId,
    req.body
  );
  res.status(200).json({ message: "milestone updated", milestone: milestoneData });
});

milestoneController.deleteMilestone = tryCatch(async (req, res) => {
  const { milestoneId } = req.params;
  const existMilestone = await milestoneService.getMilestoneById(+milestoneId);
  if (!existMilestone) {
    return res.status(204).end();
  }
  await milestoneService.deleteById(+milestoneId);
  res.status(204).end();
});

module.exports = milestoneController;
