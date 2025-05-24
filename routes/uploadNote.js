const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Note = require('../models/Notes'); 
const fs = require('fs');



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/notes/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });


const Notes = require('../models/Notes');


// ------------------------Upload form--------------------------

router.get('/upload-note', (req, res) => {
  res.render('upload-note'); // EJS form page we'll make
});


router.post('/upload-note', upload.single('file'), async (req, res) => {
  const { title, semester, subject, category, uploadedBy } = req.body;
  const filename = req.file.filename;

  await Note.create({
    title,
    semester,
    subject,
    category,
    uploadedBy,
    filename
  });

  res.redirect('/uploads');
});

// ----------------------Display uploads with filters-------------------


router.get('/uploads', async (req, res) => {
  const { semester, subject, category } = req.query;

  let filter = {};
  if (semester) filter.semester = semester;
  if (subject) filter.subject = subject;
  if (category) filter.category = category;

  const notes = await Note.find(filter).lean();

  res.render('upload-section', { notes });
});

module.exports = router;



// -----------------------Delete note route--------------------


router.post('/delete-note/:id', async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id);
    if (!note) {
      console.error('Note not found');
      return res.status(404).send('Note not found');
    }

    //------------------- Delete file from filesystem if exists---------------------

    const filePath = path.join(__dirname, '../public/uploads/notes', note.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('File deleted:', filePath);
    } else {
      console.warn('File not found on server:', filePath);
    }

    //-------------------------- Delete note from database----------------------

    await Notes.findByIdAndDelete(req.params.id);
    console.log('Note deleted from DB:', req.params.id);

    res.redirect('/uploads'); 
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).send('Server Error: ' + err.message);
  }
});

module.exports = router;