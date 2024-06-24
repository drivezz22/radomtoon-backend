const express = require("express");

const authController = require("../controllers/auth-controller");

const adminRouter = express.Router();

adminRouter.get("/register/creator-approve/", authController.getCreatorApproval);
adminRouter.post(
  "/register/creator-approve/:creatorId",
  authController.updateCreatorApproval
);

module.exports = adminRouter;
