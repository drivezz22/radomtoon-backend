const express = require("express");
const creatorAuthenticate = require("../middlewares/creator-authenticate");
const productController = require("../controllers/product-controller");
const {
  createProductValidator,
  updateProductValidator,
} = require("../middlewares/validator");

const productRouter = express.Router();

productRouter.post(
  "/",
  creatorAuthenticate,
  createProductValidator,
  productController.createProduct
);

productRouter.delete("/:productId", creatorAuthenticate, productController.deleteProduct);
productRouter.patch(
  "/:productId",
  creatorAuthenticate,
  updateProductValidator,
  productController.updateProduct
);

productRouter.get("/", productController.getAllProduct);
module.exports = productRouter;
