const express = require('express')
const router = express.Router()
const authCheck = require("../../middlewares/authCheck.js");
const ContactsController = require('../../controllers/contacts.js')

router.get('/', authCheck, ContactsController.readAll)

router.get('/:contactId', authCheck, ContactsController.getById)

router.delete('/:contactId', authCheck, ContactsController.deleteOne)

router.post('/', authCheck, ContactsController.postNew)

router.put('/:contactId', authCheck, ContactsController.putOne)

router.patch('/:contactId/favorite', authCheck, ContactsController.updateStatusContact)

module.exports = router
