const creatorService = require("../services/creator-service");
const uploadService = require("../services/upload-service");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch-wrapper");

const creatorController = {};

creatorController.updateInfo = tryCatch(async (req, res, next) => {
  const data = req.input;

  const result = await creatorService.updateInfo(+req.user.id, data);
  delete result.password;
  res.status(200).json({ message: "Creator about is updated", creatorInfo: result });
});

creatorController.updateProfile = tryCatch(async (req, res) => {
  const { id } = req.user;
  const existCreator = await creatorService.findUserById(+id);
  if (!existCreator) {
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

  if (existCreator.productImage) {
    await uploadService.delete(existCreator.productImage);
  }
  const profileImage = await uploadService.upload(req.file.path);
  const user = await creatorService.updateInfo(+id, { profileImage });
  delete user.password;
  res.status(200).json({ message: "Profile image is updated", user });
});

creatorController.getCreator = tryCatch(async (req, res) => {
  const existCreatorList = await creatorService.findAllCreator();
  if (!existCreatorList.length) {
    return res.status(200).json({ creatorList: [] });
  }
  const filterValueList = existCreatorList.map((el) => ({
    id: el.id,
    firstName: el.firstName,
    lastName: el.lastName,
    profileImage: el.profileImage,
    biography: el.biography,
    website: el.website,
  }));

  res.status(200).json({ creatorList: filterValueList });
});

module.exports = creatorController;
