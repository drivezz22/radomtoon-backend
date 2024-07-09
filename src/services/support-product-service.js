const { DELIVERY_STATUS_ID } = require("../constants");
const prisma = require("../models/prisma");

const supportProductService = {};

supportProductService.createSupportProduct = (data) =>
  prisma.supportProduct.create({
    data,
    include: {
      product: { include: { productStatus: true } },
      tier: { include: { tierRank: true } },
      deliveryStatus: true,
    },
  });

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
    orderBy: {
      createdAt: "desc",
    },
  });

supportProductService.getLatestCategory = (supporterId) =>
  prisma.supportProduct.findFirst({
    select: {
      product: {
        select: {
          categoryId: true,
          id: true,
          creatorId: true,
        },
      },
    },
    where: { userId: supporterId },
    orderBy: {
      createdAt: "desc",
    },
  });

supportProductService.getSupportByProductId = (productId) =>
  prisma.supportProduct.findMany({
    where: { productId, deletedAt: null },
    select: {
      product: {
        select: {
          productStatus: true,
          totalFund: true,
          availableFund: true,
          productMilestones: {
            select: {
              milestoneRankId: true,
              approvalStatusId: true,
            },
          },
        },
      },
      tier: { select: { tierRank: true, tierName: true } },
      deliveryStatus: true,
      user: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
    },
  });

supportProductService.getSupport = () => prisma.supportProduct.findMany({});
supportProductService.findSupporterByProductList = (productIdList) =>
  prisma.supportProduct.findMany({
    where: { productId: { in: productIdList }, deletedAt: null },
    include: { user: true },
  });

supportProductService.getAllSupporterProductFilterByStartEndDate = (startDate, endDate) =>
  prisma.supportProduct.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      deletedAt: null,
    },
    include: { tier: true, user: true },
  });

supportProductService.getAllSupporterProductFilterByStartEndDateProductId = (
  startDate,
  endDate,
  productId
) =>
  prisma.supportProduct.findMany({
    where: {
      productId: productId,
      deletedAt: null,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: { tier: true, user: true },
  });

module.exports = supportProductService;
