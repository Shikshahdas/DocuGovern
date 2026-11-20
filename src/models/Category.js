const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide category name'],
    unique: true,
    trim: true,
    maxlength: 60
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 250,
    default: ''
  },
  color: {
    type: String,
    default: '#4f46e5' // default indigo
  },
  icon: {
    type: String,
    default: 'folder'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

categorySchema.pre('save', function(next) {
  if (this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
