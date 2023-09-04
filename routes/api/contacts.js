const express = require('express')
const contactsFunctions = require('../../models/contacts')

const router = express.Router()

router.get('/', async (req, res, next) => {
  const contacts = await contactsFunctions.listContacts()
  res.status(200).send(contacts);
})

router.get('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await contactsFunctions.getContactById(contactId)
  if (!contact) {
    return res.status(404).json({ message: 'Not found' })
  }
  res.status(200).send(contact)
})

router.post('/', async (req, res, next) => {
  res.json({ message: 'template message' })
})

router.delete('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await contactsFunctions.removeContact(contactId)
  if (!contact) {
    return res.status(404).json({ message: 'Not found' })
  }
  res.status(200).json({ message: 'contact deleted' })
})

router.put('/:contactId', async (req, res, next) => {
  res.json({ message: 'template message' })
})

module.exports = router
