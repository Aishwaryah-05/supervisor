/**
 * LoomPilot Supervisor Portal - Production Updates Controller
 * Manages daily production logging, reactive formulas, real-time recalculations, and history log.
 */

const Production = {
  init() {
    this.bindEvents();
    this.populateOrderSelect();
    this.populateProcessSelect();
  },

  bindEvents() {
    // Order dropdown change in form
    const orderSelect = document.getElementById('prodFormOrderSelect');
    if (orderSelect) {
      orderSelect.addEventListener('change', () => this.handleOrderSelectionChange());
    }

    // Reactive input listeners for live formulas
    const actualInput = document.getElementById('prodFormActualQty');
    const defectiveInput = document.getElementById('prodFormDefectiveQty');
    const targetInput = document.getElementById('prodFormDailyTarget');

    [actualInput, defectiveInput, targetInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => this.updateLiveCalculation());
      }
    });

    // Form submission
    const form = document.getElementById('productionUpdateForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitProductionUpdate();
      });
    }
  },

  populateOrderSelect() {
    const select = document.getElementById('prodFormOrderSelect');
    if (!select) return;

    const orders = store.getOrders();
    select.innerHTML = `
      <option value="">-- Select Active Manufacturing Order --</option>
      ${orders.filter(o => o.status !== 'Completed').map(o => `
        <option value="${o.id}">
          ${o.fabricName} (${o.clientName} - ${o.remainingQty.toLocaleString()}m balance)
        </option>
      `).join('')}
    `;
  },

  populateProcessSelect() {
    const select = document.getElementById('prodFormProcessSelect');
    if (!select) return;

    select.innerHTML = `
      <option value="">-- Select Production Stage --</option>
      ${PRODUCTION_STAGES.map(stage => `
        <option value="${stage}">${stage}</option>
      `).join('')}
    `;
  },

  render() {
    const orders = store.getOrders();
    const prodLogs = store.getProductionLogs();

    this.populateOrderSelect();
    this.populateProcessSelect();
    this.renderMetrics(orders, prodLogs);
    this.renderReportTable(orders);
    this.renderHistoryTable(prodLogs);
  },

  renderMetrics(orders, prodLogs) {
    const activeOrders = orders.filter(o => o.status !== 'Completed').length;
    const todayActual = prodLogs.reduce((acc, l) => acc + (l.actualQty || 0), 0);
    const todayTarget = 4000;
    const totalProducedAll = orders.reduce((acc, o) => acc + (o.producedQty || 0), 0);
    const totalRemainingAll = orders.reduce((acc, o) => acc + (o.remainingQty || 0), 0);

    const elAssigned = document.getElementById('prodMetricAssignedOrders');
    const elTarget = document.getElementById('prodMetricTodayTarget');
    const elActual = document.getElementById('prodMetricTodayActual');
    const elTotalProd = document.getElementById('prodMetricTotalProduced');
    const elRemaining = document.getElementById('prodMetricRemainingQty');

    if (elAssigned) elAssigned.textContent = `${activeOrders} Active`;
    if (elTarget) elTarget.textContent = `${todayTarget.toLocaleString()} m`;
    if (elActual) elActual.textContent = `${todayActual.toLocaleString()} m`;
    if (elTotalProd) elTotalProd.textContent = `${totalProducedAll.toLocaleString()} m`;
    if (elRemaining) elRemaining.textContent = `${totalRemainingAll.toLocaleString()} m`;
  },

  renderReportTable(orders) {
    const tbody = document.getElementById('productionReportTableBody');
    if (!tbody) return;

    tbody.innerHTML = orders.map(order => {
      const pct = order.totalQty > 0 ? Math.round((order.producedQty / order.totalQty) * 100) : 0;
      return `
        <tr>
          <td>
            <div style="font-weight:700; color:var(--deep-charcoal);">${order.fabricName}</div>
            <div style="font-size:0.72rem; color:var(--muted-text);">${order.clientName}</div>
          </td>
          <td>
            <span class="badge badge-neutral">${order.currentStage}</span>
          </td>
          <td style="text-align:right; font-weight:700;">${order.totalQty.toLocaleString()} m</td>
          <td style="text-align:right; font-weight:700; color:var(--success-green);">${order.producedQty.toLocaleString()} m</td>
          <td style="text-align:right; font-weight:700; color:var(--vermilion);">${order.dailyTarget} m / day</td>
          <td style="text-align:right; font-weight:700; color:${order.remainingQty > 0 ? 'var(--deep-charcoal)' : 'var(--muted-text)'};">
            ${order.remainingQty.toLocaleString()} m
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <div class="progress-track" style="width:70px; height:8px;">
                <div class="progress-fill ${pct === 100 ? 'green' : ''}" style="width:${pct}%;"></div>
              </div>
              <span style="font-size:0.75rem; font-weight:700;">${pct}%</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderHistoryTable(prodLogs) {
    const tbody = document.getElementById('productionHistoryTableBody');
    if (!tbody) return;

    if (prodLogs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding:24px; color:var(--muted-text);">
            No production logs recorded yet for this shift.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = prodLogs.map(log => `
      <tr>
        <td>
          <div style="font-weight:600; font-size:0.82rem;">${log.fabricName}</div>
          <div style="font-size:0.7rem; color:var(--muted-text);">${log.process}</div>
        </td>
        <td style="text-align:right; font-weight:700; color:var(--success-green); font-size:0.9rem;">
          +${log.actualQty.toLocaleString()} m
        </td>
        <td style="text-align:right; font-size:0.8rem; color:${log.defectiveQty > 0 ? 'var(--danger-red)' : 'var(--muted-text)'};">
          ${log.defectiveQty} m (${((log.defectiveQty / (log.actualQty || 1)) * 100).toFixed(1)}%)
        </td>
        <td>
          <div style="font-size:0.78rem; color:var(--deep-charcoal);">${log.notes || '--'}</div>
        </td>
        <td>
          <div style="font-size:0.75rem; font-weight:600;">${log.timestamp}</div>
          <div style="font-size:0.68rem; color:var(--muted-text);">${log.supervisor}</div>
        </td>
      </tr>
    `).join('');
  },

  handleOrderSelectionChange() {
    const orderId = document.getElementById('prodFormOrderSelect').value;
    const orders = store.getOrders();
    const order = orders.find(o => o.id === orderId);

    const targetInput = document.getElementById('prodFormDailyTarget');
    const processSelect = document.getElementById('prodFormProcessSelect');

    if (order) {
      if (targetInput) targetInput.value = order.dailyTarget;
      if (processSelect) processSelect.value = order.currentStage;
    }

    this.updateLiveCalculation();
  },

  updateLiveCalculation() {
    const orderId = document.getElementById('prodFormOrderSelect').value;
    const actualQty = parseFloat(document.getElementById('prodFormActualQty').value) || 0;
    const dailyTarget = parseFloat(document.getElementById('prodFormDailyTarget').value) || 1;

    const orders = store.getOrders();
    const order = orders.find(o => o.id === orderId);

    const prevProduced = order ? order.producedQty : 0;
    const totalQty = order ? order.totalQty : 0;

    // Formulas prescribed strictly:
    // Remaining Quantity = Total Quantity - Cumulative Produced Quantity
    const cumulativeProduced = prevProduced + actualQty;
    const remainingQty = Math.max(0, totalQty - cumulativeProduced);
    // Production Percentage = Cumulative Produced Quantity / Total Quantity × 100
    const productionPercentage = totalQty > 0 ? ((cumulativeProduced / totalQty) * 100).toFixed(1) : 0;
    // Efficiency
    const efficiency = ((actualQty / dailyTarget) * 100).toFixed(1);

    const elPrev = document.getElementById('calcPrevProduced');
    const elNewCumul = document.getElementById('calcNewCumulative');
    const elRem = document.getElementById('calcRemainingQty');
    const elPct = document.getElementById('calcProductionPct');
    const elEff = document.getElementById('calcEfficiency');

    if (elPrev) elPrev.textContent = `${prevProduced.toLocaleString()} m`;
    if (elNewCumul) elNewCumul.textContent = `${cumulativeProduced.toLocaleString()} m`;
    if (elRem) elRem.textContent = `${remainingQty.toLocaleString()} m`;
    if (elPct) elPct.textContent = `${productionPercentage}%`;
    if (elEff) elEff.textContent = `${efficiency}%`;
  },

  submitProductionUpdate() {
    const orderId = document.getElementById('prodFormOrderSelect').value;
    const date = document.getElementById('prodFormDate').value;
    const process = document.getElementById('prodFormProcessSelect').value;
    const target = parseFloat(document.getElementById('prodFormDailyTarget').value) || 0;
    const actual = parseFloat(document.getElementById('prodFormActualQty').value) || 0;
    const defective = parseFloat(document.getElementById('prodFormDefectiveQty').value) || 0;
    const notes = document.getElementById('prodFormNotes').value.trim();

    if (!orderId || !process || actual <= 0) {
      showToast("Please select an order, stage, and enter valid produced meters (> 0).", "warning");
      return;
    }

    const orders = store.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Update order quantities
    order.producedQty += actual;
    order.remainingQty = Math.max(0, order.totalQty - order.producedQty);
    order.currentStage = process;

    if (order.remainingQty === 0) {
      order.status = "Completed";
    } else if (order.status === "Newly Assigned" || order.status === "Not Started") {
      order.status = "In Progress";
      order.isNew = false;
    }

    store.saveOrders(orders);

    // Create log entry
    const prodLogs = store.getProductionLogs();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const logId = `PROD-LOG-${Math.floor(100 + Math.random() * 900)}`;

    prodLogs.unshift({
      id: logId,
      orderId: order.id,
      fabricName: order.fabricName,
      date: date || '2026-10-30',
      process: process,
      dailyTarget: target,
      actualQty: actual,
      defectiveQty: defective,
      notes: notes,
      supervisor: "Rajesh Kumar",
      timestamp: timeStr
    });
    store.saveProductionLogs(prodLogs);

    // Create Notification
    const notifs = store.getNotifications();
    notifs.unshift({
      id: `NOTIF-${Date.now()}`,
      type: "production",
      title: `Production Update Logged: +${actual.toLocaleString()}m`,
      message: `Supervisor Rajesh Kumar logged ${actual.toLocaleString()} meters for ${order.fabricName}. Balance: ${order.remainingQty.toLocaleString()}m.`,
      timestamp: "Just now",
      timeFormatted: `Today, ${timeStr}`,
      isRead: false,
      linkPage: "production",
      refId: order.id
    });
    store.saveNotifications(notifs);

    // Reset Form inputs
    document.getElementById('prodFormActualQty').value = '';
    document.getElementById('prodFormDefectiveQty').value = '0';
    document.getElementById('prodFormNotes').value = '';

    // Re-render
    this.render();
    Navigation.updateBadges();

    showToast(`Successfully logged ${actual.toLocaleString()} meters for ${order.fabricName}.`, "success", 4000);
  }
};

window.Production = Production;

