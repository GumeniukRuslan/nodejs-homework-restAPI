const Joi = require("joi");

const usersSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const subUpdSchema = Joi.object({
  subscription: Joi.string().valid('starter', 'pro', 'business').required()
});


module.exports = {subUpdSchema, usersSchema}
