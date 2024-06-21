const express = require("express");
const authenticate = require("../middlewares/authenticate");
const {
  supporterRegisterValidator,
  creatorRegisterValidator,
  loginValidator,
} = require("../middlewares/validator");
const authController = require("../controllers/auth-controller");
const upload = require("../middlewares/upload");

const authRouter = express.Router();

authRouter.post(
  "/register/supporter",
  supporterRegisterValidator,
  authController.supporterRegister
);
authRouter.post(
  "/register/creator",
  upload.single("identityImage"),
  creatorRegisterValidator,
  authController.creatorRegister
);
authRouter.post("/login", loginValidator, () => {});
authRouter.get("/get-me", authenticate, () => {});

module.exports = authRouter;
