const creatorService = require("../services/creator-service");
const tryCatch = require("../utils/try-catch-wrapper");

const creatorController = {};

creatorController.updateInfo = tryCatch(async (req, res, next) => {
  const { creatorId } = req.params;
  const data = req.input;

  const result = await creatorService.updateInfo(+creatorId, data);

  res.status(200).json({ message: "Creator about is created", creatorInfo: result });
});

module.exports = creatorController;
