const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes'); 


// ------------------------student/notes------------------------

router.get('/notes', async (req, res) => {
  try {
    const { semester, category } = req.query;
    let filter = {};

    if (semester) filter.semester = semester;
    if (category && category !== 'All') filter.category = category;

    const notes = await Notes.find(filter);
    res.render('student-notes-view', { notes });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading notes');
  }
});


module.exports = router;


const Notice = require('../models/Notice');

router.get('/dashboard', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.render('student-dashboard', { user: req.user, notices });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard');
  }
});
