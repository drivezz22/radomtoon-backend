const prisma = require("../models/prisma");

const commentService = {};

commentService.createComment = (data) => prisma.comment.create({ data });

commentService.findCommentById = (id) =>
  prisma.comment.findUnique({ where: { id }, include: { product: true } });
commentService.updateCommentById = (id, data) =>
  prisma.comment.update({ data, where: { id } });
commentService.deleteCommentById = (id) => prisma.comment.delete({ where: { id } });
commentService.getCommentByProductId = (productId) =>
  prisma.comment.findMany({ where: { productId } });

module.exports = commentService;
