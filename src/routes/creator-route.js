const express = require("express");
const { createAboutValidator } = require("../middlewares/validator");
const creatorController = require("../controllers/creator-controller");
const upload = require("../middlewares/upload");
const authenticate = require("../middlewares/authenticate");
const creatorAuthenticate = require("../middlewares/creator-authenticate");

const creatorRouter = express.Router();

creatorRouter.patch(
  "/info",
  authenticate,
  creatorAuthenticate,
  createAboutValidator,
  creatorController.updateInfo
);

creatorRouter.patch(
  "/update-profile",
  authenticate,
  creatorAuthenticate,
  upload.single("profileImage"),
  creatorController.updateProfile
);

creatorRouter.get("/", creatorController.getCreator);
module.exports = creatorRouter;
