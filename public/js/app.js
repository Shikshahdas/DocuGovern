/**
 * DocuGovern Enterprise - Core Client Application
 * Micro-interactions, mobile navigation, modals, and toasts.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Sidebar Toggle
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('mobileOverlay');

  if (menuToggle && sidebar && overlay) {
    const toggleSidebar = () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    };

    menuToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
  }

  // Global Quick Search (Ctrl/Cmd + K)
  const searchInput = document.getElementById('globalSearchInput');
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  // Global Modal Close Triggers
  document.querySelectorAll('[data-dismiss="modal"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      if (modal) modal.classList.remove('active');
    });
  });

  // Close modal when clicking on backdrop
  document.querySelectorAll('.modal-backdrop').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
});

// Utility function to open a modal by ID
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
};

// Utility function to close a modal by ID
window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
};

// Global Toast Notification Helper
window.showToast = function(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgColors = {
    success: '#059669',
    error: '#e11d48',
    warning: '#d97706',
    info: '#4f46e5'
  };

  toast.style.cssText = `
    background: ${bgColors[type] || bgColors.info};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 260px;
  `;

  toast.innerHTML = `<span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Open approval review modal
window.openApprovalModal = function(id, title, submitter) {
  const modal = document.getElementById('quickApprovalModal');
  const form = document.getElementById('quickApprovalForm');

  if (!modal || !form) {
    console.error('Approval modal or form not found.');
    return;
  }

  document.getElementById('modalDocTitle').textContent = title;
  document.getElementById('modalSubmitter').textContent = submitter;
  form.action = `/approvals/${encodeURIComponent(id)}/process`;
  modal.classList.add('active');
};
