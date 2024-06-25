const dayjs = require("dayjs");
const productService = require("../services/product-service");
const { supportProduct } = require("../models/prisma");
const supportProductService = require("../services/support-product-service");
const { sendEmail } = require("./node-mailer-config");
const { projectFundFailed } = require("./mail-content/project-fund-failed");
const { projectFundPass } = require("./mail-content/project-fund-pass");

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
        const supporterList = await supportProductService.findSupporterByProductList(
          passedProductIds
        );
        const emailList = supporterList.map((el) => el.user.email);
        await sendEmail("_", "Project Success Funding", projectFundPass, emailList);

        await productService.updateSuccessOverDeadline(passedProductIds);
        console.log("Updated passed products");
      }

      if (failedProductIds.length > 0) {
        const supporterList = await supportProductService.findSupporterByProductList(
          failedProductIds
        );
        const emailList = supporterList.map((el) => el.user.email);
        await sendEmail(
          "_",
          "Project Cancellation and Refund",
          projectFundFailed,
          emailList
        );
        await productService.updateFailedOverDeadline(failedProductIds);
        console.log("Updated failed products");
      }
    }
  } catch (err) {
    console.error("Error checking deadlines:", err);
    throw err;
  }
};
