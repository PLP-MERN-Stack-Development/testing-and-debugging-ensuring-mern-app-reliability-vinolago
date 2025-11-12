// server/src/models/Post.js - Post model

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title cannot be empty'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    minlength: [1, 'Content cannot be empty'],
    maxlength: [10000, 'Content cannot exceed 10000 characters'],
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Tag cannot exceed 50 characters'],
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  meta: {
    description: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters'],
    },
    keywords: [{
      type: String,
      maxlength: [50, 'Keyword cannot exceed 50 characters'],
    }],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ slug: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ featured: 1, publishedAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ publishedAt: -1 });

// Virtual for reading time (rough estimate: 200 words per minute)
postSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const words = this.content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes); // At least 1 minute
});

// Virtual for excerpt
postSchema.virtual('excerpt').get(function() {
  const maxLength = 150;
  if (this.content.length <= maxLength) {
    return this.content;
  }
  return this.content.substring(0, maxLength).trim() + '...';
});

// Virtual for URL
postSchema.virtual('url').get(function() {
  return `/posts/${this.slug || this._id}`;
});

// Pre-save middleware to generate slug
postSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Pre-save middleware to set publishedAt
postSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Static method to find published posts
postSchema.statics.findPublished = function(query = {}) {
  return this.find({
    ...query,
    status: 'published',
    isPublished: true,
  });
};

// Static method to find posts by author
postSchema.statics.findByAuthor = function(authorId, status = 'published') {
  return this.find({
    author: authorId,
    status,
  });
};

// Instance method to increment view count
postSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to toggle featured status
postSchema.methods.toggleFeatured = function() {
  this.featured = !this.featured;
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('Post', postSchema);