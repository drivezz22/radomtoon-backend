const Joi = require("joi");

const productValidateSchema = {};

productValidateSchema.createProduct = Joi.object({
  productName: Joi.string().required(),
  goal: Joi.number().required(),
  deadline: Joi.date().required(),
  categoryId: Joi.number().integer().min(1).max(10).required(),
  productVideo: Joi.string(),
  productImage: Joi.string().allow("", null),
  summaryDetail: Joi.string().required(),
});

productValidateSchema.updateProduct = Joi.object({
  productName: Joi.string().allow(null),
  goal: Joi.number().allow(null),
  deadline: Joi.date().allow(null),
  categoryId: Joi.number().integer().min(1).max(10).allow(null),
  productVideo: Joi.string().allow(null),
  productImage: Joi.string().allow("", null),
  summaryDetail: Joi.string().allow("", null),
});

productValidateSchema.updateStory = Joi.object({
  story: Joi.string().required(),
});

productValidateSchema.failApproval = Joi.object({
  comment: Joi.string().required(),
});

module.exports = productValidateSchema;
