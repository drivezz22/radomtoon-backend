const express = require("express");

const authController = require("../controllers/auth-controller");
const productController = require("../controllers/product-controller");
const { failApprovalValidator } = require("../middlewares/validator");

const adminRouter = express.Router();

adminRouter.get("/register/creator-approve/", authController.getCreatorApproval);
adminRouter.post(
  "/register/creator-approve/:creatorId",
  authController.updateCreatorApproval
);

adminRouter.get("/product", productController.getAllProductForAdmin);
adminRouter.patch(
  "/product/:productId/failed-approval",
  failApprovalValidator,
  productController.failApproval
);
adminRouter.patch("/product/:productId/pass-approval", productController.passApproval);

module.exports = adminRouter;
