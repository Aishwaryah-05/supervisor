/**
 * LoomPilot Supervisor Portal - Notifications Controller
 * Manages prototype notification events, unread states, filtering, and deep links.
 */

const Notifications = {
  activeFilter: 'all',

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Filter buttons
    document.querySelectorAll('[data-notif-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-notif-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.getAttribute('data-notif-filter');
        this.render();
      });
    });

    // Mark all as read button
    const markAllBtn = document.getElementById('notifMarkAllReadBtn');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        const notifs = store.getNotifications();
        notifs.forEach(n => n.isRead = true);
        store.saveNotifications(notifs);
        this.render();
        Navigation.updateBadges();
        showToast("All notifications marked as read.", "info");
      });
    }

    // Clear all button
    const clearBtn = document.getElementById('notifClearAllBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm("Clear all notifications from list?")) {
          store.saveNotifications([]);
          this.render();
          Navigation.updateBadges();
          showToast("Notification list cleared.", "info");
        }
      });
    }
  },

  render() {
    const notifs = store.getNotifications();
    const container = document.getElementById('notificationsListContainer');
    if (!container) return;

    let filtered = notifs.filter(n => {
      if (this.activeFilter === 'unread' && n.isRead) return false;
      if (this.activeFilter === 'orders' && n.type !== 'order') return false;
      if (this.activeFilter === 'machines' && n.type !== 'breakdown') return false;
      if (this.activeFilter === 'admin' && n.type !== 'admin') return false;
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:48px 20px; color:var(--muted-text);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px; color:#C0B9B0;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <div style="font-weight:700; font-size:1rem; color:var(--deep-charcoal);">No notifications found</div>
          <div style="font-size:0.8rem; margin-top:4px;">You have viewed all operational updates in this category.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(notif => {
      const icon = this.getNotifIcon(notif.type);
      return `
        <div class="notification-item ${!notif.isRead ? 'unread' : ''}" onclick="Notifications.handleNotifClick('${notif.id}')">
          <div class="notif-icon-circle" style="background:${icon.bg}; color:${icon.color};">
            ${icon.svg}
          </div>
          <div class="notif-content">
            <div class="notif-header-line">
              <span class="notif-item-title">${notif.title}</span>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="notif-item-time">${notif.timestamp}</span>
                ${!notif.isRead ? '<span class="status-dot" style="width:7px; height:7px; background:var(--vermilion); box-shadow:none;"></span>' : ''}
              </div>
            </div>
            <div class="notif-item-message">${notif.message}</div>
            <div class="notif-actions">
              <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); Notifications.navigateFromNotif('${notif.linkPage}', '${notif.refId}')">
                Open Details →
              </button>
              ${!notif.isRead ? `
                <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); Notifications.markAsRead('${notif.id}')">
                  Mark as read
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  getNotifIcon(type) {
    if (type === 'order') {
      return {
        bg: 'var(--vermilion-light)',
        color: 'var(--vermilion)',
        svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`
      };
    }
    if (type === 'breakdown') {
      return {
        bg: 'var(--danger-light)',
        color: 'var(--danger-red)',
        svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
      };
    }
    if (type === 'deadline') {
      return {
        bg: 'var(--warning-light)',
        color: 'var(--warning-amber)',
        svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
      };
    }
    if (type === 'production') {
      return {
        bg: 'var(--success-light)',
        color: 'var(--success-green)',
        svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
      };
    }
    return {
      bg: 'var(--info-light)',
      color: 'var(--info-blue)',
      svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
    };
  },

  handleNotifClick(notifId) {
    this.markAsRead(notifId);
  },

  markAsRead(notifId) {
    const notifs = store.getNotifications();
    const notif = notifs.find(n => n.id === notifId);
    if (!notif) return;

    notif.isRead = true;
    store.saveNotifications(notifs);
    this.render();
    Navigation.updateBadges();
  },

  navigateFromNotif(page, refId) {
    Navigation.navigateTo(page);
    if (page === 'orders' && refId && refId.startsWith('ORD-')) {
      setTimeout(() => Orders.openDetail(refId), 250);
    }
  }
};

window.Notifications = Notifications;

