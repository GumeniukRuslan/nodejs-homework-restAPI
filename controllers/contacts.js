const contactsSchemas = require('../schemas/contacts');
const Contact = require('../models/contacts');
const mongoose = require('mongoose');

async function readAll(req, res, next) {
  try {
    const doc = await Contact.find({ owner: req.user.id }).exec();
    if (!doc.length) {
      return res.status(404).send({ message: 'You don`t have any contacts' });
    }
    res.status(200).send(doc);
  } catch (error) {
    next(error);
  }
};

async function getById (req, res, next) {
  const { contactId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).send({ message: 'Invalid ID' });
  }
  try {
    const doc = await Contact.findById(contactId).exec();
    if (!doc || doc.owner !== req.user.id) { 
      return res.status(404).send({ message: 'Not found' })
    }
    res.status(200).send(doc);
  } catch (error) {
    next(error);
  }
};

async function deleteOne (req, res, next) {
  const { contactId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).send({ message: 'Invalid ID' });
  }
  try {
    const doc = await Contact.find(contactId).exec();
    if (!doc || doc.owner !== req.user.id) { 
      return res.status(404).send({ message: 'Not found' })
    }
    await Contact.findByIdAndDelete(contactId).exec();
    res.status(200).send({ message: 'contact deleted' })
  } catch (error) {
    next(error);
  }
};

async function postNew (req, res, next) {
  const { error } = contactsSchemas.contactsSchema.validate(req.body)
  if (error) {
    if (error.details[0].type === "any.required") {
      return res.status(400).send({ message: `missing required ${error.details[0].path[0]} field` });
    }
    return res.status(400).send({ message: error.details[0].message});
  }
  console.log(req.user)
  const newContact = {
    ...req.body,
    favorite: true,
    owner: req.user._id,
  }
  try {
    const doc = await Contact.create(newContact);
    res.status(201).send(doc);
  } catch (error) {
    next(error);
  }
};

async function putOne (req, res, next) {
  const { contactId } = req.params;
  const { error } = contactsSchemas.contactsSchema.validate(req.body)
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).send({ message: 'Invalid ID' });
  }

  if (!Object.keys(req.body).length) { 
    return res.status(400).send({ message: `missing fields` });
  }
  if (error) {
    if (error.details[0].type === "any.required") {
      return res.status(400).send({ message: `missing required ${error.details[0].path[0]} field` });
    }
    return res.status(400).send({ message: error.details[0].message});
  }
  const newContact = {
    ...req.body
  }
  const doc = await Contact.findByIdAndUpdate(contactId, newContact, { new: true }).exec();
  if (!doc) {
    return res.status(404).send({ message: 'Not found' })
  }
  return res.status(200).send(doc);
};

async function updateStatusContact (req, res, next) {
  const { contactId } = req.params;
  const { error } = contactsSchemas.favoriteUpdSchema.validate(req.body)
  
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).send({ message: 'Invalid ID' });
  }

  if (!Object.keys(req.body).length) { 
    return res.status(400).send({ message: `missing field favorite` });
  }
  if (error) {
      if (error.details[0].type === "any.required") {
        return res.status(400).send({ message: `missing required ${error.details[0].path[0]} field` });
      }
      return res.status(400).send({ message: error.details[0].message});
  }
  const newContact = {
    ...req.body
  }
  const doc = await Contact.findByIdAndUpdate(contactId, newContact, { new: true }).exec();
  if (!doc || doc.owner !== req.user.id) {
    return res.status(404).send({ message: 'Not found' })
  }
  return res.status(200).send(doc);
};

module.exports = {
  getById,
  readAll,
  deleteOne,
  putOne,
  postNew,
  updateStatusContact
}