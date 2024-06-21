const prisma = require("../models/prisma");

const creatorService = {};

creatorService.findUserByEmail = (email) =>
  prisma.creator.findFirst({ where: { email } });
creatorService.findUserByPhone = (phone) =>
  prisma.creator.findFirst({ where: { phone } });
creatorService.findUserById = (id) => prisma.creator.findUnique({ where: { id } });

creatorService.createUser = (data) => prisma.creator.create({ data });

module.exports = creatorService;
