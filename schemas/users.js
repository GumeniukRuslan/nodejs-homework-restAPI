const Joi = require("joi");

const usersSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = usersSchema
