const Joi = require("joi");

const contactsSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean()
});

const favoriteUpdSchema = Joi.object({
  favorite: Joi.boolean().required()
});

module.exports = {
  contactsSchema,
  favoriteUpdSchema
};