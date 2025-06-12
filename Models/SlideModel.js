const mongoose = require('mongoose');

const SlideSchema = new mongoose.Schema({
  image: String,
  title: String,
  subtitle: String,
});

module.exports = mongoose.model('Slide', SlideSchema);
