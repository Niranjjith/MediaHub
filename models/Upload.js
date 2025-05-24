const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  title: String,
  semester: String,
  subject: String,
  category: String, 
  filename: String,
  uploadedBy: String, 
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Upload', uploadSchema);
