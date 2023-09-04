const fs = require('fs/promises');
const path = require("path");

const contactsPath = path.join(__dirname, "./contacts.json");

const listContacts = async () => {
  const contacts = await fs.readFile(contactsPath)
  return JSON.parse(contacts)
}

const getContactById = async (contactId) => {
  const contacts = await listContacts()
  const result = contacts.find(contact => contact.id === contactId)
  return result || null
}

const removeContact = async (contactId) => {
  const contacts = await listContacts()
  const index = contacts.findIndex(contact => contact.id === contactId)
  if(index === -1){
    return null;
  }
  const result = contacts.splice(index, 1);
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return result[0];
}

const addContact = async (body) => {}

const updateContact = async (contactId, body) => {}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
