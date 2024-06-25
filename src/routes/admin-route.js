const express = require("express");

const authController = require("../controllers/auth-controller");
const productController = require("../controllers/product-controller");
const {
  failApprovalValidator,
  failedApprovalMilestoneValidator,
} = require("../middlewares/validator");
const milestoneController = require("../controllers/milestone-controller");

const adminRouter = express.Router();

adminRouter.get("/register/waiting-approval/", authController.getCreatorApproval);
adminRouter.post(
  "/register/creator-approve/:creatorId",
  authController.updateCreatorApproval
);

adminRouter.get("/product/all-project", productController.getAllProductForAdmin);
adminRouter.patch(
  "/product/:productId/failed-approval",
  failApprovalValidator,
  productController.failApproval
);
adminRouter.patch("/product/:productId/pass-approval", productController.passApproval);
adminRouter.patch("/milestone/:milestoneId/pass-approval");
adminRouter.patch(
  "/milestone/:milestoneId/failed-approval",
  failedApprovalMilestoneValidator,
  milestoneController.failApproval
);
adminRouter.get(
  "/milestone/waiting-approval",
  milestoneController.getPendingApprovalMilestone
);
adminRouter.get("/product/waiting-approval", productController.getPendingApprovalProduct);

module.exports = adminRouter;
