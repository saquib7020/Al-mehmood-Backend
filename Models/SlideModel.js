const mongoose = require('mongoose');

const SlideSchema = new mongoose.Schema({
  title: {
    type: String,
    
  },
  description: {
    type: String,
    
  },
  bgColor: {
    type: String,
    
  },
  accentColor: {
    type: String,
    
  },

  stats: {
    type: String,
    
  },
  features: [{
    type: String,
    
  }],
  image: {
    type: String // Optional field for uploaded images
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Slide', SlideSchema);