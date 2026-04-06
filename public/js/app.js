// Global client-side JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // Mobile sidebar toggle
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  }

  // Auto-dismiss alerts after 5 seconds
  document.querySelectorAll('.alert').forEach(alert => {
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-10px)';
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  });

  // Modal system
  window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  };
  window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  };

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  // Dropdown toggle
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    const trigger = dropdown.querySelector('[data-dropdown]');
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });
    }
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown.active').forEach(d => d.classList.remove('active'));
  });

  // Form loading state
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function() {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner spinner-sm"></span> Processing...';
      }
    });
  });

  // Confirm delete
  window.confirmDelete = function(message, formId) {
    if (confirm(message || 'Are you sure you want to delete this?')) {
      document.getElementById(formId).submit();
    }
  };

  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const group = this.closest('.tabs');
      const target = this.dataset.tab;
      group.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => {
        c.style.display = c.id === target ? 'block' : 'none';
      });
    });
  });
});
