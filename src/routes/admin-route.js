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
adminRouter.patch(
  "/register/creator/:creatorId/pass-approval",
  authController.passApproval
);
adminRouter.patch(
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
adminRouter.get("/stat/top-five", statController.getTopFiveCategories);
adminRouter.get("/stat/total-fund-trend", statController.getTotalFundTrend);
adminRouter.get("/stat/creator-active", statController.getCreatorActive);
adminRouter.get("/stat/supporter-active", statController.getSupporterActive);
adminRouter.get("/stat/average-fund", statController.getAverageFund);
adminRouter.get("/stat/count-project", statController.getCountProject);
adminRouter.get("/stat/map-density", statController.getMapDensityAllProduct);

module.exports = adminRouter;
