const express = require("express");

const { createTierValidator, updateTierValidator } = require("../middlewares/validator");
const upload = require("../middlewares/upload");
const tierController = require("../controllers/tier-controller");

const tierRouter = express.Router();

tierRouter.post(
  "/product/:productId",
  upload.single("tierImage"),
  createTierValidator,
  tierController.createTier
);

tierRouter.patch(
  "/:tierId",
  upload.single("tierImage"),
  updateTierValidator,
  tierController.updateTier
);

tierRouter.delete("/:tierId", tierController.deleteTier);

module.exports = tierRouter;
