const express = require("express");
const upload = require("../middlewares/upload");
const {
  updateEvidenceMilestoneValidator,
  createMilestoneValidator,
  updateMilestoneValidator,
} = require("../middlewares/validator");
const milestoneController = require("../controllers/milestone-controller");

const milestoneRouter = express.Router();

milestoneRouter.patch(
  "/:milestoneId/send-evidence",
  upload.single("evidenceImage"),
  updateEvidenceMilestoneValidator,
  milestoneController.updateMilestone
);

milestoneRouter.post(
  "/product/:productId",
  createMilestoneValidator,
  milestoneController.createMilestone
);

milestoneRouter.patch(
  "/:milestoneId",
  updateMilestoneValidator,
  milestoneController.updateMilestone
);

milestoneRouter.delete("/:milestoneId", milestoneController.deleteMilestone);

module.exports = milestoneRouter;
