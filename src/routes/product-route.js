const express = require("express");
const creatorAuthenticate = require("../middlewares/creator-authenticate");
const productController = require("../controllers/product-controller");
const {
  createProductValidator,
  updateProductValidator,
} = require("../middlewares/validator");
const upload = require("../middlewares/upload");
const productTransform = require("../middlewares/product-transform");

const productRouter = express.Router();

productRouter.post(
  "/",
  creatorAuthenticate,
  upload.single("productImage"),
  productTransform,
  createProductValidator,
  productController.createProduct
);

productRouter.delete("/:productId", creatorAuthenticate, productController.deleteProduct);
productRouter.patch(
  "/:productId",
  creatorAuthenticate,
  upload.single("productImage"),
  productTransform,
  updateProductValidator,
  productController.updateProduct
);

productRouter.get("/", productController.getAllProduct);
module.exports = productRouter;
