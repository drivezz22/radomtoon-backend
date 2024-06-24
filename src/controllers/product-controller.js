const { MILESTONE_RANK_ID, APPROVAL_STATUS_ID } = require("../constants");
const milestoneService = require("../services/milestone-service");
const productService = require("../services/product-service");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch-wrapper");

const productController = {};

productController.createProduct = tryCatch(async (req, res) => {
  const { productName, goal, deadline, story, milestoneDetailList = [] } = req.body;

  const productData = {
    creatorId: req.user.id,
    productName,
    approvalStatusId: APPROVAL_STATUS_ID.PENDING,
    goal: +goal,
    deadline: new Date(deadline),
    story,
  };
  console.log("productData", productData);
  const productResult = await productService.createProduct(productData);

  let milestoneResult = [];

  // Validate milestones
  const milestoneRanks = milestoneDetailList.map((el) => el.rank);
  const milestoneRanksSet = new Set(milestoneRanks);

  if (milestoneRanksSet.size !== milestoneRanks.length) {
    throw createError({
      message: "Some milestones have the same rank",
      statusCode: 400,
    });
  }

  const isFoundAllMilestoneRank = milestoneRanks.every((r) =>
    Object.values(MILESTONE_RANK_ID).includes(r)
  );
  if (!isFoundAllMilestoneRank) {
    throw createError({
      message: "Incorrect milestone rank",
      statusCode: 400,
    });
  }

  const milestonePromises = milestoneDetailList.map((el) => {
    const milestoneData = {
      productId: productResult.id,
      milestoneRankId: el.rank,
      approvalStatusId: APPROVAL_STATUS_ID.PENDING,
      milestoneDetail: el.detail,
    };
    return milestoneService.createProduct(milestoneData);
  });
  milestoneResult = await Promise.all(milestonePromises);

  res.status(201).json({
    message: "Product is created",
    productDetail: productResult,
    milestoneDetail: milestoneResult,
  });
});

module.exports = productController;
