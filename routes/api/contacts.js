const express = require('express')
const contactsFunctions = require('../../models/contacts')
const { nanoid } = require("nanoid");
const router = express.Router()

const contactsSchema = require('../../schemas/contacts')

router.get('/', async (req, res, next) => {
  const contacts = await contactsFunctions.listContacts()
  res.status(200).send(contacts);
})

router.get('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await contactsFunctions.getContactById(contactId)
  if (!contact) {
    return res.status(404).send({ message: 'Not found' })
  }
  res.status(200).send(contact)
})

router.delete('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await contactsFunctions.removeContact(contactId)
  if (!contact) {
    return res.status(404).send({ message: 'Not found' })
  }
  res.status(200).send({ message: 'contact deleted' })
})

router.post('/', async (req, res, next) => {
  const { error } = contactsSchema.validate(req.body)
  if (error) {
    if (error.details[0].type === "any.required") {
      return res.status(400).send({ message: `missing required ${error.details[0].path[0]} field` });
    }
    return res.status(400).json(error.details[0].message);
  }
  const newContact = {
    id: nanoid(),
    ...req.body
  }
  contactsFunctions.addContact(newContact)
  return res.status(201).send(newContact);
  
})

router.put('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  const { error } = contactsSchema.validate(req.body)

  if (!Object.keys(req.body).length) { 
    return res.status(400).send({ message: `missing fields` });
  }
  if (error) {
    if (error.details[0].type === "any.required") {
      return res.status(400).send({ message: `missing required ${error.details[0].path[0]} field` });
    }
    return res.status(400).json(error.details[0].message);
  }
  const newContact = {
    ...req.body
  }
  const updatedContact = await contactsFunctions.updateContact(contactId, newContact)
  if (!updatedContact) {
    return res.status(404).send({ message: 'Not found' })
  }
  return res.status(200).send(updatedContact);
})

module.exports = router
