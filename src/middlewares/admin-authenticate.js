const { USER_ROLE } = require("../constants");
const createError = require("../utils/create-error");

const adminAuthenticate = (req, res, next) => {
  if (req.user.role !== USER_ROLE.ADMIN) {
    createError({
      message: "Only for admin",
      statusCode: 403,
    });
  }

  next();
};
module.exports = adminAuthenticate;
