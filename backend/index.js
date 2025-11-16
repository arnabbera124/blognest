require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// routes
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '3mb' }));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
}

app.get('/', (req, res) => res.send({ status: 'OK', message: 'BlogNest backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

start();
