const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },   
  filename: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notice', noticeSchema);
