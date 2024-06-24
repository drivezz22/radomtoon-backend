const prisma = require("../models/prisma");
const productService = {};

productService.createProduct = (data) => prisma.product.create({ data });

productService.findProductById = (creatorId, productId) =>
  prisma.product.findFirst({
    where: {
      id: productId,
      creatorId,
    },
  });
productService.deleteProductById = (id) => prisma.product.deleteMany({ where: { id } });

productService.updateProductById = (id, data) =>
  prisma.product.update({ data, where: { id } });

module.exports = productService;
