const prisma = require("../models/prisma");

const milestoneService = {};

milestoneService.createMilestone = (data) => prisma.productMilestone.create({ data });

milestoneService.deleteByProductId = (productId) =>
  prisma.productMilestone.deleteMany({ where: { productId } });

milestoneService.getMilestoneByProductId = (productId) =>
  prisma.productMilestone.findMany({ where: { productId } });

module.exports = milestoneService;
