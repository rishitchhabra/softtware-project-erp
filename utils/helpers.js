// Format date to readable string
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

// Format date with time
function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// Truncate text
function truncate(str, len = 100) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
}

// Calculate percentage
function percentage(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

// Get initials from name
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

// Get status badge class
function statusClass(status) {
  const map = {
    present: 'badge-success',
    absent: 'badge-danger',
    late: 'badge-warning',
    active: 'badge-success',
    archived: 'badge-secondary',
    submitted: 'badge-primary',
    graded: 'badge-success',
    pending: 'badge-warning',
    overdue: 'badge-danger'
  };
  return map[status] || 'badge-secondary';
}

// Get greeting based on time of day
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// Day of week labels
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

module.exports = {
  formatDate,
  formatDateTime,
  truncate,
  percentage,
  getInitials,
  statusClass,
  getGreeting,
  DAYS
};
