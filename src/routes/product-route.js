const express = require("express");
const creatorAuthenticate = require("../middlewares/creator-authenticate");
const productController = require("../controllers/product-controller");
const {
  createProductValidator,
  updateProductValidator,
} = require("../middlewares/validator");
const upload = require("../middlewares/upload");
const productTransform = require("../middlewares/product-transform");
const authenticate = require("../middlewares/authenticate");

const productRouter = express.Router();

productRouter.post(
  "/",
  authenticate,
  creatorAuthenticate,
  upload.single("productImage"),
  productTransform,
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
  productTransform,
  updateProductValidator,
  productController.updateProduct
);

productRouter.get("/", productController.getAllProduct);
productRouter.get(
  "/creator",
  authenticate,
  creatorAuthenticate,
  productController.getAllProductByCreatorId
);
module.exports = productRouter;
