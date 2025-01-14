const createError = require("../utils/create-error");
const authValidateSchema = require("../validators/auth-validator");
const commentValidateSchema = require("../validators/comment-validator");
const creatorValidateSchema = require("../validators/creator-validator");
const milestoneValidateSchema = require("../validators/milestone-validator");
const productValidateSchema = require("../validators/product-validator");
const tierValidateSchema = require("../validators/tier-validator");

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
exports.updateEvidenceMilestoneValidator = (req, res, next) =>
  validatorWrapper(milestoneValidateSchema.updateEvidence, req, res, next);
exports.failedApprovalMilestoneValidator = (req, res, next) =>
  validatorWrapper(milestoneValidateSchema.failedApproval, req, res, next);
exports.createMilestoneValidator = (req, res, next) =>
  validatorWrapper(milestoneValidateSchema.create, req, res, next);
exports.updateMilestoneValidator = (req, res, next) =>
  validatorWrapper(milestoneValidateSchema.update, req, res, next);
exports.createTierValidator = (req, res, next) =>
  validatorWrapper(tierValidateSchema.create, req, res, next);
exports.updateTierValidator = (req, res, next) =>
  validatorWrapper(tierValidateSchema.update, req, res, next);
