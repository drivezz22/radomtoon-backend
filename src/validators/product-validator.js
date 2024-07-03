const Joi = require("joi");

const productValidateSchema = {};

productValidateSchema.createProduct = Joi.object({
  productName: Joi.string().trim().required(),
  goal: Joi.number().min(0).required(),
  deadline: Joi.date().greater("now").required(),
  categoryId: Joi.number().integer().min(1).max(10).required(),
  productVideo: Joi.string().trim(),
  productImage: Joi.string().trim().allow("", null),
  summaryDetail: Joi.string().trim().required(),
});

productValidateSchema.updateProduct = Joi.object({
  productName: Joi.string().trim().allow(null),
  goal: Joi.number().min(0).allow(null),
  deadline: Joi.date().greater("now").allow(null),
  categoryId: Joi.number().integer().min(1).max(10).allow(null),
  productVideo: Joi.string().trim().allow(null),
  productImage: Joi.string().trim().allow("", null),
  summaryDetail: Joi.string().trim().allow("", null),
});

productValidateSchema.failApproval = Joi.object({
  comment: Joi.string().required(),
});

module.exports = productValidateSchema;
