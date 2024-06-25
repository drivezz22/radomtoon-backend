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
  });

productService.findProductById = (productId) =>
  prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

productService.deleteProductById = (id) => prisma.product.deleteMany({ where: { id } });

productService.updateProductById = (id, data) =>
  prisma.product.update({ data, where: { id } });

productService.getAllProduct = () =>
  prisma.product.findMany({
    where: {
      approvalStatusId: APPROVAL_STATUS_ID.SUCCESS,
      productStatusId: { not: PRODUCT_STATUS_ID.FAILED },
    },
    orderBy: { createdAt: "desc" },
    include: { productMilestones: true, productTiers: true },
  });

productService.getAllProductByCreatorId = (creatorId) =>
  prisma.product.findMany({
    where: { creatorId },
    orderBy: { createdAt: "desc" },
    include: { productMilestones: true, productTiers: true },
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
module.exports = productService;
