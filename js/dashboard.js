/**
 * LoomPilot Supervisor Portal - Dashboard Controller
 * Computes live operational metrics, renders summaries, activities, and quick actions.
 */

const Dashboard = {
  render() {
    this.renderStats();
    this.renderMaterialsSummary();
    this.renderMachineSummary();
    this.renderProductionOverview();
    this.renderNewlyAssignedOrders();
    this.renderRecentActivities();
    this.bindQuickActions();
  },

  renderStats() {
    const machines = store.getMachines();
    const orders = store.getOrders();
    const prodLogs = store.getProductionLogs();
    const materials = store.getMaterials();

    // Raw Materials numbers
    const totalMatKg = materials.reduce((acc, m) => acc + (typeof m.inStockQty === 'number' && !m.category.includes('Warp Beams') ? m.inStockQty : 0), 0);

    // Machines numbers
    const totalMachines = machines.length;
    const runningMachines = machines.filter(m => m.status === 'Running').length;
    const availableMachines = machines.filter(m => m.status === 'Available').length;
    const readyMachines = runningMachines + availableMachines;

    // Loom efficiency (running machines average)
    let totalEff = 0;
    let effCount = 0;
    machines.forEach(m => {
      if (m.efficiency) {
        totalEff += parseFloat(m.efficiency);
        effCount++;
      }
    });
    const avgEff = effCount > 0 ? (totalEff / effCount).toFixed(1) + '%' : '93.8%';

    // Orders numbers
    const totalOrders = orders.length;
    const atRiskOrders = orders.filter(o => o.status === 'At Risk').length;

    // Today's Production
    const todayActual = prodLogs.reduce((acc, log) => acc + (log.actualQty || 0), 0);

    // Populate stat elements
    const elEff = document.getElementById('dashLoomEfficiency');
    const elMatStock = document.getElementById('dashRawMaterialsStock');
    const elMachAvail = document.getElementById('dashMachinesAvailable');
    const elOrdersAssigned = document.getElementById('dashAssignedOrders');
    const elProdOutput = document.getElementById('dashTodayOutput');
    const elOrdersRisk = document.getElementById('dashOrdersRisk');
    const elWelcomeOutput = document.getElementById('welcomeOutputBig');

    if (elEff) elEff.textContent = avgEff;
    if (elMatStock) elMatStock.textContent = `${totalMatKg.toLocaleString()} kg`;
    if (elMachAvail) elMachAvail.textContent = `${readyMachines} / ${totalMachines}`;
    if (elOrdersAssigned) elOrdersAssigned.textContent = `${totalOrders}`;
    if (elProdOutput) elProdOutput.textContent = `${todayActual.toLocaleString()} m`;
    if (elWelcomeOutput) elWelcomeOutput.textContent = `${todayActual.toLocaleString()} m`;
    if (elOrdersRisk) elOrdersRisk.textContent = atRiskOrders;
  },

  renderMaterialsSummary() {
    const container = document.getElementById('dashMaterialsSummary');
    if (!container) return;

    const materials = store.getMaterials();
    const alertCount = materials.filter(m => m.status === 'Low Stock Alert' || m.inStockQty <= m.thresholdQty).length;
    const cottonKg = materials.filter(m => m.category === 'Cotton Yarns').reduce((acc, m) => acc + (m.inStockQty || 0), 0);
    const specKg = materials.filter(m => m.category.includes('Specialty') || m.category.includes('Synthetics')).reduce((acc, m) => acc + (m.inStockQty || 0), 0);
    const beams = materials.filter(m => m.category === 'Warp Beams').reduce((acc, m) => acc + (m.inStockQty || 0), 0);

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div>
            <span style="font-size:1.2rem; font-weight:800; color:var(--deep-charcoal);">${materials.length} Lots</span>
            <span style="font-size:0.75rem; color:var(--muted-text);"> in Factory Stock</span>
          </div>
          ${alertCount > 0 
            ? `<span class="badge badge-danger" style="font-size:0.68rem; padding:2px 6px;"><span class="badge-dot"></span> 1 Shortage Alert</span>`
            : `<span class="badge badge-success" style="font-size:0.68rem; padding:2px 6px;"><span class="badge-dot"></span> Stock Optimal</span>`
          }
        </div>

        <!-- Metric pills for raw materials categories -->
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; text-align:center;">
          <div style="background:var(--surface-alt); border:1px solid var(--soft-border); border-radius:var(--radius-xs); padding:4px 2px;">
            <div style="font-size:0.62rem; color:var(--muted-text); font-weight:700;">COTTON</div>
            <div style="font-size:0.88rem; font-weight:800; color:var(--deep-charcoal);">${(cottonKg/1000).toFixed(1)}t</div>
          </div>
          <div style="background:var(--surface-alt); border:1px solid var(--soft-border); border-radius:var(--radius-xs); padding:4px 2px;">
            <div style="font-size:0.62rem; color:var(--muted-text); font-weight:700;">FLAX &amp; SILK</div>
            <div style="font-size:0.88rem; font-weight:800; color:var(--deep-charcoal);">${(specKg/1000).toFixed(1)}t</div>
          </div>
          <div style="background:var(--surface-alt); border:1px solid var(--soft-border); border-radius:var(--radius-xs); padding:4px 2px;">
            <div style="font-size:0.62rem; color:var(--muted-text); font-weight:700;">BEAMS</div>
            <div style="font-size:0.88rem; font-weight:800; color:var(--deep-charcoal);">${beams} Ready</div>
          </div>
          <div style="background:${alertCount > 0 ? 'var(--danger-light)' : 'var(--surface-alt)'}; border:1px solid ${alertCount > 0 ? 'rgba(217,56,41,0.2)' : 'var(--soft-border)'}; border-radius:var(--radius-xs); padding:4px 2px;">
            <div style="font-size:0.62rem; color:${alertCount > 0 ? 'var(--danger-red)' : 'var(--muted-text)'}; font-weight:700;">ALERT</div>
            <div style="font-size:0.88rem; font-weight:800; color:${alertCount > 0 ? 'var(--danger-red)' : 'var(--deep-charcoal)'};">${alertCount} Low</div>
          </div>
        </div>

        <div style="font-size:0.72rem; color:var(--muted-text); display:flex; justify-content:space-between; align-items:center;">
          <span>Critical: 60s Micro-Modal (&lt;450 kg left)</span>
          <a href="#materials" onclick="Navigation.navigateTo('materials'); return false;" style="color:var(--vermilion); font-weight:700; text-decoration:none;">View Inventory &rarr;</a>
        </div>
      </div>
    `;
  },

  renderMachineSummary() {
    const machines = store.getMachines();
    const running = machines.filter(m => m.status === 'Running').length;
    const available = machines.filter(m => m.status === 'Available').length;
    const maintenance = machines.filter(m => m.status === 'Under Maintenance').length;
    const breakdown = machines.filter(m => m.status === 'Breakdown').length;
    const total = machines.length;

    const container = document.getElementById('dashMachineSummary');
    if (!container) return;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="font-size:1.2rem; font-weight:800; color:var(--deep-charcoal);">${running}</span>
            <span style="font-size:0.75rem; color:var(--muted-text);"> / ${total} Looms Active</span>
          </div>
          <span class="badge ${breakdown > 0 ? 'badge-danger' : 'badge-success'}" style="font-size:0.68rem; padding:2px 6px;">
            <span class="badge-dot"></span> ${breakdown > 0 ? `${breakdown} Breakdown Alert` : '100% Operational'}
          </span>
        </div>

        <div style="display:flex; height:8px; border-radius:var(--radius-full); overflow:hidden; background:var(--surface-alt); border:1px solid var(--soft-border);">
          <div style="width:${(running/total)*100}%; background:var(--success-green);" title="Running: ${running}"></div>
          <div style="width:${(available/total)*100}%; background:var(--info-blue);" title="Available: ${available}"></div>
          <div style="width:${(maintenance/total)*100}%; background:var(--warning-amber);" title="Under Maintenance: ${maintenance}"></div>
          <div style="width:${(breakdown/total)*100}%; background:var(--danger-red);" title="Breakdown: ${breakdown}"></div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; text-align:center;">
          <div style="background:var(--success-light); border:1px solid rgba(32,132,90,0.2); border-radius:var(--radius-xs); padding:4px 2px;">
            <div style="font-size:0.62rem; color:var(--success-green); font-weight:700;">RUNNING</div>
            <div style="font-size:0.95rem; font-weight:800; color:var(--success-green);">${running}</div>
          </div>
          <div style="background:var(--surface-alt); border:1px solid var(--soft-border); border-radius:var(--radius-xs); padding:4px 2px;">
            <div style="font-size:0.62rem; color:var(--info-blue); font-weight:700;">AVAILABLE</div>
            <div style="font-size:0.95rem; font-weight:800; color:var(--deep-charcoal);">${available}</div>
          </div>
          <div style="background:var(--warning-light); border:1px solid rgba(199,134,39,0.2); border-radius:var(--radius-xs); padding:4px 2px;">
            <div style="font-size:0.62rem; color:var(--warning-amber); font-weight:700;">MAINT.</div>
            <div style="font-size:0.95rem; font-weight:800; color:var(--warning-amber);">${maintenance}</div>
          </div>
          <div style="background:var(--danger-light); border:1px solid rgba(217,56,41,0.2); border-radius:var(--radius-xs); padding:4px 2px;">
            <div style="font-size:0.62rem; color:var(--danger-red); font-weight:700;">HALTED</div>
            <div style="font-size:0.95rem; font-weight:800; color:var(--danger-red);">${breakdown}</div>
          </div>
        </div>
      </div>
    `;
  },

  renderProductionOverview() {
    const orders = store.getOrders();
    const prodLogs = store.getProductionLogs();
    const todayActual = prodLogs.reduce((acc, log) => acc + (log.actualQty || 0), 0);
    const todayTarget = 4000;
    const progressPct = Math.min(100, Math.round((todayActual / todayTarget) * 100));

    const container = document.getElementById('dashProductionOverview');
    if (!container) return;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="font-size:1.2rem; font-weight:800; color:var(--deep-charcoal);">${todayActual.toLocaleString()} m</span>
            <span style="font-size:0.75rem; color:var(--muted-text);"> / ${todayTarget.toLocaleString()} m Quota</span>
          </div>
          <span class="badge ${progressPct >= 80 ? 'badge-success' : 'badge-warning'}" style="font-size:0.68rem; padding:2px 6px;">
            ${progressPct}% of Daily Target
          </span>
        </div>

        <div class="progress-bar-container" style="height:8px; margin:0;">
          <div class="progress-bar-fill" style="width:${progressPct}%;"></div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <div style="background:var(--surface-alt); border:1px solid var(--soft-border); border-radius:var(--radius-xs); padding:5px 8px;">
            <div style="font-size:0.68rem; color:var(--muted-text); font-weight:600;">ACTIVE LOOM LINES</div>
            <div style="font-size:0.84rem; font-weight:700; color:var(--deep-charcoal);">7 Looms Running</div>
          </div>
          <div style="background:var(--surface-alt); border:1px solid var(--soft-border); border-radius:var(--radius-xs); padding:5px 8px;">
            <div style="font-size:0.68rem; color:var(--muted-text); font-weight:600;">SHIFT REMAINING</div>
            <div style="font-size:0.84rem; font-weight:700; color:var(--vermilion);">2h 45m left</div>
          </div>
        </div>
      </div>
    `;
  },

  renderNewlyAssignedOrders() {
    const orders = store.getOrders();
    const newOrders = orders.filter(o => o.status === 'Newly Assigned' || o.isNew).slice(0, 3);
    const container = document.getElementById('dashNewOrdersList');
    if (!container) return;

    if (newOrders.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:15px; color:var(--muted-text); font-size:0.8rem;">No pending newly assigned orders.</div>`;
      return;
    }

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${newOrders.map(ord => `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; background:var(--surface-alt); border:1px solid var(--soft-border); border-radius:var(--radius-sm); cursor:pointer;" onclick="Orders.openDetailModal('${ord.id}')">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge badge-vermilion" style="font-size:0.65rem; padding:2px 5px;">NEW</span>
              <div>
                <div style="font-weight:700; font-size:0.82rem; color:var(--deep-charcoal);">${ord.fabricName}</div>
                <div style="font-size:0.7rem; color:var(--muted-text);">${ord.clientName} &bull; ${ord.totalQty.toLocaleString()} m</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.72rem; font-weight:700; color:var(--deep-charcoal);">${ord.deliveryDeadline}</div>
              <div style="font-size:0.68rem; color:var(--vermilion); font-weight:600;">${ord.currentStage}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderRecentActivities() {
    const container = document.getElementById('dashRecentActivities');
    if (!container) return;

    const activities = [
      { time: '10:45 AM', text: 'Airjet Loom Line 3 restarted after warp break tie-in', type: 'info' },
      { time: '10:15 AM', text: 'Sectional Warp Beam #104 mounted on Picanol Loom Line 1', type: 'prod' },
      { time: '09:30 AM', text: '60s Micro-Modal yarn stock reached reorder threshold (420 kg)', type: 'warn' },
      { time: '08:45 AM', text: 'Greige QC audit completed for Organic Cotton Twill Lot 4: 99.4% pass', type: 'info' },
      { time: '07:15 AM', text: 'Morning Shift A operations running at 93.8% weaving efficiency', type: 'info' }
    ];

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${activities.map(act => `
          <div style="display:flex; align-items:center; gap:8px; font-size:0.76rem;">
            <span style="font-weight:700; color:var(--muted-text); font-family:monospace; min-width:60px;">${act.time}</span>
            <span style="width:6px; height:6px; border-radius:50%; background:${
              act.type === 'warn' ? 'var(--warning-amber)' :
              act.type === 'prod' ? 'var(--vermilion)' : 'var(--success-green)'
            }; flex-shrink:0;"></span>
            <span style="color:var(--deep-charcoal); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${act.text}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  bindQuickActions() {
    const actOrders = document.getElementById('dashActOrders');
    if (actOrders) {
      actOrders.onclick = () => Navigation.navigateTo('orders');
    }

    const actMaterials = document.getElementById('dashActMaterials');
    if (actMaterials) {
      actMaterials.onclick = () => Navigation.navigateTo('materials');
    }

    const actResources = document.getElementById('dashActResources');
    if (actResources) {
      actResources.onclick = () => Navigation.navigateTo('resources');
    }

    const actProduction = document.getElementById('dashActProduction');
    if (actProduction) {
      actProduction.onclick = () => Dashboard.openDailyUpdateModal();
    }

    const actReportIssue = document.getElementById('dashActIssue');
    if (actReportIssue) {
      actReportIssue.onclick = () => Navigation.navigateTo('issues');
    }
  },

  openDailyUpdateModal() {
    const modal = document.getElementById('dailyUpdateModal');
    const body = document.getElementById('dailyUpdateModalBody');
    if (!modal || !body) return;

    const orders = store.getOrders();
    const materials = store.getMaterials();
    const activeOrders = orders.filter(o => o.status !== 'Completed');

    // Retrieve saved headcount or fall back to defaults
    let savedHeadcount = null;
    try {
      const raw = localStorage.getItem('loompilot_shift_headcount');
      if (raw) savedHeadcount = JSON.parse(raw);
    } catch (e) {
      savedHeadcount = null;
    }

    const totalWorkers = savedHeadcount ? savedHeadcount.total : 48;
    const weavingWorkers = savedHeadcount ? savedHeadcount.weaving : 24;
    const warpingWorkers = savedHeadcount ? savedHeadcount.warping : 8;
    const qcWorkers = savedHeadcount ? savedHeadcount.qc : 6;
    const maintWorkers = savedHeadcount ? savedHeadcount.maint : 10;

    // Materials options (Clean names, NO CODES!)
    const materialOptions = materials.map(m => `
      <option value="${m.id}" data-stock="${m.inStockQty}" data-unit="${m.unit}" data-status="${m.status}">
        ${m.name} (${m.composition})
      </option>
    `).join('');

    const firstMat = materials[0];

    // Build Orders Table rows
    const orderRowsHtml = activeOrders.map(order => {
      const pct = order.totalQty > 0 ? Math.round((order.producedQty / order.totalQty) * 100) : 0;
      return `
        <tr class="daily-order-row" data-order-row="${order.id}">
          <td style="padding: 10px 14px;">
            <div style="font-weight: 700; color: var(--deep-charcoal); font-size: 0.86rem; margin-bottom: 2px;">
              ${order.fabricName}
            </div>
            <div style="font-size: 0.72rem; color: var(--muted-text);">
              ${order.clientName} &bull; Weave: ${order.specs.weavePattern}
            </div>
          </td>
          <td style="text-align: right; font-weight: 700; font-family: var(--font-mono); font-size: 0.84rem; padding: 10px 12px;">
            ${order.totalQty.toLocaleString()} m
          </td>
          <td style="text-align: right; font-weight: 700; color: var(--success-green); font-family: var(--font-mono); font-size: 0.84rem; padding: 10px 12px;">
            ${order.producedQty.toLocaleString()} m
          </td>
          <td style="text-align: right; padding: 8px 12px;">
            <div style="display: inline-flex; align-items: center; gap: 4px;">
              <span style="font-size: 0.78rem; font-weight: 700; color: var(--muted-text);">+</span>
              <input type="number" 
                     class="form-control form-control-sm daily-produced-input" 
                     data-order-id="${order.id}"
                     data-total="${order.totalQty}"
                     data-prev="${order.producedQty}"
                     placeholder="0"
                     min="0"
                     max="${order.remainingQty}"
                     style="width: 100px; text-align: right; font-weight: 700; font-family: var(--font-mono);"
                     oninput="Dashboard.recalcDailyOrder('${order.id}')">
              <span style="font-size: 0.72rem; color: var(--muted-text);">m</span>
            </div>
          </td>
          <td style="text-align: right; padding: 10px 14px;">
            <div class="daily-rem-display" id="dailyRem_${order.id}" style="font-weight: 800; font-family: var(--font-mono); color: var(--vermilion); font-size: 0.86rem;">
              ${order.remainingQty.toLocaleString()} m left
            </div>
          </td>
          <td style="padding: 10px 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="progress-track" style="width: 48px; height: 6px; flex-shrink: 0;">
                <div class="progress-fill ${pct === 100 ? 'green' : ''}" id="dailyProgBar_${order.id}" style="width: ${pct}%;"></div>
              </div>
              <span id="dailyProgPct_${order.id}" style="font-size: 0.72rem; font-weight: 700; font-family: var(--font-mono);">
                ${pct}%
              </span>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    body.innerHTML = `
      <form id="dailyUpdateOperationsForm" onsubmit="Dashboard.handleDailyUpdateSubmit(event)">
        <!-- 1. Workforce Headcount Section -->
        <div style="background: var(--surface-alt); border: 1px solid var(--soft-border); border-radius: var(--radius-md); padding: 16px 18px; margin-bottom: 18px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 24px; height: 24px; border-radius: 6px; background: var(--info-light); color: var(--info-blue); display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <span style="font-weight: 800; font-size: 0.88rem; color: var(--deep-charcoal); text-transform: uppercase; letter-spacing: 0.5px;">
                1. Shift Personnel Headcount
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 0.74rem; color: var(--muted-text); font-weight: 600;">Total On-Duty Workers:</span>
              <input type="number" id="dailyTotalHeadcount" class="form-control" value="${totalWorkers}" min="1" max="200" style="width: 70px; height: 30px; font-weight: 800; font-size: 0.95rem; text-align: center; color: var(--deep-charcoal);" oninput="Dashboard.handleDirectTotalChange()">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
            <div style="background: var(--white); border: 1px solid var(--soft-border); border-radius: var(--radius-sm); padding: 8px 12px;">
              <div style="font-size: 0.68rem; color: var(--muted-text); font-weight: 700; text-transform: uppercase;">Loom Weaving</div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                <span style="font-size: 0.72rem; color: var(--muted-text);">Airjet &amp; Rapier</span>
                <input type="number" id="dailyHeadcountWeaving" class="form-control form-control-sm daily-worker-sub" value="${weavingWorkers}" min="0" style="width: 55px; height: 26px; text-align: right; font-weight: 700;" oninput="Dashboard.recalcWorkerTotal()">
              </div>
            </div>

            <div style="background: var(--white); border: 1px solid var(--soft-border); border-radius: var(--radius-sm); padding: 8px 12px;">
              <div style="font-size: 0.68rem; color: var(--muted-text); font-weight: 700; text-transform: uppercase;">Warping &amp; Sizing</div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                <span style="font-size: 0.72rem; color: var(--muted-text);">Creel &amp; Beam Prep</span>
                <input type="number" id="dailyHeadcountWarping" class="form-control form-control-sm daily-worker-sub" value="${warpingWorkers}" min="0" style="width: 55px; height: 26px; text-align: right; font-weight: 700;" oninput="Dashboard.recalcWorkerTotal()">
              </div>
            </div>

            <div style="background: var(--white); border: 1px solid var(--soft-border); border-radius: var(--radius-sm); padding: 8px 12px;">
              <div style="font-size: 0.68rem; color: var(--muted-text); font-weight: 700; text-transform: uppercase;">Quality Inspection</div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                <span style="font-size: 0.72rem; color: var(--muted-text);">4-Point Grading Lab</span>
                <input type="number" id="dailyHeadcountQC" class="form-control form-control-sm daily-worker-sub" value="${qcWorkers}" min="0" style="width: 55px; height: 26px; text-align: right; font-weight: 700;" oninput="Dashboard.recalcWorkerTotal()">
              </div>
            </div>

            <div style="background: var(--white); border: 1px solid var(--soft-border); border-radius: var(--radius-sm); padding: 8px 12px;">
              <div style="font-size: 0.68rem; color: var(--muted-text); font-weight: 700; text-transform: uppercase;">Maintenance &amp; Tech</div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                <span style="font-size: 0.72rem; color: var(--muted-text);">Mechanical &amp; Dispatch</span>
                <input type="number" id="dailyHeadcountMaint" class="form-control form-control-sm daily-worker-sub" value="${maintWorkers}" min="0" style="width: 55px; height: 26px; text-align: right; font-weight: 700;" oninput="Dashboard.recalcWorkerTotal()">
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Raw Materials Availability Section -->
        <div style="background: var(--surface-alt); border: 1px solid var(--soft-border); border-radius: var(--radius-md); padding: 16px 18px; margin-bottom: 18px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 24px; height: 24px; border-radius: 6px; background: var(--warning-light); color: var(--warning-amber); display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline></svg>
              </div>
              <span style="font-weight: 800; font-size: 0.88rem; color: var(--deep-charcoal); text-transform: uppercase; letter-spacing: 0.5px;">
                2. Raw Materials Availability &amp; Inventory Status
              </span>
            </div>
            <span class="badge badge-success" style="font-size: 0.72rem;"><span class="badge-dot"></span> Active Inventory Link</span>
          </div>

          <div style="display: grid; grid-template-columns: 1.6fr 1fr 1fr; gap: 10px; align-items: flex-end;">
            <div>
              <label style="display: block; font-size: 0.72rem; color: var(--muted-text); font-weight: 700; margin-bottom: 4px;">
                Select Material to Update Stock:
              </label>
              <select id="dailyMatSelect" class="form-select" style="font-size: 0.82rem; height: 34px;" onchange="Dashboard.handleMaterialSelectChange()">
                ${materialOptions}
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 0.72rem; color: var(--muted-text); font-weight: 700; margin-bottom: 4px;">
                Available Stock Quantity:
              </label>
              <div style="display: flex; align-items: center; gap: 6px;">
                <input type="number" id="dailyMatStockQty" class="form-control" value="${firstMat ? firstMat.inStockQty : 5000}" min="0" style="height: 34px; font-weight: 800; font-family: var(--font-mono);">
                <span id="dailyMatUnitLabel" style="font-size: 0.74rem; color: var(--muted-text); white-space: nowrap;">
                  ${firstMat ? firstMat.unit : 'kg'}
                </span>
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.72rem; color: var(--muted-text); font-weight: 700; margin-bottom: 4px;">
                Inventory Status:
              </label>
              <select id="dailyMatStatus" class="form-select" style="font-size: 0.82rem; height: 34px;">
                <option value="In Stock" ${firstMat && firstMat.status === 'In Stock' ? 'selected' : ''}>In Stock (Optimal)</option>
                <option value="Ready for Loom" ${firstMat && firstMat.status === 'Ready for Loom' ? 'selected' : ''}>Ready for Loom</option>
                <option value="Low Stock Alert" ${firstMat && firstMat.status === 'Low Stock Alert' ? 'selected' : ''}>Low Stock Alert</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 3. Per-Order Production & Balance Remaining Section -->
        <div style="background: var(--white); border: 1px solid var(--soft-border); border-radius: var(--radius-md); padding: 16px 18px; margin-bottom: 18px; box-shadow: var(--shadow-subtle);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 24px; height: 24px; border-radius: 6px; background: var(--vermilion-light); color: var(--vermilion); display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
              </div>
              <span style="font-weight: 800; font-size: 0.88rem; color: var(--deep-charcoal); text-transform: uppercase; letter-spacing: 0.5px;">
                3. Manufacturing Orders — Produced Today &amp; Remaining Left
              </span>
            </div>
            <span style="font-size: 0.72rem; color: var(--vermilion); font-weight: 700;">
              Live Balance Recalculation
            </span>
          </div>

          <p style="font-size: 0.76rem; color: var(--muted-text); margin: 0 0 12px 0;">
            Enter the meters produced today for each fabric order. The remaining meters left to weave will update in real time.
          </p>

          <div style="border: 1px solid var(--soft-border); border-radius: var(--radius-sm); overflow: hidden; background: #FFFFFF;">
            <table class="data-table" style="margin: 0; width: 100%; table-layout: fixed;">
              <thead>
                <tr style="background: #F8F4EE;">
                  <th style="width: 32%;">Fabric Name &amp; Client</th>
                  <th style="width: 14%; text-align: right;">Total Target</th>
                  <th style="width: 14%; text-align: right;">Produced So Far</th>
                  <th style="width: 18%; text-align: right;">Produced Today</th>
                  <th style="width: 14%; text-align: right;">Remaining Left</th>
                  <th style="width: 8%;">Progress</th>
                </tr>
              </thead>
              <tbody id="dailyOrdersTableBody">
                ${orderRowsHtml}
              </tbody>
            </table>
          </div>

          <!-- Live Totals Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-warm-ivory); border: 1px solid var(--soft-border); border-radius: var(--radius-sm); padding: 10px 14px; margin-top: 10px;">
            <div style="font-size: 0.76rem; color: var(--muted-text);">
              Combined Shift Production: <strong id="dailySummaryMeters" style="color: var(--success-green); font-size: 0.88rem; font-family: var(--font-mono);">+0 m</strong>
            </div>
            <div style="font-size: 0.76rem; color: var(--muted-text);">
              Total Balance Remaining to Weave: <strong id="dailySummaryRemaining" style="color: var(--vermilion); font-size: 0.88rem; font-family: var(--font-mono);">${activeOrders.reduce((acc, o) => acc + o.remainingQty, 0).toLocaleString()} m</strong>
            </div>
          </div>
        </div>

        <!-- 4. Shift Notes -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 0.74rem; font-weight: 700; text-transform: uppercase; color: var(--muted-text); margin-bottom: 6px;">
            Shift Production Notes / Handover Instructions
          </label>
          <textarea id="dailyShiftNotes" class="form-textarea" rows="2" placeholder="e.g. Shift output target on track; Line 2 airjet operating at 880 RPM. No yarn defect bottlenecks."></textarea>
        </div>

        <!-- 5. Actions Footer -->
        <div style="display: flex; justify-content: flex-end; align-items: center; gap: 12px; border-top: 1px solid var(--soft-border); padding-top: 16px;">
          <button type="button" class="btn btn-secondary" data-close-modal>
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" id="btnSaveDailyUpdate" style="background: var(--vermilion); font-weight: 700; padding: 10px 24px; box-shadow: 0 3px 12px rgba(230,83,56,0.35);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Save &amp; Apply Daily Update
          </button>
        </div>
      </form>
    `;

    Navigation.openModal('dailyUpdateModal');
  },

  recalcWorkerTotal() {
    const weaving = parseInt(document.getElementById('dailyHeadcountWeaving')?.value) || 0;
    const warping = parseInt(document.getElementById('dailyHeadcountWarping')?.value) || 0;
    const qc = parseInt(document.getElementById('dailyHeadcountQC')?.value) || 0;
    const maint = parseInt(document.getElementById('dailyHeadcountMaint')?.value) || 0;
    const totalEl = document.getElementById('dailyTotalHeadcount');
    if (totalEl) {
      totalEl.value = weaving + warping + qc + maint;
    }
  },

  handleDirectTotalChange() {
    // If supervisor manually adjusts total, distribute proportionally
    const total = parseInt(document.getElementById('dailyTotalHeadcount')?.value) || 48;
    const weavingEl = document.getElementById('dailyHeadcountWeaving');
    const warpingEl = document.getElementById('dailyHeadcountWarping');
    const qcEl = document.getElementById('dailyHeadcountQC');
    const maintEl = document.getElementById('dailyHeadcountMaint');

    if (weavingEl && warpingEl && qcEl && maintEl) {
      weavingEl.value = Math.round(total * 0.5);
      warpingEl.value = Math.round(total * 0.17);
      qcEl.value = Math.round(total * 0.13);
      maintEl.value = total - (parseInt(weavingEl.value) + parseInt(warpingEl.value) + parseInt(qcEl.value));
    }
  },

  handleMaterialSelectChange() {
    const select = document.getElementById('dailyMatSelect');
    if (!select) return;
    const option = select.selectedOptions[0];
    if (!option) return;

    const stock = option.getAttribute('data-stock') || '0';
    const unit = option.getAttribute('data-unit') || 'kg';
    const status = option.getAttribute('data-status') || 'In Stock';

    const stockInput = document.getElementById('dailyMatStockQty');
    const unitLabel = document.getElementById('dailyMatUnitLabel');
    const statusSelect = document.getElementById('dailyMatStatus');

    if (stockInput) stockInput.value = stock;
    if (unitLabel) unitLabel.textContent = unit;
    if (statusSelect) statusSelect.value = status;
  },

  recalcDailyOrder(orderId) {
    const orders = store.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const input = document.querySelector(`.daily-produced-input[data-order-id="${orderId}"]`);
    const val = parseFloat(input?.value) || 0;

    const newProduced = order.producedQty + val;
    const newRemaining = Math.max(0, order.totalQty - newProduced);
    const newPct = order.totalQty > 0 ? Math.min(100, Math.round((newProduced / order.totalQty) * 100)) : 0;

    const remEl = document.getElementById(`dailyRem_${orderId}`);
    const barEl = document.getElementById(`dailyProgBar_${orderId}`);
    const pctEl = document.getElementById(`dailyProgPct_${orderId}`);

    if (remEl) {
      if (newRemaining === 0) {
        remEl.style.color = 'var(--success-green)';
        remEl.textContent = 'Completed (0m left)';
      } else {
        remEl.style.color = 'var(--vermilion)';
        remEl.textContent = `${newRemaining.toLocaleString()} m left`;
      }
    }

    if (barEl) {
      barEl.style.width = `${newPct}%`;
      if (newPct === 100) {
        barEl.classList.add('green');
      } else {
        barEl.classList.remove('green');
      }
    }

    if (pctEl) {
      pctEl.textContent = `${newPct}%`;
    }

    this.recalcDailySummaryTotals();
  },

  recalcDailySummaryTotals() {
    const orders = store.getOrders();
    const activeOrders = orders.filter(o => o.status !== 'Completed');

    let totalEntered = 0;
    let totalRemaining = 0;

    activeOrders.forEach(order => {
      const input = document.querySelector(`.daily-produced-input[data-order-id="${order.id}"]`);
      const entered = parseFloat(input?.value) || 0;
      totalEntered += entered;
      const curRemaining = Math.max(0, order.totalQty - (order.producedQty + entered));
      totalRemaining += curRemaining;
    });

    const sumMetersEl = document.getElementById('dailySummaryMeters');
    const sumRemEl = document.getElementById('dailySummaryRemaining');

    if (sumMetersEl) sumMetersEl.textContent = `+${totalEntered.toLocaleString()} m`;
    if (sumRemEl) sumRemEl.textContent = `${totalRemaining.toLocaleString()} m`;
  },

  handleDailyUpdateSubmit(e) {
    if (e) e.preventDefault();

    const orders = store.getOrders();
    const materials = store.getMaterials();
    const prodLogs = store.getProductionLogs();
    const notifs = store.getNotifications();

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    // 1. Save Worker Headcount
    const totalWorkers = parseInt(document.getElementById('dailyTotalHeadcount')?.value) || 48;
    const weavingWorkers = parseInt(document.getElementById('dailyHeadcountWeaving')?.value) || 24;
    const warpingWorkers = parseInt(document.getElementById('dailyHeadcountWarping')?.value) || 8;
    const qcWorkers = parseInt(document.getElementById('dailyHeadcountQC')?.value) || 6;
    const maintWorkers = parseInt(document.getElementById('dailyHeadcountMaint')?.value) || 10;

    localStorage.setItem('loompilot_shift_headcount', JSON.stringify({
      total: totalWorkers,
      weaving: weavingWorkers,
      warping: warpingWorkers,
      qc: qcWorkers,
      maint: maintWorkers,
      updatedAt: timeStr
    }));

    // 2. Update Raw Material
    const matSelect = document.getElementById('dailyMatSelect');
    let updatedMatName = '';
    if (matSelect) {
      const matId = matSelect.value;
      const newStock = parseFloat(document.getElementById('dailyMatStockQty')?.value);
      const newStatus = document.getElementById('dailyMatStatus')?.value;
      const targetMat = materials.find(m => m.id === matId);
      if (targetMat && !isNaN(newStock)) {
        targetMat.inStockQty = newStock;
        if (newStatus) targetMat.status = newStatus;
        updatedMatName = targetMat.name;
        store.saveMaterials(materials);
      }
    }

    // 3. Update Per-Order Quantities
    const shiftNotes = document.getElementById('dailyShiftNotes')?.value.trim() || 'Daily shift operations update via Dashboard.';
    let ordersUpdatedCount = 0;
    let totalProducedToday = 0;

    const producedInputs = document.querySelectorAll('.daily-produced-input');
    producedInputs.forEach(input => {
      const orderId = input.getAttribute('data-order-id');
      const val = parseFloat(input.value) || 0;
      if (val > 0) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          order.producedQty += val;
          order.remainingQty = Math.max(0, order.totalQty - order.producedQty);
          if (order.remainingQty === 0) {
            order.status = 'Completed';
          } else if (order.status === 'Newly Assigned' || order.status === 'Not Started') {
            order.status = 'In Progress';
            order.isNew = false;
          }

          // Add production log entry
          prodLogs.unshift({
            id: `PROD-LOG-${Math.floor(100 + Math.random() * 900)}`,
            orderId: order.id,
            fabricName: order.fabricName,
            date: dateStr,
            process: order.currentStage,
            dailyTarget: order.dailyTarget,
            actualQty: val,
            defectiveQty: 0,
            notes: shiftNotes,
            supervisor: "Rajesh Kumar",
            timestamp: timeStr
          });

          ordersUpdatedCount++;
          totalProducedToday += val;
        }
      }
    });

    if (ordersUpdatedCount > 0) {
      store.saveOrders(orders);
      store.saveProductionLogs(prodLogs);
    }

    // 4. Create Notification Event
    notifs.unshift({
      id: `NOTIF-${Date.now()}`,
      type: "production",
      title: "Daily Shift Operations Update Recorded",
      message: `Supervisor Rajesh Kumar logged shift update: ${totalWorkers} personnel verified, ${totalProducedToday.toLocaleString()} meters produced across orders.`,
      timestamp: "Just now",
      timeFormatted: `Today, ${timeStr}`,
      isRead: false,
      linkPage: "production",
      refId: "shift-update"
    });
    store.saveNotifications(notifs);

    // 5. Close Modal & Refresh Views
    Navigation.closeModal('dailyUpdateModal');
    this.render();
    Navigation.updateBadges();

    showToast(`Daily shift update saved! ${totalWorkers} workers on duty, ${totalProducedToday > 0 ? `+${totalProducedToday.toLocaleString()}m produced, ` : ''}inventory refreshed.`, "success", 4500);
  }
};

window.Dashboard = Dashboard;
