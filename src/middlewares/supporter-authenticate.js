const { USER_ROLE } = require("../constants");
const createError = require("../utils/create-error");

const supporterAuthenticate = (req, res, next) => {
  if (req.user.role !== USER_ROLE.SUPPORTER) {
    createError({
      message: "Only for supporter",
      statusCode: 403,
    });
  }

  next();
};
module.exports = supporterAuthenticate;
