const Joi = require("joi");

const milestoneValidateSchema = {};

milestoneValidateSchema.updateEvidence = Joi.object({
  evidenceTextDetail: Joi.string().allow("", null),
  evidenceImage: Joi.string().allow("", null),
});

milestoneValidateSchema.failedApproval = Joi.object({
  comment: Joi.string().required(),
});

milestoneValidateSchema.create = Joi.object({
  milestoneRankId: Joi.number().integer().min(1).max(3).required(),
  milestoneDetail: Joi.string().required(),
});

milestoneValidateSchema.update = Joi.object({
  milestoneDetail: Joi.string().allow(null, ""),
});

module.exports = milestoneValidateSchema;
