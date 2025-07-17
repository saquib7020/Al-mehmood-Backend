const mongoose = require('mongoose');

const ContactMessageSchema =new mongoose.Schema({
  state: { type: String, required: true },
  city: { type: String, required: true },
  school: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  grade: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
