const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  category: { type: String },
  content: { type: String, required: true },
  tags: [String],
  status: { type: String, enum: ['draft','published'], default: 'draft' },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', blogSchema);
