const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = 'admin@college.edu';
const ADMIN_PASSWORD = 'admin123';


function isAdmin(req, res, next) {
  if (req.session.user?.role === 'admin') return next();
  res.redirect('/login');
}

//------------------------ Routes-----------

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, semester } = req.body;

    if (email === ADMIN_EMAIL) {
      return res.send('Admin email is reserved.');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send('User already registered with this email.');
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hash,
      role: 'student',
      semester,
    });

    req.session.user = newUser;
    res.redirect('/student');

  } catch (err) {
    console.error(err);
    res.send('Error occurred during signup');
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Admin login
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    req.session.user = { name: 'Admin', email: ADMIN_EMAIL, role: 'admin' };
    return res.redirect('/admin');
  }


  const user = await User.findOne({ email });

  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = user;


    if (user.role === 'student') {
      return res.redirect('/student');
    } else if (user.role === 'teacher') {
      return res.redirect('/teacher');
    } else {
      return res.send('Unknown role. Cannot redirect.');
    }

  } else {
  res.render('login', { 
      errorMessage: 'Email or password is incorrect.',
      email: email 
    });
  }
});


router.get('/teacher', (req, res) => {
  if (req.session.user?.role === 'teacher') {
    res.render('teacher-dashboard', { user: req.session.user });
  } else {
    res.redirect('/login');
  }
});



const Note = require('../models/Notes');
const Notice = require('../models/Notice');


router.get('/student', async (req, res) => {
  if (req.session.user?.role === 'student') {
    const semester = req.session.user.semester;

    const notes = await Note.find({ semester }).lean();      
    const notices = await Notice.find().lean();              

    res.render('student-dashboard', {
      user: req.session.user,
      notes,
      notices
    });
  } else {
    res.redirect('/login');
  }
});



const Notes = require('../models/Notes'); 

router.get('/student-notes-view', async (req, res) => {
  try {
    const notes = await Notes.find(); 
    res.render('student-notes-view', { notes });
  } catch (err) {
    console.error(err);
    res.send('Failed to load notes');
  }
});


// -------------------Admin middleware---------------

function isAdmin(req, res, next) {
  if (req.session.user?.role === 'admin') return next();
  res.redirect('/login');
}

module.exports = router;


//----------------------- Admin -dashboard page------------------------

router.get('/admin', isAdmin, async (req, res) => {
  try {
 
    const selectedSemester = req.query.semester || '';


    let studentQuery = { role: 'student' };


    if (selectedSemester && ['1','2','3','4','5','6'].includes(selectedSemester)) {
      studentQuery.semester = selectedSemester;
    }


    const students = await User.find(studentQuery).lean();

    const teachers = await User.find({ role: 'teacher' }).lean();

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = teachers.length;


    const allStudents = await User.find({ role: 'student' }).lean();
    const semesterCounts = allStudents.reduce((acc, s) => {
      const sem = s.semester || 'N/A';
      acc[sem] = (acc[sem] || 0) + 1;
      return acc;
    }, {});

    res.render('admin-dashboard', {
      students,
      teachers,
      totalStudents,
      totalTeachers,
      semesterCounts,
      selectedSemester,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// -----------------------------Add Student ------------------------------


router.get('/admin/add-student', isAdmin, (req, res) => {
  res.render('add-student');
});


router.post('/admin/add-student', isAdmin, async (req, res) => {
  try {
    const { name, email, password, semester } = req.body;


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send('User with this email already exists.');
    }

    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hash,
      role: 'student',
      semester,
    });

    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.send('Error adding student');
  }
});

// --------------------Add Teacher -----------

router.get('/admin/add-teacher', isAdmin, (req, res) => {
  res.render('add-teacher');
});

//------------------------- Add Teacher -------------------------

router.post('/admin/add-teacher', isAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ----------------check if user exists-------------


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send('User with this email already exists.');
    }

    //------------ Hash password--------------

    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hash,
      role: 'teacher',
      
    });

    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.send('Error adding teacher');
  }
});

//---------------- Edit Student ------------------

router.get('/admin/edit-student/:id', isAdmin, async (req, res) => {
  const student = await User.findById(req.params.id).lean();
  if (!student || student.role !== 'student') {
    return res.redirect('/admin');
  }
  res.render('edit-student', { student });
});

//---------------- Edit Student -------------------

router.post('/admin/edit-student/:id', isAdmin, async (req, res) => {
  const { name, email, semester } = req.body;
  await User.findByIdAndUpdate(req.params.id, { name, email, semester });
  res.redirect('/admin');
});

// ---------------------Delete Student----------------


router.post('/admin/delete-student/:id', isAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/admin');
});


//-------------------------- Edit Teacher -----------------------------


router.get('/admin/edit-teacher/:id', isAdmin, async (req, res) => {
  const teacher = await User.findById(req.params.id).lean();
  if (!teacher || teacher.role !== 'teacher') {
    return res.redirect('/admin');
  }
  res.render('edit-teacher', { teacher });
});

// -----------------------Edit Teacher - POST update----------------------

router.post('/admin/edit-teacher/:id', isAdmin, async (req, res) => {
  const { name, email } = req.body;
  await User.findByIdAndUpdate(req.params.id, { name, email });
  res.redirect('/admin');
});

//--------------------------- Delete Teacher---------------------

router.post('/admin/delete-teacher/:id', isAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/admin');
});

//---------------Connection of the resume builder------------------------

router.get('/resume-builder', (req, res) => {
  res.render('resumeBuilder'); 
});

module.exports = router;
