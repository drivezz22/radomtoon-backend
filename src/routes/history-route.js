const express = require("express");
const supporterAuthenticate = require("../middlewares/supporter-authenticate");
const historyController = require("../controllers/history-controller");
const creatorAuthenticate = require("../middlewares/creator-authenticate");

const historyRouter = express.Router();

historyRouter.get("/", supporterAuthenticate, historyController.getHistoryBySupporterId);
historyRouter.get(
  "/product/:productId",
  creatorAuthenticate,
  historyController.getHistoryByProductId
);

module.exports = historyRouter;
