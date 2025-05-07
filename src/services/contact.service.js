const Contact = require('../models/contact.model');
const { sendMailContact } = require('../email');
const { contactTemplate } = require('../lib/email-template/contact');
const jwt = require('jsonwebtoken');

const createContact = async ({ email, name, message }) => {
  const contact = new Contact({ email, name, message });
  await contact.save();
  const result = await sendMailContact({
    email: email, 
    subject: `Liên hệ từ người dùng: ${name}`, 
    html: contactTemplate(email, name, message)
  });
  return result;
};

const getAllContacts = async () => {
  return await Contact.find().sort({ createdAt: -1 });
};

module.exports = {
  createContact,
  getAllContacts,
};
