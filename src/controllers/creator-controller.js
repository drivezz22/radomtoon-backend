const dayjs = require("dayjs");
const { IMAGE_DIR, PRODUCT_STATUS_ID, APPROVAL_STATUS_ID } = require("../constants");
const creatorService = require("../services/creator-service");
const uploadService = require("../services/upload-service");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch-wrapper");
const fs = require("fs-extra");
const supportProductService = require("../services/support-product-service");

const creatorController = {};

creatorController.updateInfo = tryCatch(async (req, res) => {
  const data = req.input;

  const result = await creatorService.updateInfo(+req.user.id, data);
  delete result.password;
  res.status(200).json({ message: "Creator about is updated", creatorInfo: result });
});

creatorController.updateProfile = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  } finally {
    fs.emptyDirSync(IMAGE_DIR);
  }
};

creatorController.getCreator = tryCatch(async (req, res) => {
  const existCreatorList = await creatorService.findAllCreator();

  if (!existCreatorList.length) {
    return res.status(200).json({ creatorList: [] });
  }

  const filterValueList = existCreatorList.map((el) => {
    const supportProducts = el.products
      .map((product) => product.supportProducts)
      .map((supporter) => {
        const map = supporter.map((el) => el.userId);
        return map;
      });
    const filterValue = new Set(supportProducts.flat(Infinity));
    const filterValueSize = filterValue.size;
    return {
      id: el.id,
      firstName: el.firstName,
      lastName: el.lastName,
      profileImage: el.profileImage,
      biography: el.biography,
      website: el.website,
      productCount: el.products.length,
      supporterCount: filterValueSize,
      joinAt: dayjs(el.createdAt).format("MMM YYYY"),
    };
  });

  res.status(200).json({ creatorList: filterValueList });
});

creatorController.getDeliveryStatus = tryCatch(async (req, res) => {
  const { productId } = req.params;
  const deliveryStatus = await supportProductService.getSupportByProductId(+productId);
  const deliveryStatusMap = deliveryStatus.map((el) => {
    const approvalStatusObj = {};
    el.product.productMilestones.forEach((element) => {
      approvalStatusObj[element.milestoneRankId] = element.approvalStatusId;
    });
    const data = {};
    const deliveryStatus =
      el.product.productStatus.id !== PRODUCT_STATUS_ID.SUCCESS &&
      approvalStatusObj[1] === APPROVAL_STATUS_ID.SUCCESS &&
      approvalStatusObj[2] === APPROVAL_STATUS_ID.SUCCESS
        ? "NOT AVAILABLE"
        : el.deliveryStatus.status;
    data.productStatusId = el.product.productStatus.id;
    data.productMilestones = el.productMilestones;
    data.tierName = el.tier.tierName;
    data.deliveryStatus = deliveryStatus;
    data.supporterFirstName = el.user.firstName;
    data.supporterLastName = el.user.lastName;
    data.supporterId = el.user.id;
    return data;
  });

  res.status(200).json({ deliveryList: deliveryStatusMap });
});

module.exports = creatorController;
