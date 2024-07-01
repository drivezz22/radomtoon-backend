const Joi = require("joi");

const tierValidateSchema = {};

tierValidateSchema.create = Joi.object({
  tierRankId: Joi.number().integer().min(1).max(3).required(),
  tierName: Joi.string().required(),
  tierImage: Joi.string().allow("", null),
  price: Joi.number().required(),
  tierDetail: Joi.string().required(),
});

tierValidateSchema.update = Joi.object({
  tierName: Joi.string().allow("", null),
  tierImage: Joi.string().allow("", null),
  price: Joi.number().allow(null),
  tierDetail: Joi.string().allow("", null),
});

module.exports = tierValidateSchema;
