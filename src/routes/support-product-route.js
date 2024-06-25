const express = require("express");
const supporterAuthenticate = require("../middlewares/supporter-authenticate");
const supportProductController = require("../controllers/support-product-controller");
const creatorAuthenticate = require("../middlewares/creator-authenticate");

const supportProductRouter = express.Router();

supportProductRouter.post("/tier/:tierId", supportProductController.createSupportProduct);

supportProductRouter.delete(
  "/product/:productId",
  supporterAuthenticate,
  supportProductController.cancelSupport
);

supportProductRouter.patch(
  "/product/:productId/supporter/:supporterId",
  creatorAuthenticate,
  supportProductController.updateDelivery
);

module.exports = supportProductRouter;
