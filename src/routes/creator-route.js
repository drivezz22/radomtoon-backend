const express = require("express");
const { createAboutValidator } = require("../middlewares/validator");
const creatorController = require("../controllers/creator-controller");
const upload = require("../middlewares/upload");

const creatorRouter = express.Router();

creatorRouter.patch("/info/", createAboutValidator, creatorController.updateInfo);

creatorRouter.patch(
  "/update-profile",
  upload.single("profileImage"),
  creatorController.updateProfile
);

module.exports = creatorRouter;
