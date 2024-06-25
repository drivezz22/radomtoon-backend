const supportProductService = require("../services/support-product-service");
const tryCatch = require("../utils/try-catch-wrapper");

const historyController = {};

historyController.getHistoryBySupporterId = tryCatch(async (req, res) => {
  const supporterHistory = await supportProductService.getSupportBySupporterId(
    +req.user.id
  );
  console.log(supporterHistory);
  const mapHistories = supporterHistory.map((el) => {
    const histories = {
      projectName: el.product.productName,
      tier: el.tier.tierRank.tier,
      spendMoney: el.tier.price,
      fundingStatus: el.product.productStatus.status,
      deliveryStatus: el.deliveryStatus.status,
    };
    return histories;
  });
  res.status(200).json({ supporterHistory: mapHistories });
});

module.exports = historyController;
