const prisma = require("../models/prisma");

const tierService = {};

tierService.createTier = (data) => prisma.productTier.create({ data });
tierService.getTierById = (id) =>
  prisma.productTier.findUnique({ where: { id }, include: { product: true } });
tierService.deleteByProductId = (productId) =>
  prisma.productTier.deleteMany({ where: { productId } });
tierService.getTierByProductId = (productId) =>
  prisma.productTier.findMany({ where: { productId } });

tierService.getTierByProductIdAndRankId = (productId, tierRankId) =>
  prisma.productTier.findFirst({
    where: { productId, tierRankId },
    include: { product: true },
  });

tierService.updateTier = (id, data) => prisma.productTier.update({ data, where: { id } });
tierService.deleteTier = (id) => prisma.productTier.delete({ where: { id } });

module.exports = tierService;
