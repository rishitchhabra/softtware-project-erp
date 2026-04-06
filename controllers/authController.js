const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/supabase');

// GET /login
exports.loginPage = (req, res) => {
  if (req.session.user) return res.redirect(`/${req.session.user.role}`);
  res.render('auth/login', {
    title: 'Login',
    error: req.session.error,
    success: req.session.success,
    layout: false
  });
  delete req.session.error;
  delete req.session.success;
};

// POST /login
exports.login = async (req, res) => {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      req.session.error = 'Please enter User ID and Password';
      return res.redirect('/login');
    }

    // Look up user by user_id
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', user_id.trim().toLowerCase())
      .single();

    if (error || !profile) {
      req.session.error = 'Invalid User ID or Password';
      return res.redirect('/login');
    }

    // Compare password
    const isValid = await bcrypt.compare(password, profile.password_hash);
    if (!isValid) {
      req.session.error = 'Invalid User ID or Password';
      return res.redirect('/login');
    }

    // Set session
    req.session.user = {
      id: profile.id,
      user_id: profile.user_id,
      full_name: profile.full_name,
      role: profile.role,
      phone: profile.phone,
      avatar_url: profile.avatar_url,
      class_id: profile.class_id
    };

    res.redirect(`/${profile.role}`);
  } catch (err) {
    console.error('Login error:', err);
    req.session.error = 'An unexpected error occurred';
    res.redirect('/login');
  }
};

// GET /logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
