const contactsFunctions = require('../models/contacts');
const { nanoid } = require("nanoid");
const contactsSchema = require('../schemas/contacts');
const Contact = require('../models/contacts');
console.log(Contact)

async function readAll(req, res, next) {
  try {
    const docs = await Contact.find().exec();
    res.status(200).send(docs);
  } catch (error) {
    next(error);
  }
};

async function getById (req, res, next) {
  const { contactId } = req.params;
  try {
    const docs = await Contact.findById(contactId).exec();
    if (!docs) { 
      return res.status(404).send({ message: 'Not found' })
    }
    res.status(200).send(docs);
  } catch (error) {
    next(error);
  }
};

async function deleteOne (req, res, next) {
  const { contactId } = req.params;
  try {
    const docs = await Contact.findByIdAndDelete(contactId).exec();
    if (!docs) { 
      return res.status(404).send({ message: 'Not found' })
    }
    res.status(200).send({ message: 'contact deleted' })
  } catch (error) {
    next(error);
  }
};

async function postNew (req, res, next) {
  const { error } = contactsSchema.validate(req.body)
  if (error) {
    if (error.details[0].type === "any.required") {
      return res.status(400).send({ message: `missing required ${error.details[0].path[0]} field` });
    }
    return res.status(400).send({ message: error.details[0].message});
  }
  const newContact = {
    id: nanoid(),
    ...req.body
  }
  contactsFunctions.addContact(newContact)
  return res.status(201).send(newContact);
  
};

async function putOne (req, res, next) {
  const { contactId } = req.params;
  const { error } = contactsSchema.validate(req.body)

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
  const updatedContact = await contactsFunctions.updateContact(contactId, newContact)
  if (!updatedContact) {
    return res.status(404).send({ message: 'Not found' })
  }
  return res.status(200).send(updatedContact);
};

module.exports = {
  getById,
  readAll,
  deleteOne,
  putOne,
  postNew,
}