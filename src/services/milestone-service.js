const { APPROVAL_STATUS_ID } = require("../constants");
const prisma = require("../models/prisma");

const milestoneService = {};

milestoneService.createMilestone = (data) => prisma.productMilestone.create({ data });

milestoneService.deleteByProductId = (productId) =>
  prisma.productMilestone.deleteMany({ where: { productId } });

milestoneService.getMilestoneByProductId = (productId) =>
  prisma.productMilestone.findMany({ where: { productId } });

milestoneService.getMilestoneById = (id) =>
  prisma.productMilestone.findUnique({ where: { id }, include: { product: true } });

milestoneService.updateMilestoneById = (id, data) =>
  prisma.productMilestone.update({ data, where: { id } });

milestoneService.failApproval = (id) =>
  prisma.productMilestone.update({
    data: { approvalStatusId: APPROVAL_STATUS_ID.FAILED },
    where: { id },
  });

milestoneService.passApproval = (id) =>
  prisma.productMilestone.update({
    data: { approvalStatusId: APPROVAL_STATUS_ID.SUCCESS },
    where: { id },
  });

milestoneService.getPendingApprovalMilestone = () =>
  prisma.productMilestone.findMany({
    where: { approvalStatusId: APPROVAL_STATUS_ID.PENDING },
  });

module.exports = milestoneService;
