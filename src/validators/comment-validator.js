const Joi = require("joi");

const commentValidateSchema = {};

commentValidateSchema.create = Joi.object({
  comment: Joi.string().required(),
});

module.exports = commentValidateSchema;
