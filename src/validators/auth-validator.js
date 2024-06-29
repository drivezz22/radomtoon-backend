const Joi = require("joi");

const authValidateSchema = {};

authValidateSchema.supporterRegister = Joi.object({
  email: Joi.string().email({ tlds: false }),
  firstName: Joi.string().required().trim(),
  lastName: Joi.string().required().trim(),
  phone: Joi.string().pattern(/^\d{10}$/),
  profileImage: Joi.string().allow("", null),
  password: Joi.string()
    .required()
    .pattern(/^[0-9a-zA-Z]{6,}$/),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).strip(),
  address: Joi.string().required().trim(),
  provinceId: Joi.number().required(),
});

authValidateSchema.creatorRegister = Joi.object({
  email: Joi.string().email({ tlds: false }),
  firstName: Joi.string().required().trim(),
  lastName: Joi.string().required().trim(),
  phone: Joi.string().pattern(/^\d{10}$/),
  profileImage: Joi.string().allow("", null),
  identityImage: Joi.string().allow(""),
  password: Joi.string()
    .required()
    .pattern(/^[0-9a-zA-Z]{6,}$/),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).strip(),
  address: Joi.string().required().trim(),
  provinceId: Joi.number().required(),
});

authValidateSchema.login = Joi.object({
  email: Joi.string().email({ tlds: false }),
  password: Joi.string().required(),
});

module.exports = authValidateSchema;
