const express = require('express');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const router = express.Router();

// Create blog (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const data = req.body;
    data.authorId = req.user.id;
    const blog = new Blog(data);
    await blog.save();
    res.send(blog);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Server error' });
  }
});

// Read list (with filters)
router.get('/', async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const q = {};
    if (status) q.status = status;
    if (category) q.category = category;
    if (search) q.title = new RegExp(search, 'i');
    const blogs = await Blog.find(q).sort({ createdAt: -1 }).limit(200);
    res.send(blogs);
  } catch (err) {
    res.status(500).send({ error: 'Server error' });
  }
});

// Read single
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send({ error: 'Not found' });
    res.send(blog);
  } catch (err) {
    res.status(500).send({ error: 'Server error' });
  }
});

// Update (owner or admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send({ error: 'Not found' });
    if (String(blog.authorId) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).send({ error: 'Forbidden' });
    }
    Object.assign(blog, req.body, { updatedAt: Date.now() });
    await blog.save();
    res.send(blog);
  } catch (err) {
    res.status(500).send({ error: 'Server error' });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send({ error: 'Not found' });
    if (String(blog.authorId) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).send({ error: 'Forbidden' });
    }
    await blog.remove();
    res.send({ ok: true });
  } catch (err) {
    res.status(500).send({ error: 'Server error' });
  }
});

module.exports = router;
