const { IS_CREATOR_ACCEPT_STATUS } = require("../constants");
const createError = require("../utils/create-error");

const creatorAuthenticate = (req, res, next) => {
  if (req.user.isCreatorAcceptId !== IS_CREATOR_ACCEPT_STATUS.ACCEPTED) {
    createError({
      message: "Only for creator",
      statusCode: 403,
    });
  }

  next();
};
module.exports = creatorAuthenticate;
