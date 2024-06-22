const prisma = require("../models/prisma");

const productService = {};

productService.createProduct = (data) => prisma.product.create({ data });

module.exports = productService;
