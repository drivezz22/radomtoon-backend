const supportProductService = require("../services/support-product-service");
const tryCatch = require("../utils/try-catch-wrapper");

const historyController = {};

historyController.getHistoryBySupporterId = tryCatch(async (req, res) => {
  const supporterHistory = await supportProductService.getSupportBySupporterId(
    +req.user.id
  );
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

historyController.getHistoryByProductId = tryCatch(async (req, res, next) => {
  const { productId } = req.params;
  const supporterHistory = await supportProductService.getSupportByProductId(+productId);
  const mapHistories = supporterHistory.map((el) => {
    const histories = {
      name: `${el.user.firstName} ${el.user.lastName}`,
      tier: el.tier.tierRank.tier,
      spendMoney: el.tier.price,
      deliveryStatus: el.deliveryStatus.status,
    };
    return histories;
  });
  res.status(200).json({ supporterHistory: mapHistories });
});

module.exports = historyController;
