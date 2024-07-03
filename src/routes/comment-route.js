const express = require("express");
const { commentValidator } = require("../middlewares/validator");
const commentController = require("../controllers/comment-controller");

const commentRouter = express.Router();

commentRouter.post(
  "/product/:productId",
  commentValidator,
  commentController.createComment
);
commentRouter.patch("/:commentId", commentValidator, commentController.updateComment);
commentRouter.delete("/:commentId", commentController.deleteComment);
commentRouter.get("/product/:productId", commentController.getComment);

module.exports = commentRouter;
