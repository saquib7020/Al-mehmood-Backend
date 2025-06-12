const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: String,
  artist: String,
  grade: String,
  category: String,
  imageUrl: String,
  likes: Number,
  views: Number,
  award: String,
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Artwork', artworkSchema);
