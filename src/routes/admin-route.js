const express = require("express");

const authController = require("../controllers/auth-controller");
const productController = require("../controllers/product-controller");
const {
  failApprovalValidator,
  failedApprovalMilestoneValidator,
} = require("../middlewares/validator");
const milestoneController = require("../controllers/milestone-controller");
const statController = require("../controllers/stat-controller");

const adminRouter = express.Router();

adminRouter.get("/register/waiting-approval/", authController.getCreatorApproval);
adminRouter.post(
  "/register/creator/:creatorId/pass-approval",
  authController.passApproval
);
adminRouter.post(
  "/register/creator/:creatorId/failed-approval",
  authController.failedApproval
);

adminRouter.get("/product/all-project", productController.getAllProductForAdmin);
adminRouter.patch(
  "/product/:productId/failed-approval",
  failApprovalValidator,
  productController.failApproval
);
adminRouter.patch("/product/:productId/pass-approval", productController.passApproval);

adminRouter.patch(
  "/milestone/:milestoneId/failed-approval",
  failedApprovalMilestoneValidator,
  milestoneController.failApproval
);
adminRouter.patch(
  "/milestone/:milestoneId/pass-approval",
  milestoneController.passApproval
);
adminRouter.get(
  "/milestone/waiting-approval",
  milestoneController.getPendingApprovalMilestone
);

adminRouter.get("/product/waiting-approval", productController.getPendingApprovalProduct);
adminRouter.get("/stat/admin-stat", statController.getAdminStat);

module.exports = adminRouter;
