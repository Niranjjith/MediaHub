const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();

// ---------------Connect MongoDB-------------------------


mongoose.connect('mongodb://127.0.0.1:27017/eduSite');

//-------------------- Middleware-----------------------


app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

//---------------------- Sessions------------------------------------------------
app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/eduSite' }),
  })
);

//-------------- Routes-----------------------

const authRoutes = require('./routes/auth'); 
app.use('/', authRoutes);

app.listen(3000, () => console.log('Server running on http://localhost:3000'));


const uploadNoteRoutes = require('./routes/uploadNote');
app.use('/', uploadNoteRoutes);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const studentRoutes = require('./routes/student');
app.use('/student', studentRoutes);

const noticeRoutes = require('./routes/Notice');

app.use('/', noticeRoutes);
const contactRoutes = require('./routes/contact');
app.use('/', contactRoutes);
