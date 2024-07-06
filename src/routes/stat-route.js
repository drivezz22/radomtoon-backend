const express = require("express");

const creatorAuthenticate = require("../middlewares/creator-authenticate");
const statController = require("../controllers/stat-controller");
const authenticate = require("../middlewares/authenticate");

const statRouter = express.Router();

statRouter.get(
  "/product/:productId",
  authenticate,
  creatorAuthenticate,
  statController.getStatByProduct
);

statRouter.get("/", statController.getStat);

statRouter.get(
  "/product/:productId/fund-trend",
  authenticate,
  creatorAuthenticate,
  statController.getProductFundTrend
);

statRouter.get(
  "/product/:productId/tier-stat",
  authenticate,
  creatorAuthenticate,
  statController.getTierStat
);

statRouter.get(
  "/product/:productId/map-density",
  authenticate,
  creatorAuthenticate,
  statController.getMapDensityByProduct
);

module.exports = statRouter;
