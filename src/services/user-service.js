const prisma = require("../models/prisma");

const userService = {};

userService.findUserByEmail = (email) => prisma.user.findFirst({ where: { email } });
userService.findUserByPhone = (phone) => prisma.user.findFirst({ where: { phone } });
userService.findUserById = (id) => prisma.user.findUnique({ where: { id } });

userService.createUser = (data) => prisma.user.create({ data });

module.exports = userService;
