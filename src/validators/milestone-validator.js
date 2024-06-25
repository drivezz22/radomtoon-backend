const Joi = require("joi");

const milestoneValidateSchema = {};

milestoneValidateSchema.update = Joi.object({
  evidenceTextDetail: Joi.string().allow("", null),
  evidenceImage: Joi.string().allow("", null),
});

module.exports = milestoneValidateSchema;
