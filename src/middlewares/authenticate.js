const jwtService = require("../services/jwt-service");
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
  const user = await userService.findUserById(payload.id);

  if (!user) {
    createError({ message: "The user was not found", statusCode: 400 });
  }
  delete user.password;
  req.user = user;
  next();
});

module.exports = authenticate;
