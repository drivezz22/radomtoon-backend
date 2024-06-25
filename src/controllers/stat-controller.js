const productService = require("../services/product-service");
const supportProductService = require("../services/support-product-service");
const webProfitService = require("../services/web-profit-service");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch-wrapper");

const statController = {};

const getCommonStats = async () => {
  const successProjects = await productService.getAllSuccessProject();
  const totalProjectCount = successProjects.length;
  const totalFunding = successProjects.reduce((acc, { totalFund }) => acc + totalFund, 0);

  const supportProjects = await supportProductService.getSupport();
  const totalContributions = supportProjects.length;

  return {
    totalProjectCount,
    totalFunding,
    totalContributions,
  };
};

statController.getAdminStat = tryCatch(async (req, res) => {
  const { totalProjectCount, totalFunding, totalContributions } = await getCommonStats();

  const webProfits = await webProfitService.getAllProfit();
  const totalWebProfit = webProfits.reduce(
    (acc, { totalProfit }) => acc + totalProfit,
    0
  );

  const stat = {
    projectSupport: totalProjectCount,
    towardIdea: totalFunding,
    contribution: totalContributions,
    webProfit: totalWebProfit,
  };

  res.status(200).json({ stat });
});

statController.getStatByProduct = tryCatch(async (req, res) => {
  const { productId } = req.params;
  const supportProjects = await supportProductService.getSupportByProductId(+productId);
  const supporterCount = supportProjects.length;

  const product = await productService.findProductByCreatorIdAndProductId(
    req.user.id,
    +productId
  );
  if (!product) {
    createError({
      message: "No product created by this creator",
      statusCode: 400,
    });
  }

  const { totalFund, availableFund } = product;

  const stat = {
    supporter: supporterCount,
    totalFund,
    availableFund,
  };

  res.status(200).json({ stat });
});

statController.getStat = tryCatch(async (req, res) => {
  const { totalProjectCount, totalFunding, totalContributions } = await getCommonStats();

  const stat = {
    projectSupport: totalProjectCount,
    towardIdea: totalFunding,
    contribution: totalContributions,
  };

  res.status(200).json({ stat });
});

module.exports = statController;
