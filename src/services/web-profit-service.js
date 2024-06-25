const prisma = require("../models/prisma");

const webProfitService = {};

webProfitService.findProfitById = (productId) =>
  prisma.webProfit.findFirst({ where: { productId } });
webProfitService.createProfit = (data) => prisma.webProfit.create({ data });
webProfitService.updateProfitById = (productId, updateFund) =>
  prisma.webProfit.update({ data: { totalProfit: updateFund }, where: { productId } });

module.exports = webProfitService;
