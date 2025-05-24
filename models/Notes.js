const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
  title: String,
  semester: String,
  subject: String,
  category: String,
  filename: String,
  uploadedBy: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notes', notesSchema);
