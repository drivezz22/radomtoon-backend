const express = require("express");
const upload = require("../middlewares/upload");
const { milestoneValidator } = require("../middlewares/validator");
const milestoneController = require("../controllers/milestone-controller");

const milestoneRouter = express.Router();

milestoneRouter.patch(
  "/:milestoneId",
  upload.single("evidenceImage"),
  milestoneValidator,
  milestoneController.updateMilestone
);

module.exports = milestoneRouter;
