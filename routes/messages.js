// routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); // Adjust if your model path is different

router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    await Message.create({ name, email, message });
    res.status(200).send('Message saved');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving message');
  }
});


router.get('/messages', async (req, res) => {
  try {
    const filter = req.query.filter || ''; // default to empty string
    let query = {};

    if (filter === 'read') {
      query.read = true;
    } else if (filter === 'unread') {
      query.read = false;
    }

    const messages = await Message.find(query).sort({ createdAt: -1 });

    // Pass both messages and filter to EJS
    res.render('message', { messages, filter });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching messages');
  }
});


router.post('/messages/:id/read', async (req, res) => {
  await Message.findByIdAndUpdate(req.params.id, { read: true });
  res.redirect('/messages');
});

router.post('/messages/:id/delete', async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.redirect('/messages');
});

module.exports = router;
