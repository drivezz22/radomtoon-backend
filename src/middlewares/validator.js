const createError = require("../utils/create-error");
const authValidateSchema = require("../validators/auth-validator");
const commentValidateSchema = require("../validators/comment-validator");
const creatorValidateSchema = require("../validators/creator-validator");
const productValidateSchema = require("../validators/product-validator");

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
exports.createProductValidator = (req, res, next) =>
  validatorWrapper(productValidateSchema.createProduct, req, res, next);
exports.updateProductValidator = (req, res, next) =>
  validatorWrapper(productValidateSchema.updateProduct, req, res, next);
exports.failApprovalValidator = (req, res, next) =>
  validatorWrapper(productValidateSchema.failApproval, req, res, next);
exports.commentValidator = (req, res, next) =>
  validatorWrapper(commentValidateSchema.create, req, res, next);
