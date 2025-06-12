const mongoose = require('mongoose');

const GalleryItemSchema = new mongoose.Schema({
  image: String,
  title: String,
  subtitle: String,
  description: String,
  buttonText: String,
});

module.exports = mongoose.model('GalleryItem', GalleryItemSchema);
