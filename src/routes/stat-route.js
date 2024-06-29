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
statRouter.get(
  "/product/:productId/fund-trend",
  creatorAuthenticate,
  statController.getProductFundTrend
);
statRouter.get(
  "/product/:productId/tier-stat",
  creatorAuthenticate,
  statController.getTierStat
);

statRouter.get(
  "/product/:productId/map-density",
  creatorAuthenticate,
  statController.getMapDensityByProduct
);

module.exports = statRouter;
