const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Make user data available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.session.success || null;
  res.locals.error = req.session.error || null;
  // Clear flash messages
  delete req.session.success;
  delete req.session.error;
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const facultyRoutes = require('./routes/faculty');
const studentRoutes = require('./routes/student');
const apiRoutes = require('./routes/api');
const timetableApiRoutes = require('./routes/timetableApi');
const { requireRole } = require('./middleware/auth');

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/faculty', facultyRoutes);
app.use('/student', studentRoutes);
app.use('/api', apiRoutes);
app.use('/api/tt', requireRole('admin'), timetableApiRoutes);

// Home redirect
app.get('/', (req, res) => {
  if (req.session.user) {
    const role = req.session.user.role;
    return res.redirect(`/${role}`);
  }
  res.redirect('/login');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('errors/404', {
    title: 'Page Not Found',
    layout: false
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('errors/500', {
    title: 'Server Error',
    layout: false
  });
});

module.exports = app;
