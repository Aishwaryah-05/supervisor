/**
 * LoomPilot Supervisor Portal - Assigned Orders Controller
 * Handles order table listing, filtering, search, and Order Detail Modal with the strict 8-stage lifecycle.
 * Features: Authentic textile fabric swatch chips, punch-ticket tags, and interactive order actions.
 */

const Orders = {
  activeFilter: 'all',
  searchQuery: '',

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Filter tabs
    document.querySelectorAll('[data-order-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-order-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.getAttribute('data-order-filter');
        this.render();
      });
    });

    // Orders search box
    const searchInput = document.getElementById('ordersSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }
  },

  getSwatchClass(orderId) {
    const map = {
      'ORD-8092': 'swatch-twill',
      'ORD-8095': 'swatch-linen',
      'ORD-8088': 'swatch-cordura',
      'ORD-8098': 'swatch-satin',
      'ORD-8079': 'swatch-poplin',
      'ORD-8084': 'swatch-denim',
      'ORD-8065': 'swatch-georgette',
      'ORD-8101': 'swatch-terry'
    };
    return map[orderId] || 'swatch-twill';
  },

  render() {
    const orders = store.getOrders();
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;

    // Filter logic
    let filtered = orders.filter(order => {
      // Tab filter
      if (this.activeFilter === 'new' && !(order.status === 'Newly Assigned' || order.isNew)) return false;
      if (this.activeFilter === 'not-started' && order.status !== 'Not Started') return false;
      if (this.activeFilter === 'in-progress' && order.status !== 'In Progress') return false;
      if (this.activeFilter === 'at-risk' && order.status !== 'At Risk') return false;
      if (this.activeFilter === 'completed' && order.status !== 'Completed') return false;

      // Search filter
      if (this.searchQuery) {
        const text = `${order.id} ${order.fabricName} ${order.clientName} ${order.currentStage}`.toLowerCase();
        if (!text.includes(this.searchQuery)) return false;
      }

      return true;
    });

    // Update filter counts
    this.updateFilterCounts(orders);

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:36px; color:var(--muted-text);">
            No manufacturing orders match the selected criteria.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(order => {
      const isNew = order.status === 'Newly Assigned' || order.isNew;
      const progressPct = order.totalQty > 0 ? Math.round((order.producedQty / order.totalQty) * 100) : 0;
      const swatchClass = this.getSwatchClass(order.id);

      return `
        <tr class="${isNew ? 'row-new-highlight' : ''}" style="cursor:pointer;" onclick="Orders.openDetail('${order.id}')" title="Click to inspect order specifications">
          <td>
            <div style="display:flex; align-items:center; gap:12px;">
              <span class="fabric-swatch-chip ${swatchClass}" style="width:26px; height:26px; min-width:26px; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.12);" title="Weave: ${order.specs.weavePattern}"></span>
              <div style="min-width:0;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-weight:700; color:var(--deep-charcoal); font-size:0.9rem;">${order.fabricName}</span>
                  ${isNew ? '<span class="badge badge-new" style="font-size:0.62rem; padding:1px 5px;">NEW</span>' : ''}
                </div>
                <div style="font-size:0.74rem; color:var(--muted-text); margin-top:3px;">${order.specs.weavePattern} &bull; ${order.specs.gsm} &bull; Blend: ${order.specs.yarnBlend}</div>
              </div>
            </div>
          </td>
          <td>
            <span style="font-weight:600; font-size:0.84rem; display:block;">${order.clientName}</span>
          </td>
          <td style="font-family:var(--font-mono); font-weight:700; text-align:right; font-size:0.84rem;">${order.totalQty.toLocaleString()} m</td>
          <td style="font-family:var(--font-mono); font-weight:700; text-align:right; color:var(--success-green); font-size:0.84rem;">${order.producedQty.toLocaleString()} m</td>
          <td style="font-family:var(--font-mono); font-weight:700; text-align:right; color:${order.remainingQty > 0 ? 'var(--vermilion)' : 'var(--muted-text)'}; font-size:0.84rem;">${order.remainingQty.toLocaleString()} m</td>
          <td>
            <div style="font-weight:600; font-size:0.84rem; line-height:1.2;">${order.deliveryDeadline}</div>
            ${order.status === 'At Risk' ? '<div style="font-size:0.68rem; color:var(--danger-red); font-weight:700; margin-top:2px;">⚠ At Risk</div>' : '<div style="font-size:0.68rem; color:var(--muted-text); margin-top:2px;">On schedule</div>'}
          </td>
          <td>
            <span class="badge badge-neutral" style="font-weight:600; font-size:0.74rem; padding:3px 8px; display:inline-block; max-width:100%;">${order.currentStage}</span>
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <div class="progress-track" style="width:44px; height:6px; flex-shrink:0;">
                <div class="progress-fill ${progressPct === 100 ? 'green' : ''}" style="width:${progressPct}%;"></div>
              </div>
              <span style="font-family:var(--font-mono); font-size:0.74rem; font-weight:700;">${progressPct}%</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  updateFilterCounts(orders) {
    const allCount = orders.length;
    const newCount = orders.filter(o => o.status === 'Newly Assigned' || o.isNew).length;
    const notStartedCount = orders.filter(o => o.status === 'Not Started').length;
    const inProgressCount = orders.filter(o => o.status === 'In Progress').length;
    const atRiskCount = orders.filter(o => o.status === 'At Risk').length;
    const completedCount = orders.filter(o => o.status === 'Completed').length;

    const elAll = document.getElementById('countFilterAll');
    const elNew = document.getElementById('countFilterNew');
    const elNotStarted = document.getElementById('countFilterNotStarted');
    const elInProgress = document.getElementById('countFilterInProgress');
    const elAtRisk = document.getElementById('countFilterAtRisk');
    const elCompleted = document.getElementById('countFilterCompleted');

    if (elAll) elAll.textContent = allCount;
    if (elNew) elNew.textContent = newCount;
    if (elNotStarted) elNotStarted.textContent = notStartedCount;
    if (elInProgress) elInProgress.textContent = inProgressCount;
    if (elAtRisk) elAtRisk.textContent = atRiskCount;
    if (elCompleted) elCompleted.textContent = completedCount;
  },

  getStatusBadge(status, isNew) {
    if (isNew || status === 'Newly Assigned') {
      return `<span class="badge badge-vermilion"><span class="badge-dot"></span> Newly Assigned</span>`;
    }
    if (status === 'In Progress') {
      return `<span class="badge badge-info"><span class="badge-dot"></span> In Progress</span>`;
    }
    if (status === 'At Risk') {
      return `<span class="badge badge-danger"><span class="badge-dot"></span> At Risk</span>`;
    }
    if (status === 'Completed') {
      return `<span class="badge badge-success"><span class="badge-dot"></span> Completed</span>`;
    }
    return `<span class="badge badge-neutral"><span class="badge-dot"></span> ${status}</span>`;
  },

  openDetail(orderId) {
    const orders = store.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('orderDetailModal');
    const content = document.getElementById('orderDetailContent');
    if (!modal || !content) return;

    const progressPct = order.totalQty > 0 ? ((order.producedQty / order.totalQty) * 100).toFixed(1) : 0;
    const swatchClass = this.getSwatchClass(order.id);

    // Build the 8-stage visual stepper
    const currentStageIndex = PRODUCTION_STAGES.findIndex(s => s === order.currentStage);
    const stepperHtml = `
      <div class="lifecycle-stepper">
        ${PRODUCTION_STAGES.map((stageName, idx) => {
          let stepClass = 'upcoming';
          let statusText = 'Upcoming';
          let dotContent = idx + 1;

          if (idx < currentStageIndex) {
            stepClass = 'completed';
            statusText = 'Completed';
            dotContent = '✓';
          } else if (idx === currentStageIndex) {
            stepClass = 'active';
            statusText = 'Active Now';
          }

          // Strip number prefix for clean label
          const cleanName = stageName.replace(/^[0-9]+\.\s*/, '');

          return `
            <div class="stage-step ${stepClass}">
              <div class="stage-dot">${dotContent}</div>
              <div class="stage-name">${cleanName}</div>
              <div class="stage-status-sub">${statusText}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    content.innerHTML = `
      <!-- Order Header Bar -->
      <div style="display:flex; align-items:flex-start; justify-content:space-between; border-bottom:1px solid var(--soft-border); padding-bottom:18px; margin-bottom:20px; flex-wrap:wrap; gap:14px;">
        <div style="display:flex; align-items:flex-start; gap:14px;">
          <span class="fabric-swatch-chip ${swatchClass}" style="width:48px; height:48px; border-radius:8px; border:2px solid var(--soft-border); box-shadow:0 2px 6px rgba(0,0,0,0.15);" title="Weave Preview"></span>
          <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
              ${this.getStatusBadge(order.status, order.status === 'Newly Assigned' || order.isNew)}
              ${order.isNew ? '<span class="badge badge-new">Action Required</span>' : ''}
            </div>
            <h2 style="font-family:var(--font-display); font-size:1.35rem; font-weight:800; color:var(--deep-charcoal);">${order.fabricName}</h2>
            <div style="font-size:0.84rem; color:var(--muted-text); margin-top:3px;">
              Client: <strong>${order.clientName}</strong> &bull; Assigned: <strong>${order.assignedDate} at ${order.assignedTime}</strong>
            </div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.72rem; color:var(--muted-text); text-transform:uppercase; font-weight:800; letter-spacing:0.8px;">Delivery Deadline</div>
          <div style="font-family:var(--font-mono); font-size:1.2rem; font-weight:800; color:${order.status === 'At Risk' ? 'var(--danger-red)' : 'var(--deep-charcoal)'};">
            ${order.deliveryDeadline}
          </div>
          <div style="font-size:0.75rem; color:var(--muted-text); margin-top:2px;">Target: <strong>${order.dailyTarget} m / day</strong></div>
        </div>
      </div>

      <!-- Strict 8-Stage Lifecycle Stepper -->
      <div style="background:var(--bg-warm-ivory); border:1px solid var(--soft-border); border-radius:var(--radius-lg); padding:16px 20px; margin-bottom:24px; box-shadow:inset 0 1px 3px rgba(37,38,34,0.03);">
        <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:var(--muted-text); margin-bottom:8px; display:flex; align-items:center; justify-content:space-between;">
          <span>Strict Eight-Stage Textile Lifecycle Tracker</span>
          <span style="font-weight:700; color:var(--vermilion);">${order.currentStage}</span>
        </div>
        ${stepperHtml}
      </div>

      <!-- Quantity Metrics Grid -->
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-bottom:24px;">
        <div style="background:var(--surface-alt); border:1px solid var(--soft-border); border-radius:var(--radius-md); padding:14px;">
          <div style="font-size:0.7rem; color:var(--muted-text); font-weight:800; letter-spacing:0.5px;">TOTAL CONTRACT QUANTITY</div>
          <div style="font-family:var(--font-mono); font-size:1.35rem; font-weight:800; color:var(--deep-charcoal); margin-top:4px;">${order.totalQty.toLocaleString()} m</div>
        </div>
        <div style="background:var(--success-light); border:1px solid rgba(32,132,90,0.25); border-radius:var(--radius-md); padding:14px;">
          <div style="font-size:0.7rem; color:var(--success-green); font-weight:800; letter-spacing:0.5px;">PRODUCED SO FAR</div>
          <div style="font-family:var(--font-mono); font-size:1.35rem; font-weight:800; color:var(--success-green); margin-top:4px;">${order.producedQty.toLocaleString()} m</div>
        </div>
        <div style="background:var(--vermilion-light); border:1px solid rgba(230,83,56,0.25); border-radius:var(--radius-md); padding:14px;">
          <div style="font-size:0.7rem; color:var(--vermilion); font-weight:800; letter-spacing:0.5px;">REMAINING BALANCE</div>
          <div style="font-family:var(--font-mono); font-size:1.35rem; font-weight:800; color:var(--vermilion); margin-top:4px;">${order.remainingQty.toLocaleString()} m</div>
        </div>
        <div style="background:var(--surface-alt); border:1px solid var(--soft-border); border-radius:var(--radius-md); padding:14px;">
          <div style="font-size:0.7rem; color:var(--muted-text); font-weight:800; letter-spacing:0.5px;">COMPLETION PROGRESS</div>
          <div style="font-family:var(--font-mono); font-size:1.35rem; font-weight:800; color:var(--deep-charcoal); margin-top:4px;">${progressPct}%</div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-bar-wrapper" style="margin-bottom:24px;">
        <div class="progress-track" style="height:10px;">
          <div class="progress-fill ${progressPct >= 100 ? 'green' : ''}" style="width:${progressPct}%;"></div>
        </div>
        <div class="progress-meta" style="margin-top:6px;">
          <span>Cumulative Produced: <strong>${order.producedQty.toLocaleString()} m</strong></span>
          <span>Balance to weave: <strong>${order.remainingQty.toLocaleString()} m</strong></span>
        </div>
      </div>

      <!-- Technical Fabric Specifications -->
      <div style="border:1px solid var(--soft-border); border-radius:var(--radius-md); padding:20px; background:var(--white); margin-bottom:24px; box-shadow:var(--shadow-subtle);">
        <h4 style="font-family:var(--font-display); font-size:0.95rem; font-weight:800; color:var(--deep-charcoal); margin-bottom:14px; text-transform:uppercase; letter-spacing:0.8px; display:flex; align-items:center; gap:8px;">
          <span style="width:4px; height:12px; background:var(--vermilion); border-radius:2px;"></span>
          Technical Weaving &amp; Yarn Construction Specifications
        </h4>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; font-size:0.84rem;">
          <div>
            <span style="color:var(--muted-text); display:block; font-size:0.72rem; font-weight:600;">Fiber Composition</span>
            <strong style="color:var(--deep-charcoal);">${order.specs.composition}</strong>
          </div>
          <div>
            <span style="color:var(--muted-text); display:block; font-size:0.72rem; font-weight:600;">Weave Pattern Structure</span>
            <strong style="color:var(--deep-charcoal);">${order.specs.weavePattern}</strong>
          </div>
          <div>
            <span style="color:var(--muted-text); display:block; font-size:0.72rem; font-weight:600;">Fabric Weight / GSM</span>
            <strong style="color:var(--deep-charcoal);">${order.specs.gsm}</strong>
          </div>
          <div>
            <span style="color:var(--muted-text); display:block; font-size:0.72rem; font-weight:600;">Warp Yarn Count</span>
            <strong style="font-family:var(--font-mono);">${order.specs.warpYarn}</strong>
          </div>
          <div>
            <span style="color:var(--muted-text); display:block; font-size:0.72rem; font-weight:600;">Weft Yarn Count</span>
            <strong style="font-family:var(--font-mono);">${order.specs.weftYarn}</strong>
          </div>
          <div>
            <span style="color:var(--muted-text); display:block; font-size:0.72rem; font-weight:600;">Reed Space &amp; Width</span>
            <strong>${order.specs.reedSpace}</strong>
          </div>
          <div>
            <span style="color:var(--muted-text); display:block; font-size:0.72rem; font-weight:600;">Thread Density (EPI × PPI)</span>
            <strong style="font-family:var(--font-mono);">${order.specs.density}</strong>
          </div>
          <div>
            <span style="color:var(--muted-text); display:block; font-size:0.72rem; font-weight:600;">Assigned Production Line</span>
            <strong>${order.specs.assignedLooms}</strong>
          </div>
          <div>
            <span style="color:var(--muted-text); display:block; font-size:0.72rem; font-weight:600;">Target Dye Lot / Finish</span>
            <strong>${order.specs.colorCode}</strong>
          </div>
        </div>
      </div>

      <!-- Modal Quick Actions -->
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; border-top:1px solid var(--soft-border); padding-top:18px;">
        <button class="btn btn-secondary" onclick="Orders.reportIssueForOrder('${order.id}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Report Issue for Order
        </button>
        <div style="display:flex; align-items:center; gap:10px;">
          <button class="btn btn-secondary" onclick="Navigation.closeModal('orderDetailModal')">Close</button>
          <button class="btn btn-primary" onclick="Orders.logProductionForOrder('${order.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
            Log Production for this Order
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  logProductionForOrder(orderId) {
    Navigation.closeModal('orderDetailModal');
    Navigation.navigateTo('production');
    setTimeout(() => {
      const select = document.getElementById('prodFormOrderSelect');
      if (select) {
        select.value = orderId;
        select.dispatchEvent(new Event('change'));
      }
    }, 200);
  },

  reportIssueForOrder(orderId) {
    Navigation.closeModal('orderDetailModal');
    Navigation.navigateTo('issues');
    setTimeout(() => {
      const select = document.getElementById('issueFormOrderSelect');
      if (select) {
        select.value = orderId;
      }
    }, 200);
  }
};

window.Orders = Orders;
