const dayjs = require("dayjs");
const productService = require("../services/product-service");

module.exports.checkDeadline = async () => {
  try {
    console.log("Checking for products over deadline...");

    const pendingProducts = await productService.getPendingProduct();
    const today = dayjs();

    const overDeadlineProducts = pendingProducts.filter(
      (product) => dayjs(product.deadline).diff(today, "day") < 0
    );

    if (overDeadlineProducts.length > 0) {
      const passedProductIds = overDeadlineProducts
        .filter((product) => product.totalFund >= product.goal)
        .map((product) => product.id);

      const failedProductIds = overDeadlineProducts
        .filter((product) => product.totalFund < product.goal)
        .map((product) => product.id);

      if (passedProductIds.length > 0) {
        await productService.updateSuccessOverDeadline(passedProductIds);
        console.log("Updated passed products");
      }

      if (failedProductIds.length > 0) {
        await productService.updateFailedOverDeadline(failedProductIds);
        console.log("Updated failed products");
      }
    }
  } catch (err) {
    console.error("Error checking deadlines:", err);
    throw err;
  }
};
