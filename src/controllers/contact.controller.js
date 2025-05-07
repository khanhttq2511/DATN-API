const contactService = require('../services/contact.service');

// ------------------------- // 
const createContact = async (req, res) => {
  try {
    const { email, name, message } = req.body;
    if (!email || !name || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const contact = await contactService.createContact({ email, name, message });
    return res.status(201).json(contact);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getContacts = async (req, res) => {
  try {
    const contacts = await contactService.getAllContacts();
    return res.status(200).json(contacts);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createContact,
  getContacts,
};
