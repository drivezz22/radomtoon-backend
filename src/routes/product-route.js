const express = require("express");
const creatorAuthenticate = require("../middlewares/creator-authenticate");
const productController = require("../controllers/product-controller");
const { createProductValidator } = require("../middlewares/validator");

const productRouter = express.Router();

productRouter.post(
  "/",
  creatorAuthenticate,
  createProductValidator,
  productController.createProduct
);

module.exports = productRouter;
