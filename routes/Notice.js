const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Notice = require('../models/Notice'); 

// ---------------Storage config for multer----------------

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// --------------------Filter only image files------------------

const fileFilter = function (req, file, cb) {
  const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PNG, JPG, and JPEG files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// ------------GET upload-notice page------------------

router.get('/upload-notice', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.render('upload-notice', { notices });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load upload-notice page.');
  }
});

// ------------------POST upload-notice form-----------------------

router.post('/upload-notice', upload.single('noticeImage'), async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.file) {
      return res.status(400).send('Please upload an image file.');
    }
    const notice = new Notice({
      title,
      filename: req.file.filename
    });
    await notice.save();
    res.redirect('/upload-notice');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to upload notice.');
  }
});


// -------------------------DELETE route---------------------

router.post('/upload-notice/delete/:id', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (notice) {
      const filePath = path.join(__dirname, '../public/uploads', notice.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await Notice.findByIdAndDelete(req.params.id);
    }
    res.redirect('/upload-notice');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete notice.');
  }
});

module.exports = router;
