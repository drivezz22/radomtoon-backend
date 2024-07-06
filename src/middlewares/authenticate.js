const { USER_ROLE } = require("../constants");
const adminService = require("../services/admin-service");
const creatorService = require("../services/creator-service");
const jwtService = require("../services/jwt-service");
const productService = require("../services/product-service");
const userService = require("../services/user-service");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch-wrapper");

const authenticate = tryCatch(async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    createError({ message: "Unauthenticated", statusCode: 401 });
  }

  const accessToken = authorization.split(" ")[1];
  const payload = jwtService.verify(accessToken);

  let user;

  if (payload.role === USER_ROLE.SUPPORTER) {
    user = await userService.findUserById(payload.id);
  } else if (payload.role === USER_ROLE.CREATOR) {
    user = await creatorService.findUserById(payload.id);
  } else if (payload.role === USER_ROLE.ADMIN) {
    user = await adminService.findUserById(payload.id);
  }

  if (!user) {
    createError({ message: "The user was not found", statusCode: 400 });
  }

  delete user.password;
  user.role = payload.role;

  req.user = user;

  next();
});

module.exports = authenticate;
