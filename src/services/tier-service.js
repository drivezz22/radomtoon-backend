const prisma = require("../models/prisma");

const tierService = {};

tierService.createTier = (data) => prisma.productTier.create({ data });
tierService.getTierById = (id) =>
  prisma.productTier.findUnique({ where: { id }, include: { product: true } });
tierService.deleteByProductId = (productId) =>
  prisma.productTier.deleteMany({ where: { productId } });
tierService.getTierByProductId = (productId) =>
  prisma.productTier.findMany({ where: { productId } });
module.exports = tierService;
