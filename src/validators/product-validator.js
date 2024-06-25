const Joi = require("joi");
const { tierRank } = require("../models/prisma");

const productValidateSchema = {};

productValidateSchema.createProduct = Joi.object({
  productName: Joi.string().required(),
  goal: Joi.number().required(),
  deadline: Joi.date().required(),
  story: Joi.string().required(),
  categoryId: Joi.number().integer().min(1).max(10).required(),
  milestoneDetailList: Joi.array()
    .length(3)
    .required()
    .items(
      Joi.object({
        rank: Joi.number().required(),
        detail: Joi.string().required(),
      })
    ),
  tierDetailList: Joi.array()
    .min(1)
    .max(3)
    .required()
    .items(
      Joi.object({
        tierRankId: Joi.number().required(),
        price: Joi.number().required(),
        tierDetail: Joi.string().required(),
      })
    ),
});

productValidateSchema.updateProduct = Joi.object({
  productName: Joi.string().allow(null),
  goal: Joi.number().allow(null),
  deadline: Joi.date().allow(null),
  story: Joi.string().allow("", null),
  categoryId: Joi.number().integer().min(1).max(10).allow(null),
  milestoneDetailList: Joi.array()
    .allow(null)
    .items(
      Joi.object({
        rank: Joi.number().allow(null),
        detail: Joi.string().allow("", null),
      })
    ),
  tierDetailList: Joi.array()
    .allow(null)
    .items(
      Joi.object({
        tierRankId: Joi.number().allow(null),
        price: Joi.number().allow(null),
        tierDetail: Joi.string().allow("", null),
      })
    ),
});

productValidateSchema.failApproval = Joi.object({
  comment: Joi.string().required(),
});

module.exports = productValidateSchema;
