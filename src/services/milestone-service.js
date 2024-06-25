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

module.exports = milestoneService;
