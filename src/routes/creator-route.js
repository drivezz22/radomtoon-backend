const express = require("express");
const creatorAuthenticate = require("../middlewares/creator-authenticate");
const { createAboutValidator } = require("../middlewares/validator");
const creatorController = require("../controllers/creator-controller");

const creatorRouter = express.Router();

creatorRouter.patch(
  "/info/:creatorId",
  creatorAuthenticate,
  createAboutValidator,
  creatorController.updateInfo
);

module.exports = creatorRouter;
