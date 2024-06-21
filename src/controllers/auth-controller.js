const { IDENTITY_IMAGE_DIR, IS_CREATOR_ACCEPT_STATUS } = require("../constants");
const creatorService = require("../services/creator-service");
const hashService = require("../services/hash-service");
const jwtService = require("../services/jwt-service");
const uploadService = require("../services/upload-service");
const userService = require("../services/user-service");

const fs = require("fs-extra");
const tryCatch = require("../utils/try-catch-wrapper");
const createError = require("../utils/create-error");

const authController = {};

authController.supporterRegister = tryCatch(async (req, res, next) => {
  const data = req.input;
  const existSupporterEmail = await userService.findUserByEmail(data?.email);
  const existSupporterPhone = await userService.findUserByPhone(data?.phone);
  const existCreatorEmail = await creatorService.findUserByEmail(data?.email);
  const existCreatorPhone = await creatorService.findUserByPhone(data?.phone);

  if (existSupporterEmail || existCreatorEmail) {
    createError({
      message: "Email is already in use",
      statusCode: 400,
      field: "email",
    });
  }

  if (existSupporterPhone || existCreatorPhone) {
    createError({
      message: "Phone number is already in use",
      statusCode: 400,
      field: "phone",
    });
  }

  data.password = await hashService.hash(data.password);
  await userService.createUser(data);
  res.status(201).json({ message: "User is created" });
});

authController.creatorRegister = async (req, res, next) => {
  try {
    const data = req.input;
    const existSupporterEmail = await userService.findUserByEmail(data?.email);
    const existSupporterPhone = await userService.findUserByPhone(data?.phone);
    const existCreatorEmail = await creatorService.findUserByEmail(data?.email);
    const existCreatorPhone = await creatorService.findUserByPhone(data?.phone);

    if (existSupporterEmail || existCreatorEmail) {
      createError({
        message: "Email is already in use",
        statusCode: 400,
        field: "email",
      });
    }

    if (existSupporterPhone || existCreatorPhone) {
      createError({
        message: "Phone number is already in use",
        statusCode: 400,
        field: "phone",
      });
    }

    // upload image
    if (req.file) {
      data.identityImage = await uploadService.upload(req.file.path);
    }

    data.password = await hashService.hash(data.password);
    data.isCreatorAcceptId = IS_CREATOR_ACCEPT_STATUS.PENDING;
    await creatorService.createUser(data);
    res.status(201).json({ message: "Creator is created" });
  } catch (err) {
    next(err);
  } finally {
    fs.emptyDirSync(IDENTITY_IMAGE_DIR);
  }
};

authController.login = tryCatch(async (req, res, next) => {
  const data = req.input;
  const existUser = await userService.findUserByEmail(data?.email);
  if (!existUser) {
    createError({
      message: "Email or password is incorrect",
      statusCode: 400,
    });
  }
  const isMatch = await hashService.compare(data.password, existUser.password);
  if (!isMatch) {
    createError({
      message: "Email or password is incorrect",
      statusCode: 400,
    });
  }

  const accessToken = jwtService.sign({ id: existUser.id });

  res.status(200).json({ accessToken });
});

authController.getMe = (req, res, next) => {
  res.status(200).json({ user: req.user });
};

module.exports = authController;
