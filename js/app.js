/**
 * LoomPilot Supervisor Portal - Main Application Entrypoint
 * Bootstraps all controllers, live date ticker, and global interactive behaviors.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Data Store first
  if (window.store) {
    store.init();
  }

  // Initialize Controllers
  if (window.Navigation) Navigation.init();
  if (window.Orders) Orders.init();
  if (window.Materials) Materials.init();
  if (window.Resources) Resources.init();
  if (window.Production) Production.init();
  if (window.Issues) Issues.init();
  if (window.Notifications) Notifications.init();
  if (window.Profile) Profile.init();

  // Initial render based on starting page
  const initialPage = window.location.hash.replace('#', '') || 'dashboard';
  Navigation.navigateTo(initialPage, false);

  // Live Date / Time Bar
  updateLiveDateBar();
  setInterval(updateLiveDateBar, 30000);

  // Global Header Search Handler
  const globalSearch = document.getElementById('globalHeaderSearch');
  if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) return;

      // If user types ORD- or order keyword, switch to orders page
      if (q.startsWith('ord') && Navigation.currentPage !== 'orders') {
        Navigation.navigateTo('orders');
        const ordersInput = document.getElementById('ordersSearchInput');
        if (ordersInput) {
          ordersInput.value = q;
          Orders.searchQuery = q;
          Orders.render();
        }
      } else if ((q.startsWith('lot') || q.startsWith('beam') || q.includes('yarn') || q.includes('cotton') || q.includes('linen') || q.includes('silk')) && Navigation.currentPage !== 'materials') {
        Navigation.navigateTo('materials');
        const matInput = document.getElementById('materialsSearchInput');
        if (matInput) {
          matInput.value = q;
          Materials.searchQuery = q;
          Materials.render();
        }
      } else if (Navigation.currentPage === 'orders') {
        const ordersInput = document.getElementById('ordersSearchInput');
        if (ordersInput) {
          ordersInput.value = q;
          Orders.searchQuery = q;
          Orders.render();
        }
      } else if (Navigation.currentPage === 'materials') {
        const matInput = document.getElementById('materialsSearchInput');
        if (matInput) {
          matInput.value = q;
          Materials.searchQuery = q;
          Materials.render();
        }
      }
    });
  }

  console.log("LoomPilot Supervisor Portal wireframe initialized successfully.");
});

function updateLiveDateBar() {
  const dateEl = document.getElementById('headerLiveDate');
  if (!dateEl) return;

  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const dateStr = now.toLocaleDateString('en-US', options);
  dateEl.textContent = `${dateStr} • Shift A`;
}

