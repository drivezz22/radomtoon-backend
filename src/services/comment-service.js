const prisma = require("../models/prisma");

const commentService = {};

commentService.createComment = (data) =>
  prisma.comment.create({
    data,
    include: { product: { include: { creator: true } }, user: true },
  });

commentService.findCommentById = (id) =>
  prisma.comment.findUnique({ where: { id }, include: { product: true } });
commentService.updateCommentById = (id, data) =>
  prisma.comment.update({
    data,
    where: { id },
    include: { product: { include: { creator: true } }, user: true },
  });
commentService.deleteCommentById = (id) => prisma.comment.delete({ where: { id } });
commentService.getCommentByProductId = (productId) =>
  prisma.comment.findMany({
    where: { productId },
    include: { product: { include: { creator: true } }, user: true },
    orderBy: {
      updatedAt: "desc",
    },
  });

module.exports = commentService;
