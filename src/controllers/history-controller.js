const { PRODUCT_STATUS_ID } = require("../constants");
const supportProductService = require("../services/support-product-service");
const tryCatch = require("../utils/try-catch-wrapper");

const historyController = {};

historyController.getHistoryBySupporterId = tryCatch(async (req, res) => {
  const supporterHistory = await supportProductService.getSupportBySupporterId(
    +req.user.id
  );
  const mapHistories = supporterHistory.map((el) => {
    const deliveryStatus =
      el.product.productStatus.id === PRODUCT_STATUS_ID.SUCCESS
        ? el.deliveryStatus.status
        : "NOT AVAILABLE";
    const fundingStatus = el.deletedAt ? "CANCEL" : el.product.productStatus.status;
    const histories = {
      productId: el.product.id,
      projectName: el.product.productName,
      tierName: el.tier.tierName,
      price: el.tier.price,
      data: el.createdAt,
      fundingStatus,
      deliveryStatus,
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
