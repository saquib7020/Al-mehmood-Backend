// ... existing requires and setup
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const GalleryItem = require('./Models/GalleryModel');
const Announcement = require('./Models/AnnouncementModel');
const ContactMessage = require('./Models/ContactMessage');
const mongoose = require('mongoose');
const Slide=require('./Models/SlideModel')
const Artwork=require('./Models/Artwork')
const app = express();
const PORT = process.env.PORT || 5000;
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
  const { title, subtitle, description, buttonText } = req.body;
  const imageUrl = `${process.env.BASE_URL}/images/${req.file.filename}`;
  const newItem = new GalleryItem({ image: imageUrl, title, subtitle, description, buttonText });
  await newItem.save();
  res.status(201).json({ message: 'Gallery item uploaded', item: newItem });
});

// Read
app.get('/api/gallery', async (req, res) => {
  const items = await GalleryItem.find({});
  res.json(items);
});

// Update
app.put('/api/gallery/:id', async (req, res) => {
  try {
    const updated = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Item not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update gallery item' });
  }
});

// Delete
app.delete('/api/gallery/:id', async (req, res) => {
  try {
    const deleted = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Item not found' });

    const filename = deleted.image?.split('/images/')[1];
    if (filename && fs.existsSync(`images/${filename}`)) {
      fs.unlinkSync(`images/${filename}`);
    }

    res.json({ message: 'Gallery item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete gallery item' });
  }
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
app.post('/api/contact', async (req, res) => {
  const { name, email, mobile, message } = req.body;

  if (!name || !email || !mobile || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const newMessage = new ContactMessage({ name, email, mobile, message });

  try {
    await newMessage.save();
    res.status(201).json({ message: 'Message received successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Read
app.get('/api/contact', async (req, res) => {
  const messages = await ContactMessage.find({});
  res.json(messages);
});

// Delete
app.delete('/api/contact/:id', async (req, res) => {
  try {
    const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete message' });
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

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`Server running on ${process.env.BASE_URL}`);
});
