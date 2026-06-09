const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  status: {
    type: String,
    enum: ['todo', 'inprogress', 'completed'],
    default: 'todo'
  },

  dueDate: {
    type: Date
  },
  notified: {
  type: Boolean,
  default: false
  },

  // IMPORTANT
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);