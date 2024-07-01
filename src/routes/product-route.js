const express = require("express");
const creatorAuthenticate = require("../middlewares/creator-authenticate");
const productController = require("../controllers/product-controller");
const {
  createProductValidator,
  updateProductValidator,
  updateStoryValidator,
} = require("../middlewares/validator");
const upload = require("../middlewares/upload");
const authenticate = require("../middlewares/authenticate");

const productRouter = express.Router();

productRouter.post(
  "/",
  authenticate,
  creatorAuthenticate,
  upload.single("productImage"),
  createProductValidator,
  productController.createProduct
);

productRouter.delete(
  "/:productId",
  authenticate,
  creatorAuthenticate,
  productController.deleteProduct
);
productRouter.patch(
  "/:productId",
  authenticate,
  creatorAuthenticate,
  upload.single("productImage"),
  updateProductValidator,
  productController.updateProduct
);
productRouter.patch(
  "/:productId/update-story",
  authenticate,
  creatorAuthenticate,
  updateStoryValidator,
  productController.updateStory
);

productRouter.patch(
  "/:productId/pending-approval",
  authenticate,
  creatorAuthenticate,
  productController.updateApprovePending
);

productRouter.get("/", productController.getAllProduct);
module.exports = productRouter;
