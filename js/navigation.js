/**
 * LoomPilot Supervisor Portal - Navigation & Layout Controller
 * Manages SPA page transitions, sidebar states, mobile drawer, and top-level modals.
 */

const Navigation = {
  currentPage: 'dashboard',

  pageTitles: {
    dashboard: { title: 'Factory Dashboard', breadcrumb: 'Overview' },
    orders: { title: 'Assigned Orders', breadcrumb: 'Manufacturing Orders' },
    materials: { title: 'Raw Materials Availability', breadcrumb: 'Yarns, Beams & Chemicals Inventory' },
    resources: { title: 'Resource Availability', breadcrumb: 'Machines & Facilities' },
    production: { title: 'Production Updates', breadcrumb: 'Shift Output & Targets' },
    issues: { title: 'Issues & Reports', breadcrumb: 'Incident Management' },
    notifications: { title: 'Notifications', breadcrumb: 'Alerts & Messages' },
    profile: { title: 'Supervisor Profile', breadcrumb: 'My Account' }
  },

  init() {
    this.bindEvents();
    this.handleInitialRoute();
    this.updateBadges();
    this.restoreSidebarState();
  },

  bindEvents() {
    // Sidebar nav links
    document.querySelectorAll('[data-nav-target]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = link.getAttribute('data-nav-target');
        this.navigateTo(targetPage);
        this.closeMobileSidebar();
      });
    });

    // Hash change listener
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && this.pageTitles[hash]) {
        this.navigateTo(hash, false);
      }
    });

    // Sidebar collapse toggle
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => this.toggleSidebarCollapse());
    }

    // Mobile menu button
    const mobileBtn = document.getElementById('mobileMenuBtn');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => this.toggleMobileSidebar());
    }

    // Backdrop click
    const backdrop = document.getElementById('sidebarBackdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeMobileSidebar());
    }

    // Profile chip dropdown toggle
    const profileBtn = document.getElementById('profileChipBtn');
    const profileDropdown = document.getElementById('profileDropdownMenu');
    if (profileBtn && profileDropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        profileDropdown.classList.remove('show');
      });
    }

    // Simulated Logout Trigger
    const logoutBtn = document.getElementById('logoutDropdownBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal('logoutModal');
      });
    }

    // Wireframe sample data reset button
    const resetBtn = document.getElementById('resetPrototypeBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm("Reset all LoomPilot Supervisor prototype data to initial sample values?")) {
          store.resetToDefaults();
          showToast("Sample data restored to defaults.", "info");
          setTimeout(() => window.location.reload(), 400);
        }
      });
    }

    // Notification bell icon click -> navigate to notifications
    const bellBtn = document.getElementById('headerNotifBell');
    if (bellBtn) {
      bellBtn.addEventListener('click', () => {
        this.navigateTo('notifications');
      });
    }

    // Modal Close Buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });
  },

  handleInitialRoute() {
    const hash = window.location.hash.replace('#', '');
    if (hash && this.pageTitles[hash]) {
      this.navigateTo(hash, false);
    } else {
      this.navigateTo('dashboard', false);
    }
  },

  navigateTo(pageId, updateHash = true) {
    if (!this.pageTitles[pageId]) return;

    this.currentPage = pageId;

    if (updateHash) {
      window.location.hash = pageId;
    }

    // Toggle active page views
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.toggle('active', view.id === `page-${pageId}`);
    });

    // Update active nav item
    document.querySelectorAll('[data-nav-target]').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-nav-target') === pageId);
    });

    // Update Top Header titles
    const titleInfo = this.pageTitles[pageId];
    const headerTitleEl = document.getElementById('headerPageTitle');
    const headerBreadcrumbEl = document.getElementById('headerBreadcrumbCurrent');
    if (headerTitleEl) headerTitleEl.textContent = titleInfo.title;
    if (headerBreadcrumbEl) headerBreadcrumbEl.textContent = titleInfo.breadcrumb;

    // Trigger page-specific re-renders
    if (pageId === 'dashboard' && window.Dashboard) Dashboard.render();
    if (pageId === 'orders' && window.Orders) Orders.render();
    if (pageId === 'materials' && window.Materials) Materials.render();
    if (pageId === 'resources' && window.Resources) Resources.render();
    if (pageId === 'production' && window.Production) Production.render();
    if (pageId === 'issues' && window.Issues) Issues.render();
    if (pageId === 'notifications' && window.Notifications) Notifications.render();
    if (pageId === 'profile' && window.Profile) Profile.render();

    // Scroll to top
    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  toggleSidebarCollapse() {
    const sidebar = document.getElementById('appSidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
      const isCollapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem('loompilot_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    }
  },

  restoreSidebarState() {
    const isCollapsed = localStorage.getItem('loompilot_sidebar_collapsed') === 'true';
    const sidebar = document.getElementById('appSidebar');
    if (sidebar && isCollapsed && window.innerWidth > 992) {
      sidebar.classList.add('collapsed');
    }
  },

  toggleMobileSidebar() {
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar && backdrop) {
      sidebar.classList.toggle('mobile-open');
      backdrop.classList.toggle('show');
    }
  },

  closeMobileSidebar() {
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar && backdrop) {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('show');
    }
  },

  updateBadges() {
    // Update Notification count
    const unreadCount = store.getUnreadNotificationCount();
    const bellBadge = document.getElementById('headerNotifCount');
    const navNotifBadge = document.getElementById('navNotifCount');

    if (bellBadge) {
      bellBadge.textContent = unreadCount;
      bellBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
    if (navNotifBadge) {
      navNotifBadge.textContent = unreadCount;
      navNotifBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }

    // Update Newly Assigned Orders count
    const orders = store.getOrders();
    const newCount = orders.filter(o => o.status === 'Newly Assigned' || o.isNew).length;
    const navOrdersBadge = document.getElementById('navOrdersCount');
    if (navOrdersBadge) {
      navOrdersBadge.textContent = newCount > 0 ? `${newCount} New` : '';
      navOrdersBadge.style.display = newCount > 0 ? 'inline-block' : 'none';
    }

    // Update Issues count (open or investigating)
    const issues = store.getIssues();
    const openIssues = issues.filter(i => i.status !== 'Resolved').length;
    const navIssuesBadge = document.getElementById('navIssuesCount');
    if (navIssuesBadge) {
      navIssuesBadge.textContent = openIssues > 0 ? openIssues : '';
      navIssuesBadge.style.display = openIssues > 0 ? 'inline-block' : 'none';
    }

    // Update Raw Materials alert badge
    const materials = store.getMaterials();
    const matAlerts = materials.filter(m => m.status === 'Low Stock Alert' || m.inStockQty <= m.thresholdQty).length;
    const navMaterialsBadge = document.getElementById('navMaterialsBadge');
    if (navMaterialsBadge) {
      navMaterialsBadge.textContent = matAlerts > 0 ? `${matAlerts} Alert` : '';
      navMaterialsBadge.style.display = matAlerts > 0 ? 'inline-block' : 'none';
    }
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }
};

// Global Toast Message Dispatcher
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  } else if (type === 'danger') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  } else if (type === 'warning') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  } else {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    <div style="flex-shrink:0;">${iconSvg}</div>
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

window.Navigation = Navigation;
window.showToast = showToast;

