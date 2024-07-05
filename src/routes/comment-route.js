const express = require("express");
const { commentValidator } = require("../middlewares/validator");
const commentController = require("../controllers/comment-controller");
const authenticate = require("../middlewares/authenticate");

const commentRouter = express.Router();

commentRouter.post(
  "/product/:productId",
  authenticate,
  commentValidator,
  commentController.createComment
);
commentRouter.patch(
  "/:commentId",
  authenticate,
  commentValidator,
  commentController.updateComment
);
commentRouter.delete("/:commentId", authenticate, commentController.deleteComment);
commentRouter.get("/", commentController.getComment);

module.exports = commentRouter;
