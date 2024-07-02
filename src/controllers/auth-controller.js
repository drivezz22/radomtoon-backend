const { IMAGE_DIR, IS_CREATOR_ACCEPT_STATUS, USER_ROLE } = require("../constants");
const creatorService = require("../services/creator-service");
const hashService = require("../services/hash-service");
const jwtService = require("../services/jwt-service");
const uploadService = require("../services/upload-service");
const userService = require("../services/user-service");

const fs = require("fs-extra");
const tryCatch = require("../utils/try-catch-wrapper");
const createError = require("../utils/create-error");
const adminService = require("../services/admin-service");
const { sendEmail } = require("../utils/node-mailer-config");
const { emailApproval } = require("../utils/mail-content/email-approve");
const { emailReject } = require("../utils/mail-content/email-reject");
const { supportRegisterMail } = require("../utils/mail-content/supporter-register");

const authController = {};

const checkUserExistence = async (email, phone) => {
  const [
    existSupporterEmail,
    existSupporterPhone,
    existCreatorEmail,
    existCreatorPhone,
    existAdminEmail,
  ] = await Promise.all([
    userService.findUserByEmail(email),
    userService.findUserByPhone(phone),
    creatorService.findUserByEmail(email),
    creatorService.findUserByPhone(phone),
    adminService.findUserByEmail(email),
  ]);

  if (existSupporterEmail || existCreatorEmail || existAdminEmail) {
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

const handleApproval = async (req, res, status) => {
  const { creatorId } = req.params;
  const existCreator = await creatorService.findUserById(+creatorId);

  if (!existCreator) {
    throw createError({
      message: "No this creator Id in DB",
      statusCode: 400,
    });
  }

  if (existCreator.isCreatorAcceptId === IS_CREATOR_ACCEPT_STATUS.ACCEPTED) {
    throw createError({
      message: "This creator account is already accepted",
      statusCode: 400,
    });
  }

  if (status === "approve") {
    await sendEmail(existCreator.email, "Creator Registration Successful", emailApproval);
    await creatorService.approveCreatorById(+creatorId);
    res.status(200).json({ message: "This creator is approved" });
  } else if (status === "reject") {
    await sendEmail(existCreator.email, "Creator Registration Unsuccessful", emailReject);
    await creatorService.rejectCreatorById(+creatorId);
    res.status(200).json({ message: "This creator is rejected" });
  }
};

authController.supporterRegister = tryCatch(async (req, res, next) => {
  const data = req.input;
  await checkUserExistence(data?.email, data?.phone);

  data.password = await hashService.hash(data.password);
  await sendEmail(data?.email, "Supporter Registration Successful", supportRegisterMail);
  await userService.createUser(data);
  res.status(201).json({ message: "User is created" });
});

authController.creatorRegister = async (req, res, next) => {
  try {
    const data = req.input;
    await checkUserExistence(data?.email, data?.phone);

    if (!req.file) {
      createError({
        message: "Please select your identity image",
        statusCode: 400,
        field: "identityImage",
      });
    }

    // upload image
    data.identityImage = await uploadService.upload(req.file.path);
    data.provinceId = +data.provinceId;
    data.password = await hashService.hash(data.password);
    data.isCreatorAcceptId = IS_CREATOR_ACCEPT_STATUS.PENDING;
    await creatorService.createUser(data);
    res.status(201).json({ message: "Creator is created" });
  } catch (err) {
    next(err);
  } finally {
    fs.emptyDirSync(IMAGE_DIR);
  }
};

authController.getCreatorApproval = tryCatch(async (req, res) => {
  const existCreator = await creatorService.findAllCreatorPending();
  res.status(200).json({ creatorApprovalList: existCreator });
});

authController.passApproval = tryCatch(async (req, res) => {
  await handleApproval(req, res, "approve");
});

authController.failedApproval = tryCatch(async (req, res) => {
  const { creatorId } = req.params;
  const existCreator = await creatorService.findUserById(+creatorId);
  await handleApproval(req, res, "reject");
  await uploadService.delete(existCreator.identityImage);
});

authController.login = tryCatch(async (req, res) => {
  const data = req.input;
  const [existSupporterEmail, existCreatorEmail, existAdminEmail] = await Promise.all([
    userService.findUserByEmail(data?.email),
    creatorService.findUserByEmail(data?.email),
    adminService.findUserByEmail(data?.email),
  ]);

  let existUser, role;
  if (existSupporterEmail) {
    existUser = existSupporterEmail;
    role = USER_ROLE.SUPPORTER;
  } else if (existCreatorEmail) {
    existUser = existCreatorEmail;
    role = USER_ROLE.CREATOR;
  } else if (existAdminEmail) {
    existUser = existAdminEmail;
    role = USER_ROLE.ADMIN;
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

authController.getMe = (req, res) => {
  res.status(200).json({ user: req.user });
};

authController.updateProfile = tryCatch(async (req, res) => {
  const { id } = req.user;
  const existUser = await userService.findUserById(+id);
  if (!existUser) {
    createError({
      message: "User not found",
      statusCode: 400,
    });
  }

  if (!req.file) {
    createError({
      message: "Please select your profile image",
      statusCode: 400,
      field: "profileImage",
    });
  }

  if (existUser.productImage) {
    await uploadService.delete(existUser.productImage);
  }
  const profileImage = await uploadService.upload(req.file.path);
  await userService.update(+id, { profileImage });
  res.status(200).json({ message: "Profile image is updated" });
});

module.exports = authController;
