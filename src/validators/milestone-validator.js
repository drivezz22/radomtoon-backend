const Joi = require("joi");

const milestoneValidateSchema = {};

milestoneValidateSchema.update = Joi.object({
  evidenceTextDetail: Joi.string().allow("", null),
  evidenceImage: Joi.string().allow("", null),
});

milestoneValidateSchema.failedApproval = Joi.object({
  comment: Joi.string().required(),
});

module.exports = milestoneValidateSchema;
