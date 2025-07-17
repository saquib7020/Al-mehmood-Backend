const mongoose = require('mongoose');

const GalleryItemSchema =  new mongoose.Schema({
  title: { type: String},
  artist: { type: String, },
  grade: { type: String, },
  category: { type: String, },
  imageUrl: { type: String, },
  description: { type: String, },
  award: { type: String, enum: ['Gold', 'Silver', 'Bronze', ''], default: '' },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('GalleryItem', GalleryItemSchema);
