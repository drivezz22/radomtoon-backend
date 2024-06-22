const prisma = require("../models/prisma");

const milestoneService = {};

milestoneService.createProduct = (data) => prisma.productMilestone.create({ data });

module.exports = milestoneService;
