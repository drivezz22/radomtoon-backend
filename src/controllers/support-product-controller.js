const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch-wrapper");

const supportProductController = {};

supportProductController.createSupportProduct = tryCatch(async (req, res, next) => {
  // const {tierId} = req.params
  // const existTier = await t
});

module.exports = supportProductController;
