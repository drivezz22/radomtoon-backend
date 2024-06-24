const prisma = require("../models/prisma");

const adminService = {};

adminService.findUserByEmail = (email) => prisma.admin.findFirst({ where: { email } });
adminService.findUserById = (id) => prisma.admin.findUnique({ where: { id } });

module.exports = adminService;
