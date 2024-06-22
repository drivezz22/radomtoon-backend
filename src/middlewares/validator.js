const createError = require("../utils/create-error");
const authValidateSchema = require("../validators/auth-validator");
const creatorValidateSchema = require("../validators/creator-validator");

const validatorWrapper = (schema, req, res, next) => {
  const { value, error } = schema.validate(req.body);
  if (error) {
    return createError({ message: error.details[0].message, statusCode: 400 });
  }
  req.input = value;
  next();
};

exports.supporterRegisterValidator = (req, res, next) =>
  validatorWrapper(authValidateSchema.supporterRegister, req, res, next);
exports.creatorRegisterValidator = (req, res, next) =>
  validatorWrapper(authValidateSchema.creatorRegister, req, res, next);
exports.loginValidator = (req, res, next) =>
  validatorWrapper(authValidateSchema.login, req, res, next);
exports.createAboutValidator = (req, res, next) =>
  validatorWrapper(creatorValidateSchema.createAbout, req, res, next);
