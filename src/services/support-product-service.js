const { DELIVERY_STATUS_ID } = require("../constants");
const prisma = require("../models/prisma");

const supportProductService = {};

supportProductService.createSupportProduct = (data) =>
  prisma.supportProduct.create({ data });

supportProductService.getSupportBySupporterIdAndProductId = (supporterId, productId) =>
  prisma.supportProduct.findFirst({
    where: { userId: supporterId, productId, deletedAt: null },
    include: { product: { include: { productMilestones: true } }, tier: true },
  });

supportProductService.deleteSupportProductById = (id) =>
  prisma.supportProduct.update({ data: { deletedAt: new Date() }, where: { id } });

supportProductService.updateDeliveryById = (id) =>
  prisma.supportProduct.update({
    data: { deliveryStatusId: DELIVERY_STATUS_ID.DELIVERED },
    where: { id },
  });

module.exports = supportProductService;
