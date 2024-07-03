const { APPROVAL_STATUS_ID, USER_ROLE } = require("../constants");
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
  const { id: userId, role } = req.user;

  const existProduct = await productService.findProductById(+productId);
  validateProduct(existProduct);

  let data;
  if (role === USER_ROLE.SUPPORTER) {
    data = { userId, productId: +productId, comment };
  } else if (existProduct.creatorId === userId) {
    data = { productId: +productId, comment };
  }

  if (!data) {
    createError({
      message: "Supporter and creator can comment",
      statusCode: 400,
    });
  }

  const commentResult = await commentService.createComment(data);

  const commentResultMap = [commentResult].map((el) => {
    const commentData = {};
    commentData.id = el.id;
    commentData.userId = el.userId;
    commentData.comment = el.comment;
    commentData.productId = el.productId;
    commentData.time = el.updatedAt;
    commentData.creatorId = el.product.creatorId;
    commentData.creatorFirstName = el.product.creator.firstName;
    commentData.creatorLastName = el.product.creator.lastName;
    commentData.creatorProfileImage = el.product.creator.profileImage;
    if (el.user) {
      commentData.supporterFirstName = el.user.firstName;
      commentData.supporterLastName = el.user.lastName;
      commentData.supporterProfileImage = el.user.profileImage;
    }
    return commentData;
  });

  res.status(201).json({ message: "Comment created", comment: commentResultMap[0] });
});

commentController.updateComment = tryCatch(async (req, res) => {
  const { commentId } = req.params;
  const { comment } = req.body;
  const { id: userId, role } = req.user;

  const existComment = await commentService.findCommentById(+commentId);
  if (!existComment) {
    throw createError({
      message: "This comment does not exist",
      statusCode: 400,
    });
  }
  validateProduct(existComment.product);

  let data;
  if (role === USER_ROLE.SUPPORTER) {
    data = { userId, productId: existComment.productId, comment };
  } else if (existComment.product.creatorId === userId) {
    data = { productId: +existComment.productId, comment };
  }

  if (!data) {
    createError({
      message: "Supporter and creator can comment",
      statusCode: 400,
    });
  }

  const commentResult = await commentService.updateCommentById(+commentId, data);

  const commentResultMap = [commentResult].map((el) => {
    const commentData = {};
    commentData.id = el.id;
    commentData.userId = el.userId;
    commentData.comment = el.comment;
    commentData.productId = el.productId;
    commentData.time = el.updatedAt;
    commentData.creatorId = el.product.creatorId;
    commentData.creatorFirstName = el.product.creator.firstName;
    commentData.creatorLastName = el.product.creator.lastName;
    commentData.creatorProfileImage = el.product.creator.profileImage;
    if (el.user) {
      commentData.supporterFirstName = el.user.firstName;
      commentData.supporterLastName = el.user.lastName;
      commentData.supporterProfileImage = el.user.profileImage;
    }
    return commentData;
  });

  res.status(200).json({ message: "Comment updated", comment: commentResultMap });
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
  const commentResultMap = commentResultList.map((el) => {
    const commentData = {};
    commentData.id = el.id;
    commentData.userId = el.userId;
    commentData.comment = el.comment;
    commentData.productId = el.productId;
    commentData.time = el.updatedAt;
    commentData.creatorId = el.product.creatorId;
    commentData.creatorFirstName = el.product.creator.firstName;
    commentData.creatorLastName = el.product.creator.lastName;
    commentData.creatorProfileImage = el.product.creator.profileImage;
    if (el.user) {
      commentData.supporterFirstName = el.user.firstName;
      commentData.supporterLastName = el.user.lastName;
      commentData.supporterProfileImage = el.user.profileImage;
    }
    return commentData;
  });
  res.status(200).json({ commentList: commentResultMap });
});

module.exports = commentController;
