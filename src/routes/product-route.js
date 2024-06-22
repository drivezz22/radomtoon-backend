const express = require("express");
const creatorAuthenticate = require("../middlewares/creator-authenticate");
const productController = require("../controllers/product-controller");

const productRouter = express.Router();

productRouter.post("/", creatorAuthenticate, productController.createProduct);

module.exports = productRouter;
