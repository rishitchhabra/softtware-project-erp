const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.loginPage);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Redirect register to login (admin creates users now)
router.get('/register', (req, res) => {
  req.session.error = 'Registration is disabled. Contact your administrator.';
  res.redirect('/login');
});

module.exports = router;
