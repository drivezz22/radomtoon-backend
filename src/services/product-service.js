const { APPROVAL_STATUS_ID, PRODUCT_STATUS_ID } = require("../constants");
const prisma = require("../models/prisma");
const productService = {};

productService.createProduct = (data) =>
  prisma.product.create({
    data,
    include: {
      productMilestones: true,
      productTiers: true,
      creator: true,
      supportProducts: true,
    },
  });

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
    include: {
      productMilestones: true,
      productTiers: true,
      creator: true,
      supportProducts: true,
    },
  });

productService.deleteProductById = (id) => prisma.product.deleteMany({ where: { id } });

productService.updateProductById = (id, data) =>
  prisma.product.update({
    data,
    where: { id },
    include: {
      productMilestones: true,
      productTiers: true,
      creator: true,
      supportProducts: true,
    },
  });

productService.getAllProduct = () =>
  prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      productMilestones: true,
      productTiers: true,
      creator: true,
      supportProducts: true,
    },
  });

productService.getAllProductByCreatorId = (creatorId) =>
  prisma.product.findMany({
    where: { creatorId },
    orderBy: { createdAt: "desc" },
    include: {
      productMilestones: true,
      productTiers: true,
      creator: true,
      supportProducts: true,
    },
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

productService.getAllProject = () =>
  prisma.product.findMany({
    where: { approvalStatusId: APPROVAL_STATUS_ID.SUCCESS },
    include: { supportProducts: { include: { tier: true } } },
  });

productService.getAllSuccessfulOrPendingProjectsBetweenDates = (startDate, endDate) =>
  prisma.product.findMany({
    where: {
      productStatusId: {
        in: [PRODUCT_STATUS_ID.SUCCESS, PRODUCT_STATUS_ID.PENDING],
      },
      totalFund: { gte: 1 },
      deadline: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      categoryId: true,
      category: {
        select: {
          category: true,
        },
      },
      totalFund: true,
      supportProducts: {
        select: { tier: { select: { price: true } }, createdAt: true },
        where: { deletedAt: null },
      },
    },
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

productService.getFiveProductByCategory = (categoryId) =>
  prisma.product.findMany({
    select: {
      id: true,
      productName: true,
      totalFund: true,
      deadline: true,
      approvalStatusId: true,
      productStatusId: true,
      productImage: true,
      creator: {
        select: {
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
      summaryDetail: true,
      goal: true,
      category: {
        select: {
          category: true,
        },
      },
    },
    where: { categoryId, productStatusId: PRODUCT_STATUS_ID.PENDING },
    orderBy: [{ totalFund: "desc" }, { createdAt: "desc" }],
    take: 5,
  });

productService.getFiveProduct = () =>
  prisma.product.findMany({
    select: {
      id: true,
      productName: true,
      totalFund: true,
      deadline: true,
      approvalStatusId: true,
      productStatusId: true,
      productImage: true,
      creator: {
        select: {
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
      summaryDetail: true,
      goal: true,
      category: {
        select: {
          category: true,
        },
      },
    },
    where: { productStatusId: PRODUCT_STATUS_ID.PENDING },
    orderBy: [{ totalFund: "desc" }, { createdAt: "desc" }],
    take: 5,
  });
module.exports = productService;
