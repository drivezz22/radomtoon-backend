const express = require("express");
const { createAboutValidator } = require("../middlewares/validator");
const creatorController = require("../controllers/creator-controller");

const creatorRouter = express.Router();

creatorRouter.patch(
  "/info/:creatorId",
  createAboutValidator,
  creatorController.updateInfo
);

module.exports = creatorRouter;
