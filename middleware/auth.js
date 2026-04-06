// Auth middleware — checks if user is logged in
function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.session.error = 'Please log in to continue';
    return res.redirect('/login');
  }
  next();
}

// Role guard — restricts access to specific roles
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      req.session.error = 'Please log in to continue';
      return res.redirect('/login');
    }
    if (!roles.includes(req.session.user.role)) {
      req.session.error = 'You do not have permission to access this page';
      return res.redirect(`/${req.session.user.role}`);
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
