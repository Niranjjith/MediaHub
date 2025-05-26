const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// View messages
router.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.render('message', { messages });
});

// Mark as Read
router.post('/messages/:id/read', async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { read: true });
    res.redirect('/messages');
  } catch (err) {
    res.status(500).send('Error marking as read');
  }
});

// Delete message
router.post('/messages/:id/delete', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.redirect('/messages');
  } catch (err) {
    res.status(500).send('Error deleting message');
  }
});

module.exports = router;
