const Joi = require("joi");

const productValidateSchema = {};

productValidateSchema.createProduct = Joi.object({
  productName: Joi.string().required(),
  goal: Joi.number().required(),
  deadline: Joi.date().required(),
  story: Joi.string().required(),
  milestoneDetailList: Joi.array().length(3).required().items(Joi.object()),
});

module.exports = productValidateSchema;
