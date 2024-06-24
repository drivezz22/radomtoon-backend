const Joi = require("joi");

const creatorValidateSchema = {};

creatorValidateSchema.createAbout = Joi.object({
  biography: Joi.string().allow("", null),
  website: Joi.string().allow("", null),
});

module.exports = creatorValidateSchema;
