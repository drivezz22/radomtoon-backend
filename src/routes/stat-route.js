const express = require("express");

const creatorAuthenticate = require("../middlewares/creator-authenticate");
const statController = require("../controllers/stat-controller");

const statRouter = express.Router();

statRouter.get(
  "/product/:productId",
  creatorAuthenticate,
  statController.getStatByProduct
);

statRouter.get("/", statController.getStat);

module.exports = statRouter;
