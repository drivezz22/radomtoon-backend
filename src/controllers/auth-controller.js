const {
  IDENTITY_IMAGE_DIR,
  IS_CREATOR_ACCEPT_STATUS,
  USER_ROLE,
} = require("../constants");
const creatorService = require("../services/creator-service");
const hashService = require("../services/hash-service");
const jwtService = require("../services/jwt-service");
const uploadService = require("../services/upload-service");
const userService = require("../services/user-service");

const fs = require("fs-extra");
const tryCatch = require("../utils/try-catch-wrapper");
const createError = require("../utils/create-error");

const authController = {};

const checkUserExistence = async (email, phone) => {
  const existSupporterEmail = await userService.findUserByEmail(email);
  const existSupporterPhone = await userService.findUserByPhone(phone);
  const existCreatorEmail = await creatorService.findUserByEmail(email);
  const existCreatorPhone = await creatorService.findUserByPhone(phone);

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
};

authController.supporterRegister = tryCatch(async (req, res, next) => {
  const data = req.input;
  await checkUserExistence(data?.email, data?.phone);

  data.password = await hashService.hash(data.password);
  await userService.createUser(data);
  res.status(201).json({ message: "User is created" });
});

authController.creatorRegister = async (req, res, next) => {
  try {
    const data = req.input;
    await checkUserExistence(data?.email, data?.phone);

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

authController.creatorApproval = tryCatch(async (req, res, next) => {
  const { creatorId } = req.params;

  const existCreator = await creatorService.findUserById(+creatorId);

  if (!existCreator) {
    createError({
      message: "No this creator Id in DB",
      statusCode: 400,
    });
  }

  if (existCreator.isCreatorAcceptId === IS_CREATOR_ACCEPT_STATUS.ACCEPTED) {
    createError({
      message: "This creator account is already accepted",
      statusCode: 400,
    });
  }

  await creatorService.approveCreatorById(+creatorId);

  res.status(200).json({ message: "This creator is approved" });
});

authController.login = tryCatch(async (req, res, next) => {
  const data = req.input;
  const existSupporterEmail = await userService.findUserByEmail(data?.email);
  const existCreatorEmail = await creatorService.findUserByEmail(data?.email);

  let existUser, role;
  if (existSupporterEmail) {
    existUser = existSupporterEmail;
    role = USER_ROLE.USER;
  } else if (existCreatorEmail) {
    existUser = existCreatorEmail;
    role = USER_ROLE.CREATOR;
  }

  if (!existUser) {
    createError({
      message: "Email or password is incorrect",
      statusCode: 400,
    });
  }

  if (
    role === USER_ROLE.CREATOR &&
    existUser.isCreatorAcceptId === IS_CREATOR_ACCEPT_STATUS.PENDING
  ) {
    createError({
      message: "This creator is waiting for approval",
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

  const accessToken = jwtService.sign({ id: existUser.id, role: role });

  res.status(200).json({ accessToken });
});

authController.getMe = (req, res, next) => {
  res.status(200).json({ user: req.user });
};

module.exports = authController;
