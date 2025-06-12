const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  icon: String, // e.g., "Calendar", "Star"
  title: String,
  description: String,
  buttonText: String,
});

module.exports = mongoose.model('Announcement', announcementSchema);
