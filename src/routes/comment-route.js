const express = require("express");
const { commentValidator } = require("../middlewares/validator");
const supporterAuthenticate = require("../middlewares/supporter-authenticate");
const commentController = require("../controllers/comment-controller");

const commentRouter = express.Router();

commentRouter.post(
  "/product/:productId",
  supporterAuthenticate,
  commentValidator,
  commentController.createComment
);
commentRouter.patch(
  "/:commentId",
  supporterAuthenticate,
  commentValidator,
  commentController.updateComment
);
commentRouter.delete(
  "/:commentId",
  supporterAuthenticate,
  commentController.deleteComment
);
commentRouter.get("/product/:productId", commentController.getComment);

module.exports = commentRouter;
