const { APPROVAL_STATUS_ID, PRODUCT_STATUS_ID } = require("../constants");
const prisma = require("../models/prisma");
const productService = {};

productService.createProduct = (data) => prisma.product.create({ data });

productService.findProductByCreatorIdAndProductId = (creatorId, productId) =>
  prisma.product.findFirst({
    where: {
      id: productId,
      creatorId,
    },
    include: { productMilestones: true, productTiers: true },
  });

productService.findProductById = (productId) =>
  prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: { creator: true },
  });

productService.deleteProductById = (id) => prisma.product.deleteMany({ where: { id } });

productService.updateProductById = (id, data) =>
  prisma.product.update({ data, where: { id } });

productService.getAllProduct = () =>
  prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { productMilestones: true, productTiers: true, creator: true },
  });

productService.getAllProductByCreatorId = (creatorId) =>
  prisma.product.findMany({
    where: { creatorId },
    orderBy: { createdAt: "desc" },
    include: { productMilestones: true, productTiers: true, creator: true },
  });

productService.getAllProductForAdmin = () =>
  prisma.product.findMany({
    where: {
      approvalStatusId: { in: [APPROVAL_STATUS_ID.FAILED, APPROVAL_STATUS_ID.SUCCESS] },
    },
    include: { webProfits: true },
  });

productService.failApproval = (id) =>
  prisma.product.update({
    data: {
      approvalStatusId: APPROVAL_STATUS_ID.FAILED,
    },
    where: { id },
  });

productService.passApproval = (id) =>
  prisma.product.update({
    data: {
      approvalStatusId: APPROVAL_STATUS_ID.SUCCESS,
      productStatusId: PRODUCT_STATUS_ID.PENDING,
    },
    where: { id },
  });

productService.getPendingApprovalProduct = () =>
  prisma.product.findMany({
    where: { approvalStatusId: APPROVAL_STATUS_ID.PENDING },
  });

productService.updateFund = (id, updateFund) =>
  prisma.product.update({ data: { totalFund: updateFund }, where: { id } });

productService.updateAvailableFund = (id, updateFund) =>
  prisma.product.update({ data: { availableFund: updateFund }, where: { id } });

productService.getPendingProduct = () =>
  prisma.product.findMany({
    where: { productStatusId: PRODUCT_STATUS_ID.PENDING },
    include: { supportProducts: { include: { user: true } } },
  });

productService.updateSuccessOverDeadline = (productIdList) =>
  prisma.product.updateMany({
    data: { productStatusId: PRODUCT_STATUS_ID.SUCCESS },
    where: { id: { in: productIdList } },
  });

productService.updateFailedOverDeadline = (productIdList) =>
  prisma.product.updateMany({
    data: { productStatusId: PRODUCT_STATUS_ID.FAILED },
    where: { id: { in: productIdList } },
  });

productService.getAllSuccessProject = () =>
  prisma.product.findMany({
    where: { productStatusId: PRODUCT_STATUS_ID.SUCCESS },
    include: { supportProducts: { include: { tier: true } } },
  });

productService.getAllSuccessProjectFilterByStartEndDate = (startDate, endDate) =>
  prisma.product.findMany({
    where: {
      productStatusId: PRODUCT_STATUS_ID.SUCCESS,
      deadline: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: { supportProducts: { include: { tier: true } } },
  });

productService.getAllProjectFilterByStartEndDate = (startDate, endDate) =>
  prisma.product.findMany({
    where: {
      deadline: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

productService.getApprovalProduct = () =>
  prisma.product.findMany({
    where: { approvalStatusId: APPROVAL_STATUS_ID.SUCCESS },
  });

productService.checkCreatorIdMatchProductId = (creatorId, productId) =>
  prisma.product.findMany({ where: { creatorId: creatorId, id: productId } });

productService.updateApprovePending = (productId) =>
  prisma.product.update({
    where: { id: productId },
    data: { approvalStatusId: APPROVAL_STATUS_ID.PENDING },
  });

module.exports = productService;
