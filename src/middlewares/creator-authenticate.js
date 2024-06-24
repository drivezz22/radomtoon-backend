const { USER_ROLE } = require("../constants");
const createError = require("../utils/create-error");

const creatorAuthenticate = (req, res, next) => {
  if (req.user.role !== USER_ROLE.CREATOR) {
    createError({
      message: "Only for creator",
      statusCode: 403,
    });
  }

  next();
};
module.exports = creatorAuthenticate;
