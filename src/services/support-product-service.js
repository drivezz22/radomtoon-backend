const { DELIVERY_STATUS_ID } = require("../constants");
const prisma = require("../models/prisma");

const supportProductService = {};

supportProductService.createSupportProduct = (data) =>
  prisma.supportProduct.create({ data });

supportProductService.getSupportBySupporterIdAndProductId = (userId, productId) =>
  prisma.supportProduct.findFirst({
    where: { userId, productId, deletedAt: null },
    include: {
      product: { include: { productMilestones: true } },
      tier: true,
      user: true,
    },
  });

supportProductService.deleteSupportProductById = (id) =>
  prisma.supportProduct.update({ data: { deletedAt: new Date() }, where: { id } });

supportProductService.updateDeliveryById = (id) =>
  prisma.supportProduct.update({
    data: { deliveryStatusId: DELIVERY_STATUS_ID.DELIVERED },
    where: { id },
  });

supportProductService.getSupportBySupporterId = (supporterId) =>
  prisma.supportProduct.findMany({
    where: { userId: supporterId },
    include: {
      product: { include: { productStatus: true } },
      tier: { include: { tierRank: true } },
      deliveryStatus: true,
    },
  });

supportProductService.getSupportByProductId = (productId) =>
  prisma.supportProduct.findMany({
    where: { productId },
    include: {
      product: { include: { productStatus: true } },
      tier: { include: { tierRank: true } },
      deliveryStatus: true,
      user: true,
    },
  });

supportProductService.getSupport = () => prisma.supportProduct.findMany({});
supportProductService.findSupporterByProductList = (productIdList) =>
  prisma.supportProduct.findMany({
    where: { productId: { in: productIdList }, deletedAt: null },
    include: { user: true },
  });

module.exports = supportProductService;
