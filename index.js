// ... existing requires and setup
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const StudentArtwork = require('./Models/GalleryModel');
const Announcement = require('./Models/AnnouncementModel');
const ContactMessage = require('./Models/ContactMessage');
const mongoose = require('mongoose');
const Slide=require('./Models/SlideModel')
const Artwork=require('./Models/Artwork')
const app = express();
const PORT = process.env.PORT || 5000;
const Journey=require('./Models/Journey')
require('dotenv').config();

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'images/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ========== GALLERY ROUTES ==========

// Create
app.post('/api/gallery', upload.single('image'), async (req, res) => {
  try {
    const { title, artist, grade, category, description, award } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }
    
    const imageUrl = `${process.env.BASE_URL}/images/${req.file.filename}`;
    
    const newArtwork = new StudentArtwork({
      title,
      artist,
      grade,
      category,
      imageUrl,
      description,
      award: award || '',
      views: 0,
      likes: 0
    });
    
    await newArtwork.save();
    res.status(201).json({ 
      message: 'Artwork uploaded successfully', 
      artwork: newArtwork 
    });
  } catch (error) {
    console.error('Error uploading artwork:', error);
    res.status(500).json({ message: 'Failed to upload artwork' });
  }
});

// READ - Get all artworks
app.get('/api/gallery', async (req, res) => {
  try {
    const artworks = await StudentArtwork.find({}).sort({ createdAt: -1 });
    res.json(artworks);
  } catch (error) {
    console.error('Error fetching artworks:', error);
    res.status(500).json({ message: 'Failed to fetch artworks' });
  }
});

// READ - Get single artwork by ID
app.get('/api/gallery/:id', async (req, res) => {
  try {
    const artwork = await StudentArtwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    res.json(artwork);
  } catch (error) {
    console.error('Error fetching artwork:', error);
    res.status(500).json({ message: 'Failed to fetch artwork' });
  }
});

// UPDATE - Update artwork
app.put('/api/gallery/:id', async (req, res) => {
  try {
    const { title, artist, grade, category, description, award } = req.body;
    
    const updatedArtwork = await StudentArtwork.findByIdAndUpdate(
      req.params.id,
      { title, artist, grade, category, description, award },
      { new: true, runValidators: true }
    );
    
    if (!updatedArtwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    res.json({ 
      message: 'Artwork updated successfully', 
      artwork: updatedArtwork 
    });
  } catch (error) {
    console.error('Error updating artwork:', error);
    res.status(500).json({ message: 'Failed to update artwork' });
  }
});

// UPDATE - Increment views
app.patch('/api/gallery/:id/view', async (req, res) => {
  try {
    const artwork = await StudentArtwork.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    res.json({ views: artwork.views });
  } catch (error) {
    console.error('Error updating views:', error);
    res.status(500).json({ message: 'Failed to update views' });
  }
});

// UPDATE - Toggle like
app.patch('/api/gallery/:id/like', async (req, res) => {
  try {
    const { increment } = req.body; // true to increment, false to decrement
    
    const artwork = await StudentArtwork.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: increment ? 1 : -1 } },
      { new: true }
    );
    
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    res.json({ likes: artwork.likes });
  } catch (error) {
    console.error('Error updating likes:', error);
    res.status(500).json({ message: 'Failed to update likes' });
  }
});

// DELETE - Delete artwork
app.delete('/api/gallery/:id', async (req, res) => {
  try {
    const artwork = await StudentArtwork.findByIdAndDelete(req.params.id);
    
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    // Delete associated image file
    if (artwork.imageUrl) {
      const filename = artwork.imageUrl.split('/images/')[1];
      const filePath = path.join('images', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    console.error('Error deleting artwork:', error);
    res.status(500).json({ message: 'Failed to delete artwork' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ message: error.message });
  }
  
  res.status(500).json({ message: 'Something went wrong!' });
});
// ========== ANNOUNCEMENTS ROUTES ==========

// Create
app.post('/api/announcements', async (req, res) => {
  try {
    const { icon, title, description, buttonText } = req.body;
    const newAnnouncement = new Announcement({ icon, title, description, buttonText });
    await newAnnouncement.save();
    res.status(201).json({ message: 'Announcement added', item: newAnnouncement });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save announcement', erro: err.message });
  }
});

// Read
app.get('/api/announcements', async (req, res) => {
  const items = await Announcement.find({});
  res.json(items);
});

// Update
app.put('/api/announcements/:id', async (req, res) => {
  try {
    const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Announcement not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update announcement' });
  }
});

// Delete
app.delete('/api/announcements/:id', async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete announcement' });
  }
});

// ========== CONTACT ROUTES ==========

// Create
// Create
app.post('/api/contact', async (req, res) => {
  const { 
    state, 
    city, 
    school, 
    firstName, 
    lastName, 
    grade, 
    email, 
    mobile, 
    address 
  } = req.body;

  // Validation
  if (!state || !city || !school || !firstName || !lastName || !grade || !email || !mobile || !address) {
    return res.status(400).json({ 
      message: 'All fields are required.',
      required: ['state', 'city', 'school', 'firstName', 'lastName', 'grade', 'email', 'mobile', 'address']
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  // Mobile validation (10 digits)
  if (!/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ message: 'Mobile number must be exactly 10 digits.' });
  }

  const newMessage = new ContactMessage({
    state,
    city,
    school,
    firstName,
    lastName,
    grade,
    email,
    mobile,
    address
  });

  try {
    await newMessage.save();
    res.status(201).json({ 
      message: 'Enquiry submitted successfully. We will contact you soon.',
      data: {
        id: newMessage._id,
        firstName: newMessage.firstName,
        lastName: newMessage.lastName,
        email: newMessage.email,
        createdAt: newMessage.createdAt
      }
    });
  } catch (err) {
    console.error('Error saving enquiry:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// READ - Get all enquiries (with pagination and filtering)
app.get('/api/contact', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Optional filters
    const filters = {};
    if (req.query.state) filters.state = req.query.state;
    if (req.query.city) filters.city = req.query.city;
    if (req.query.school) filters.school = req.query.school;
    if (req.query.grade) filters.grade = req.query.grade;

    const messages = await ContactMessage.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ContactMessage.countDocuments(filters);

    res.json({
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching enquiries:', err);
    res.status(500).json({ message: 'Server error while fetching enquiries.' });
  }
});

// READ - Get single enquiry by ID
app.get('/api/contact/:id', async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }
    res.json(message);
  } catch (err) {
    console.error('Error fetching enquiry:', err);
    res.status(500).json({ message: 'Server error while fetching enquiry.' });
  }
});

// UPDATE - Update enquiry status or details
app.put('/api/contact/:id', async (req, res) => {
  try {
    const allowedUpdates = ['status', 'notes', 'followUpDate'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.json({ message: 'Enquiry updated successfully', data: message });
  } catch (err) {
    console.error('Error updating enquiry:', err);
    res.status(500).json({ message: 'Failed to update enquiry' });
  }
});

// DELETE - Delete enquiry
app.delete('/api/contact/:id', async (req, res) => {
  try {
    const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }
    res.json({ message: 'Enquiry deleted successfully' });
  } catch (err) {
    console.error('Error deleting enquiry:', err);
    res.status(500).json({ message: 'Failed to delete enquiry' });
  }
});

// ANALYTICS - Get enquiry statistics
app.get('/api/contact/analytics/stats', async (req, res) => {
  try {
    const totalEnquiries = await ContactMessage.countDocuments();
    
    const gradeStats = await ContactMessage.aggregate([
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const schoolStats = await ContactMessage.aggregate([
      { $group: { _id: '$school', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const cityStats = await ContactMessage.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly enquiries for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await ContactMessage.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalEnquiries,
      gradeStats,
      schoolStats,
      cityStats,
      monthlyStats
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ message: 'Server error while fetching analytics.' });
  }
});

// BULK OPERATIONS - Export enquiries to CSV
app.get('/api/contact/export/csv', async (req, res) => {
  try {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    
    // Create CSV header
    const csvHeader = 'Date,First Name,Last Name,Email,Mobile,State,City,School,Grade,Address\n';
    
    // Create CSV rows
    const csvRows = messages.map(msg => {
      const date = new Date(msg.createdAt).toLocaleDateString();
      return `"${date}","${msg.firstName}","${msg.lastName}","${msg.email}","${msg.mobile}","${msg.state}","${msg.city}","${msg.school}","${msg.grade}","${msg.address}"`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=enquiries.csv');
    res.send(csvContent);
  } catch (err) {
    console.error('Error exporting CSV:', err);
    res.status(500).json({ message: 'Failed to export enquiries' });
  }
});

app.post('/api/slides', upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Image is required' });

    const slide = new Slide({
      image: `${process.env.BASE_URL}/images/${req.file.filename}`,
      title,
      subtitle,
    });

    await slide.save();
    res.status(201).json({ message: 'Slide created', slide });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Read all slides
app.get('/api/slides', async (req, res) => {
  try {
    const slides = await Slide.find().sort({ createdAt: -1 });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch slides' });
  }
});

// Read one slide
app.get('/api/slides/:id', async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json(slide);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching slide' });
  }
});

// Update slide
app.put('/api/slides/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    const slide = await Slide.findById(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });

    // Delete old image if new image is uploaded
    if (req.file && slide.image) {
      const oldPath = path.join(__dirname, 'images', path.basename(slide.image));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      slide.image = `${process.env.BASE_URL}/images/${req.file.filename}`;
    }

    slide.title = title || slide.title;
    slide.subtitle = subtitle || slide.subtitle;

    await slide.save();
    res.json({ message: 'Slide updated', slide });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

// Delete slide
app.delete('/api/slides/:id', async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });

    // Remove image from folder
    if (slide.image) {
      const filePath = path.join(__dirname, 'images', path.basename(slide.image));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Slide.deleteOne({ _id: req.params.id });
    res.json({ message: 'Slide deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});


app.post('/api/artworks', upload.single('image'), async (req, res) => {
  try {
    const newArt = new Artwork({
      ...req.body,
      imageUrl: `${process.env.BASE_URL}/images/${req.file.filename}`,
      likes: Number(req.body.likes) || 0,
      views: Number(req.body.views) || 0
    });
    await newArt.save();
    res.status(201).json(newArt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📖 Read All
app.get('/api/artworks', async (req, res) => {
  try {
    const artworks = await Artwork.find().sort({ createdAt: -1 });
    res.json(artworks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📝 Update
app.put('/api/artworks/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      likes: Number(req.body.likes) || 0,
      views: Number(req.body.views) || 0
    };
    if (req.file) {
      updateData.imageUrl = `${process.env.BASE_URL}/images/${req.file.filename}`;
    }
    const updated = await Artwork.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ Delete
app.delete('/api/artworks/:id', async (req, res) => {
  try {
    await Artwork.findByIdAndDelete(req.params.id);
    res.json({ message: 'Artwork deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.post('/api/journeys', upload.single('image'), async (req, res) => {
  try {
    const { title, description, label, bgColor, textColor } = req.body;

    const journey = new Journey({
      title,
      description,
      label,
      bgColor,
      textColor,
      imageUrl: `${process.env.BASE_URL}/images/${req.file.filename}`
    });

    await journey.save();
    res.status(201).json(journey);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/', (req, res) => res.send('Server is working'));


// 🔹 READ All
app.get('/api/journeys', async (req, res) => {
  try {
    const journeys = await Journey.find().sort({ createdAt: -1 });
    res.json(journeys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 UPDATE
app.put('/api/journeys/:id', upload.single('image'), async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id);
    if (!journey) return res.status(404).json({ message: 'Journey not found' });

    if (req.file) {
      // Delete old image
      if (journey.imageUrl) {
        const oldPath = path.join(__dirname, '../images', path.basename(journey.imageUrl));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const updatedData = {
      title: req.body.title || journey.title,
      description: req.body.description || journey.description,
      label: req.body.label || journey.label,
      bgColor: req.body.bgColor || journey.bgColor,
      textColor: req.body.textColor || journey.textColor,
      imageUrl: req.file ? `${process.env.BASE_URL}/images/${req.file.filename}` : journey.imageUrl
    };

    const updated = await Journey.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 DELETE
app.delete('/api/journeys/:id', async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id);
    if (!journey) return res.status(404).json({ message: 'Journey not found' });

    // Delete image
    if (journey.imageUrl) {
      const imagePath = path.join(__dirname, '../images', path.basename(journey.imageUrl));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Journey.findByIdAndDelete(req.params.id);
    res.json({ message: 'Journey deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`Server running on ${process.env.BASE_URL}`);
});
