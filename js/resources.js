/**
 * LoomPilot Supervisor Portal - Resource Availability Controller
 * Manages weaving shed machines, facility availability, status switches, and breakdown logging.
 */

const Resources = {
  statusFilter: 'all',
  processFilter: 'all',

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Machine status filter
    const statusSelect = document.getElementById('machineStatusFilter');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.statusFilter = e.target.value;
        this.render();
      });
    }

    // Machine process filter
    const procSelect = document.getElementById('machineProcessFilter');
    if (procSelect) {
      procSelect.addEventListener('change', (e) => {
        this.processFilter = e.target.value;
        this.render();
      });
    }

    // Open Breakdown Modal Button
    const breakdownBtn = document.getElementById('reportBreakdownTriggerBtn');
    if (breakdownBtn) {
      breakdownBtn.addEventListener('click', () => {
        this.populateBreakdownDropdown();
        Navigation.openModal('machineBreakdownModal');
      });
    }

    // Submit Breakdown Form
    const breakdownForm = document.getElementById('machineBreakdownForm');
    if (breakdownForm) {
      breakdownForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitBreakdownReport();
      });
    }
  },

  render() {
    const machines = store.getMachines();
    this.renderMetrics(machines);
    this.renderTable(machines);
  },

  renderMetrics(machines) {
    const total = machines.length;
    const available = machines.filter(m => m.status === 'Available').length;
    const running = machines.filter(m => m.status === 'Running').length;
    const maintenance = machines.filter(m => m.status === 'Under Maintenance').length;
    const breakdown = machines.filter(m => m.status === 'Breakdown').length;

    const elTotal = document.getElementById('resTotalMachines');
    const elAvailable = document.getElementById('resAvailableMachines');
    const elRunning = document.getElementById('resRunningMachines');
    const elMaint = document.getElementById('resUnderMaintenance');
    const elBreakdown = document.getElementById('resBreakdownMachines');

    if (elTotal) elTotal.textContent = total;
    if (elAvailable) elAvailable.textContent = available;
    if (elRunning) elRunning.textContent = running;
    if (elMaint) elMaint.textContent = maintenance;
    if (elBreakdown) elBreakdown.textContent = breakdown;
  },

  renderTable(machines) {
    const tbody = document.getElementById('machinesTableBody');
    if (!tbody) return;

    let filtered = machines.filter(m => {
      if (this.statusFilter !== 'all' && m.status !== this.statusFilter) return false;
      if (this.processFilter !== 'all' && m.process !== this.processFilter) return false;
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:32px; color:var(--muted-text);">
            No machinery matches the selected filter parameters.
          </td>
        </tr>
      `;
      return;
    }

    const allOrders = store.getOrders();

    tbody.innerHTML = filtered.map(mach => {
      const order = (mach.assignedOrder && mach.assignedOrder !== 'None') ? allOrders.find(o => o.id === mach.assignedOrder) : null;

      return `
        <tr class="${mach.status === 'Breakdown' ? 'row-new-highlight' : ''}">
          <td>
            <div style="font-weight:700; color:var(--deep-charcoal);">${mach.name}</div>
            <div style="font-size:0.72rem; color:var(--muted-text);">${mach.line}${order ? ` • Weave: <strong>${order.fabricName}</strong>` : ' • Standby'}</div>
            ${mach.breakdownNote ? `<div style="font-size:0.72rem; color:var(--danger-red); margin-top:2px; font-weight:600;">⚠ ${mach.breakdownNote}</div>` : ''}
          </td>
          <td>
            <span style="font-size:0.82rem; font-weight:600;">${mach.type}</span>
          </td>
          <td>
            <span class="badge badge-neutral">${mach.process}</span>
          </td>
          <td>
            ${this.getStatusBadge(mach.status)}
          </td>
          <td>
            <div style="font-size:0.8rem; font-weight:600; color:var(--deep-charcoal);">${mach.lastUpdated}</div>
            ${mach.status === 'Running' ? `
              <div style="display:inline-flex; align-items:center; gap:5px; font-size:0.72rem; color:var(--success-green); font-family:var(--font-mono); font-weight:700; margin-top:2px;">
                <span class="status-dot pulsing" style="width:5px; height:5px; box-shadow:none;"></span>
                ${mach.rpm} RPM (${mach.efficiency})
              </div>
            ` : mach.status === 'Breakdown' ? `
              <div style="font-size:0.72rem; color:var(--danger-red); font-family:var(--font-mono); font-weight:700; margin-top:2px;">
                HALTED &bull; 0 RPM
              </div>
            ` : `
              <div style="font-size:0.7rem; color:var(--muted-text); font-family:var(--font-mono); margin-top:2px;">
                ${mach.efficiency}
              </div>
            `}
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:5px;">
              <select class="form-select" style="padding:2px 6px; font-size:0.72rem; width:100px; height:26px;" onchange="Resources.changeMachineStatus('${mach.id}', this.value)">
                <option value="Running" ${mach.status === 'Running' ? 'selected' : ''}>Running</option>
                <option value="Available" ${mach.status === 'Available' ? 'selected' : ''}>Available</option>
                <option value="Under Maintenance" ${mach.status === 'Under Maintenance' ? 'selected' : ''}>Maintenance</option>
                <option value="Breakdown" ${mach.status === 'Breakdown' ? 'selected' : ''}>Breakdown</option>
              </select>
              ${mach.status !== 'Breakdown' ? `
                <button class="btn btn-sm btn-outline" style="padding:2px 6px; font-size:0.68rem; height:26px; color:var(--danger-red); border-color:rgba(217,56,41,0.3);" onclick="Resources.quickReportBreakdown('${mach.id}')" title="Flag Breakdown">
                  Halt
                </button>
              ` : `
                <button class="btn btn-sm btn-success" style="padding:2px 6px; font-size:0.68rem; height:26px;" onclick="Resources.changeMachineStatus('${mach.id}', 'Running')" title="Mark Repaired & Running">
                  Resume
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  getStatusBadge(status) {
    if (status === 'Running') {
      return `<span class="badge badge-success"><span class="badge-dot"></span> Running</span>`;
    }
    if (status === 'Available') {
      return `<span class="badge badge-info"><span class="badge-dot"></span> Available</span>`;
    }
    if (status === 'Under Maintenance') {
      return `<span class="badge badge-warning"><span class="badge-dot"></span> Under Maintenance</span>`;
    }
    if (status === 'Breakdown') {
      return `<span class="badge badge-danger"><span class="badge-dot"></span> Breakdown</span>`;
    }
    return `<span class="badge badge-neutral">${status}</span>`;
  },

  changeMachineStatus(machineId, newStatus) {
    const machines = store.getMachines();
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return;

    machine.status = newStatus;
    machine.lastUpdated = "Just now";

    if (newStatus === 'Running') {
      machine.rpm = machine.type.includes('Airjet') ? 850 : 560;
      machine.efficiency = "93.5%";
      delete machine.breakdownNote;
    } else if (newStatus === 'Available') {
      machine.rpm = 0;
      machine.efficiency = "Standby";
      delete machine.breakdownNote;
    } else if (newStatus === 'Under Maintenance') {
      machine.rpm = 0;
      machine.efficiency = "0%";
      machine.breakdownNote = "Preventive maintenance in progress";
    } else if (newStatus === 'Breakdown') {
      machine.rpm = 0;
      machine.efficiency = "0%";
      machine.breakdownNote = "Reported mechanical/electrical halt";
    }

    store.saveMachines(machines);
    this.render();
    Navigation.updateBadges();

    showToast(`Machine status updated to "${newStatus}" for ${machine.name}.`, newStatus === 'Breakdown' ? 'danger' : 'success');
  },

  quickReportBreakdown(machineId) {
    this.populateBreakdownDropdown(machineId);
    Navigation.openModal('machineBreakdownModal');
  },

  populateBreakdownDropdown(preselectedId = null) {
    const select = document.getElementById('breakdownMachineSelect');
    if (!select) return;

    const machines = store.getMachines();
    select.innerHTML = `
      <option value="">-- Choose Machine --</option>
      ${machines.map(m => `
        <option value="${m.id}" ${m.id === preselectedId ? 'selected' : ''}>
          ${m.name} (${m.line} - ${m.status})
        </option>
      `).join('')}
    `;
  },

  submitBreakdownReport() {
    const machineId = document.getElementById('breakdownMachineSelect').value;
    const issueDesc = document.getElementById('breakdownReasonInput').value.trim();
    const severity = document.getElementById('breakdownSeveritySelect').value;
    const estDowntime = document.getElementById('breakdownDowntimeInput').value.trim() || '2-4 hours';

    if (!machineId || !issueDesc) {
      showToast("Please select a machine and enter breakdown details.", "warning");
      return;
    }

    // Update machine status
    const machines = store.getMachines();
    const machine = machines.find(m => m.id === machineId);
    if (machine) {
      machine.status = 'Breakdown';
      machine.rpm = 0;
      machine.efficiency = '0%';
      machine.breakdownNote = issueDesc;
      machine.lastUpdated = 'Just now';
      store.saveMachines(machines);
    }

    // Auto-create Issue in Issues & Reports
    const issues = store.getIssues();
    const newIssueId = `ISS-${Math.floor(400 + Math.random() * 90)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    issues.unshift({
      id: newIssueId,
      category: "Machine Breakdown",
      relatedOrder: machine ? machine.assignedOrder : "General Facility",
      machineId: machineId,
      date: "2026-10-30",
      time: timeStr,
      severity: severity,
      description: issueDesc,
      impact: `Machine halted; estimated downtime ${estDowntime}. Order flow paused.`,
      status: "Technician Assigned",
      adminResponse: "Emergency maintenance ticket auto-dispatched to Shift Engineer Senthil Kumar."
    });
    store.saveIssues(issues);

    // Auto-create Notification
    const notifs = store.getNotifications();
    notifs.unshift({
      id: `NOTIF-${Date.now()}`,
      type: "breakdown",
      title: `Machine Breakdown Flagged: ${machine ? machine.name : 'Machinery'}`,
      message: `${issueDesc} (Severity: ${severity}). Maintenance dispatch created.`,
      timestamp: "Just now",
      timeFormatted: `Today, ${timeStr}`,
      isRead: false,
      linkPage: "resources",
      refId: machineId
    });
    store.saveNotifications(notifs);

    Navigation.closeModal('machineBreakdownModal');
    this.render();
    Navigation.updateBadges();

    // Reset Form
    document.getElementById('machineBreakdownForm').reset();

    showToast(`Breakdown recorded for ${machine ? machine.name : 'Machinery'}. Maintenance dispatched.`, "danger", 4000);
  }
};

window.Resources = Resources;

