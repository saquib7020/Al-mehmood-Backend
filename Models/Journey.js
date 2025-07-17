const mongoose = require('mongoose');

const journeySchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  label: String,
  bgColor: String,
  textColor: String
}, { timestamps: true });

module.exports = mongoose.model('Journey', journeySchema);
