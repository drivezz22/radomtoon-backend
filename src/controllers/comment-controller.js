const { APPROVAL_STATUS_ID } = require("../constants");
const commentService = require("../services/comment-service");
const productService = require("../services/product-service");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch-wrapper");

const commentController = {};

const validateProduct = (product) => {
  if (!product) {
    throw createError({
      message: "This product does not exist",
      statusCode: 400,
    });
  }

  if (product.approvalStatusId !== APPROVAL_STATUS_ID.SUCCESS) {
    throw createError({
      message: "Can only comment on approved products",
      statusCode: 400,
    });
  }

  if (product.productStatusId === APPROVAL_STATUS_ID.FAILED) {
    throw createError({
      message: "Cannot comment on products with failed funding",
      statusCode: 400,
    });
  }
};

commentController.createComment = tryCatch(async (req, res) => {
  const { productId } = req.params;
  const { comment } = req.body;
  const { id: userId } = req.user;

  const existProduct = await productService.findProductById(+productId);
  validateProduct(existProduct);

  const data = { userId, productId: +productId, comment };
  const commentResult = await commentService.createComment(data);

  res.status(201).json({ message: "Comment created", comment: commentResult });
});

commentController.updateComment = tryCatch(async (req, res) => {
  const { commentId } = req.params;
  const { comment } = req.body;

  const existComment = await commentService.findCommentById(+commentId);
  if (!existComment) {
    throw createError({
      message: "This comment does not exist",
      statusCode: 400,
    });
  }
  validateProduct(existComment.product);

  const data = { comment };
  const commentResult = await commentService.updateCommentById(+commentId, data);

  res.status(200).json({ message: "Comment updated", comment: commentResult });
});

commentController.deleteComment = tryCatch(async (req, res) => {
  const { commentId } = req.params;

  const existComment = await commentService.findCommentById(+commentId);
  if (!existComment) {
    return res.status(204).end();
  }

  await commentService.deleteCommentById(+commentId);
  res.status(204).end();
});

commentController.getComment = tryCatch(async (req, res) => {
  const { productId } = req.params;

  const commentResultList = await commentService.getCommentByProductId(+productId);
  res.status(200).json({ commentList: commentResultList });
});

module.exports = commentController;
