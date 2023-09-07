const express = require('express')
const router = express.Router()
const ContactsController = require('../../controllers/contacts.js')

router.get('/', ContactsController.readAll)

router.get('/:contactId', ContactsController.getById)

router.delete('/:contactId', ContactsController.deleteOne)

router.post('/', ContactsController.postNew)

router.put('/:contactId', ContactsController.putOne)

module.exports = router
