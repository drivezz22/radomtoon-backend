const { PRODUCT_STATUS_ID } = require("../constants");
const milestoneService = require("../services/milestone-service");
const productService = require("../services/product-service");
const tryCatch = require("../utils/try-catch-wrapper");

const productController = {};

productController.createProduct = tryCatch(async (req, res) => {
  const { productName, goal, deadline, story, milestoneDetailList = [] } = req.body;

  const productData = {
    creatorId: req.user.id,
    productStatusId: PRODUCT_STATUS_ID.PENDING,
    productName,
    goal,
    deadline: new Date(deadline),
    story,
  };

  const productResult = await productService.createProduct(productData);

  let milestoneResult = [];
  if (milestoneDetailList.length > 0) {
    const milestonePromises = milestoneDetailList.map((el) => {
      const milestoneData = {
        productId: productResult.id,
        milestoneRankId: el.rank,
        approvalStatusId: 1,
        milestoneDetail: el.detail,
      };
      return milestoneService.createProduct(milestoneData);
    });
    milestoneResult = await Promise.all(milestonePromises);
  }

  res.status(201).json({
    message: "Product is created",
    productDetail: productResult,
    milestoneDetail: milestoneResult,
  });
});

module.exports = productController;
