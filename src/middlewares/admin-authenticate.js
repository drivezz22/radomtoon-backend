const createError = require("../utils/create-error");

const adminAuthenticate = (req, res, next) => {
  if (!req.user.isAdmin) {
    createError({
      message: "User has no access rights",
      statusCode: 403,
    });
  }

  next();
};
module.exports = adminAuthenticate;
