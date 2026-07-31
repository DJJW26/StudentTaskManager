const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  userAgent: {
    type: String,
    default: 'unknown'
  },
  ip: {
    type: String,
    default: 'unknown'
  },
  page: {
    type: String,
    default: '/'
  }
});

module.exports = mongoose.model('Visit', visitSchema);
