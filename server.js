const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve the frontend (index.html) as static files
app.use(express.static(path.join(__dirname, 'frontend')));

// ─── MongoDB Connection ──────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ─── Schema & Model ─────────────────────────────────────────
const contactSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  message:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', contactSchema);

// ─── Routes ─────────────────────────────────────────────────

// POST /api/contact — save a new message from the form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    console.log(`📩 New message from ${name} (${email})`);
    res.status(201).json({ success: true, message: 'Message saved!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /api/contact — view all messages (for you to review)
app.get('/api/contact', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Catch-all: send index.html for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ─── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
