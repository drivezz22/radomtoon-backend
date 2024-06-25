const express = require("express");
const supporterAuthenticate = require("../middlewares/supporter-authenticate");
const historyController = require("../controllers/history-controller");

const historyRouter = express.Router();

historyRouter.get("/", supporterAuthenticate, historyController.getHistoryBySupporterId);

module.exports = historyRouter;
