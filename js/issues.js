/**
 * LoomPilot Supervisor Portal - Issues & Reports Controller
 * Manages operational incident reporting, severity classification, admin feedback loop, and tracking.
 */

const Issues = {
  activeTab: 'all',

  init() {
    this.bindEvents();
    this.populateOrderSelect();
    this.populateMachineSelect();
  },

  bindEvents() {
    // Form submission
    const form = document.getElementById('issueReportForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitIssue();
      });
    }

    // Filter tabs
    document.querySelectorAll('[data-issue-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-issue-tab]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.getAttribute('data-issue-tab');
        this.render();
      });
    });
  },

  populateOrderSelect() {
    const select = document.getElementById('issueFormOrderSelect');
    if (!select) return;

    const orders = store.getOrders();
    select.innerHTML = `
      <option value="General Facility / All Lines">-- General Facility / All Lines --</option>
      ${orders.map(o => `
        <option value="${o.id}">${o.fabricName} (${o.clientName})</option>
      `).join('')}
    `;
  },

  populateMachineSelect() {
    const select = document.getElementById('issueFormMachineSelect');
    if (!select) return;

    const machines = store.getMachines();
    select.innerHTML = `
      <option value="None / Not Applicable">-- None / Not Applicable --</option>
      ${machines.map(m => `
        <option value="${m.id}">${m.name} (${m.line} - ${m.status})</option>
      `).join('')}
    `;
  },

  render() {
    this.populateOrderSelect();
    this.populateMachineSelect();
    const issues = store.getIssues();
    this.renderMetrics(issues);
    this.renderTable(issues);
  },

  renderMetrics(issues) {
    const total = issues.length;
    const open = issues.filter(i => i.status === 'Reported' || i.status === 'Under Investigation').length;
    const assigned = issues.filter(i => i.status === 'Technician Assigned').length;
    const resolved = issues.filter(i => i.status === 'Resolved').length;

    const elTotal = document.getElementById('issMetricTotal');
    const elOpen = document.getElementById('issMetricOpen');
    const elAssigned = document.getElementById('issMetricAssigned');
    const elResolved = document.getElementById('issMetricResolved');

    if (elTotal) elTotal.textContent = total;
    if (elOpen) elOpen.textContent = open;
    if (elAssigned) elAssigned.textContent = assigned;
    if (elResolved) elResolved.textContent = resolved;
  },

  renderTable(issues) {
    const tbody = document.getElementById('issuesTableBody');
    if (!tbody) return;

    let filtered = issues.filter(issue => {
      if (this.activeTab === 'open' && !(issue.status === 'Reported' || issue.status === 'Under Investigation')) return false;
      if (this.activeTab === 'in-progress' && issue.status !== 'Technician Assigned') return false;
      if (this.activeTab === 'resolved' && issue.status !== 'Resolved') return false;
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:32px; color:var(--muted-text);">
            No issues match the selected view filter.
          </td>
        </tr>
      `;
      return;
    }

    const allOrders = store.getOrders();
    const allMachines = store.getMachines();

    tbody.innerHTML = filtered.map(issue => {
      const sevBadge = this.getSeverityBadge(issue.severity);
      const statBadge = this.getStatusBadge(issue.status);

      const ord = issue.relatedOrder && issue.relatedOrder !== 'General Facility / All Lines' ? allOrders.find(o => o.id === issue.relatedOrder) : null;
      const fabricDisplay = ord ? ord.fabricName : (issue.relatedOrder && !issue.relatedOrder.includes('ORD-') ? issue.relatedOrder : 'Manufacturing Floor');

      const mach = issue.machineId && issue.machineId !== 'None / Not Applicable' ? allMachines.find(m => m.id === issue.machineId) : null;
      const machineDisplay = mach ? mach.name : 'Plant Machinery';

      return `
        <tr style="cursor:pointer;" onclick="Issues.openDetail('${issue.id}')">
          <td>
            <span style="font-weight:700; color:var(--deep-charcoal); font-size:0.84rem;">${issue.category}</span>
            <div style="font-size:0.72rem; color:var(--muted-text);">${machineDisplay}</div>
          </td>
          <td>
            <span style="font-size:0.82rem; font-weight:600; color:var(--deep-charcoal);">${fabricDisplay}</span>
          </td>
          <td>
            <div style="font-size:0.8rem;">${issue.date}</div>
            <div style="font-size:0.7rem; color:var(--muted-text);">${issue.time}</div>
          </td>
          <td>${sevBadge}</td>
          <td>${statBadge}</td>
          <td>
            <div style="font-size:0.78rem; color:var(--deep-charcoal); max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${issue.adminResponse ? `<span style="color:var(--success-green); font-weight:700;">Admin:</span> ${issue.adminResponse}` : '<span style="color:var(--muted-text);">Awaiting Review...</span>'}
            </div>
          </td>
          <td style="text-align:center;">
            <button class="btn btn-sm btn-secondary" style="padding:2px 8px; font-size:0.7rem;" onclick="event.stopPropagation(); Issues.openDetail('${issue.id}')">
              View
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  getSeverityBadge(sev) {
    if (sev === 'Critical') {
      return `<span class="badge badge-danger"><span class="badge-dot"></span> Critical</span>`;
    }
    if (sev === 'High') {
      return `<span class="badge badge-vermilion"><span class="badge-dot"></span> High</span>`;
    }
    if (sev === 'Medium') {
      return `<span class="badge badge-warning"><span class="badge-dot"></span> Medium</span>`;
    }
    return `<span class="badge badge-neutral"><span class="badge-dot"></span> Low</span>`;
  },

  getStatusBadge(status) {
    if (status === 'Resolved') {
      return `<span class="badge badge-success"><span class="badge-dot"></span> Resolved</span>`;
    }
    if (status === 'Technician Assigned') {
      return `<span class="badge badge-info"><span class="badge-dot"></span> Tech Assigned</span>`;
    }
    if (status === 'Under Investigation') {
      return `<span class="badge badge-warning"><span class="badge-dot"></span> Investigating</span>`;
    }
    return `<span class="badge badge-neutral"><span class="badge-dot"></span> Reported</span>`;
  },

  submitIssue() {
    const category = document.getElementById('issueFormCategory').value;
    const relatedOrder = document.getElementById('issueFormOrderSelect').value;
    const machineId = document.getElementById('issueFormMachineSelect').value;
    const date = document.getElementById('issueFormDate').value || '2026-10-30';
    const time = document.getElementById('issueFormTime').value || '11:45 AM';
    const severity = document.getElementById('issueFormSeverity').value;
    const description = document.getElementById('issueFormDescription').value.trim();
    const impact = document.getElementById('issueFormImpact').value.trim() || 'Estimated shift output delay under assessment.';

    if (!category || !description) {
      showToast("Please select an issue category and enter a description.", "warning");
      return;
    }

    const issues = store.getIssues();
    const newId = `ISS-${Math.floor(405 + Math.random() * 90)}`;

    // Generate realistic simulated admin response
    let simulatedAdminResponse = "";
    if (category === "Machine Breakdown") {
      simulatedAdminResponse = "Plant Maintenance notified. Mechanical engineer assigned to inspect within 15 minutes.";
    } else if (category === "Material Shortage") {
      simulatedAdminResponse = "Warehouse logistics initiated transfer of reserve yarn buffer stock.";
    } else if (category === "Employee Shortage") {
      simulatedAdminResponse = "Shift supervisor authorized to cross-assign secondary helpers from Finishing Shed.";
    } else {
      simulatedAdminResponse = "Operations Director reviewed. Ticket escalated to Factory Quality Lead.";
    }

    const newIssue = {
      id: newId,
      category: category,
      relatedOrder: relatedOrder,
      machineId: machineId,
      date: date,
      time: time,
      severity: severity,
      description: description,
      impact: impact,
      status: "Under Investigation",
      adminResponse: simulatedAdminResponse
    };

    issues.unshift(newIssue);
    store.saveIssues(issues);

    // If machine breakdown, set machine status to Breakdown
    if (category === 'Machine Breakdown' && machineId && machineId !== 'None / Not Applicable') {
      const machines = store.getMachines();
      const mach = machines.find(m => m.id === machineId);
      if (mach) {
        mach.status = 'Breakdown';
        mach.breakdownNote = description;
        mach.lastUpdated = 'Just now';
        store.saveMachines(machines);
      }
    }

    // Add notification
    const notifs = store.getNotifications();
    notifs.unshift({
      id: `NOTIF-${Date.now()}`,
      type: "admin",
      title: `Issue Logged: ${category}`,
      message: `${description.substring(0, 70)}... Status: Under Investigation.`,
      timestamp: "Just now",
      timeFormatted: `Today, ${time}`,
      isRead: false,
      linkPage: "issues",
      refId: newId
    });
    store.saveNotifications(notifs);

    // Reset Form
    document.getElementById('issueReportForm').reset();
    document.getElementById('issueFormDate').value = '2026-10-30';
    document.getElementById('issueFormTime').value = '11:45 AM';

    this.render();
    Navigation.updateBadges();

    showToast(`Issue (${category}) submitted successfully to Plant Administration.`, "success", 4000);
  },

  openDetail(issueId) {
    const issues = store.getIssues();
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    const modal = document.getElementById('issueDetailModal');
    const content = document.getElementById('issueDetailContent');
    if (!modal || !content) return;

    const allOrders = store.getOrders();
    const allMachines = store.getMachines();
    const ord = issue.relatedOrder && issue.relatedOrder !== 'General Facility / All Lines' ? allOrders.find(o => o.id === issue.relatedOrder) : null;
    const fabricDisplay = ord ? ord.fabricName : (issue.relatedOrder && !issue.relatedOrder.includes('ORD-') ? issue.relatedOrder : 'Manufacturing Floor');
    const mach = issue.machineId && issue.machineId !== 'None / Not Applicable' ? allMachines.find(m => m.id === issue.machineId) : null;
    const machineDisplay = mach ? mach.name : 'Plant Machinery';

    content.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; border-bottom:1px solid var(--soft-border); padding-bottom:14px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            ${this.getSeverityBadge(issue.severity)}
            ${this.getStatusBadge(issue.status)}
          </div>
          <h3 style="font-size:1.2rem; font-weight:800; color:var(--deep-charcoal);">${issue.category}</h3>
        </div>
        <div style="text-align:right; font-size:0.75rem; color:var(--muted-text);">
          Reported on <strong>${issue.date} at ${issue.time}</strong>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-bottom:18px; font-size:0.83rem; background:var(--bg-warm-ivory); padding:14px; border-radius:var(--radius-md); border:1px solid var(--soft-border);">
        <div>
          <span style="color:var(--muted-text); font-size:0.72rem; display:block;">Related Fabric / Target</span>
          <strong>${fabricDisplay}</strong>
        </div>
        <div>
          <span style="color:var(--muted-text); font-size:0.72rem; display:block;">Equipment Affected</span>
          <strong>${machineDisplay}</strong>
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <label style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--muted-text); display:block; margin-bottom:4px;">
          Issue Description & Root Cause
        </label>
        <div style="background:var(--white); border:1px solid var(--soft-border); border-radius:var(--radius-sm); padding:12px; font-size:0.85rem; line-height:1.4;">
          ${issue.description}
        </div>
      </div>

      <div style="margin-bottom:18px;">
        <label style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--muted-text); display:block; margin-bottom:4px;">
          Expected Production Impact
        </label>
        <div style="background:var(--danger-light); border:1px solid rgba(217,56,41,0.2); border-radius:var(--radius-sm); padding:10px 12px; font-size:0.83rem; color:var(--danger-red); font-weight:600;">
          ⚠ ${issue.impact}
        </div>
      </div>

      <div style="background:var(--surface-alt); border-left:4px solid var(--success-green); border-radius:var(--radius-sm); padding:14px 16px; margin-bottom:18px;">
        <div style="font-size:0.74rem; font-weight:800; color:var(--success-green); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">
          Plant Operations / Admin Response
        </div>
        <div style="font-size:0.85rem; color:var(--deep-charcoal); font-weight:500; line-height:1.4;">
          ${issue.adminResponse || 'No response logged yet. Operations team has been notified.'}
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--soft-border); padding-top:14px;">
        ${issue.status !== 'Resolved' ? `
          <button class="btn btn-sm btn-success" onclick="Issues.markResolved('${issue.id}')">
            ✓ Mark as Resolved by Supervisor
          </button>
        ` : `
          <span style="font-size:0.75rem; color:var(--success-green); font-weight:700;">Issue successfully closed.</span>
        `}
        <button class="btn btn-secondary" onclick="Navigation.closeModal('issueDetailModal')">Close</button>
      </div>
    `;

    modal.classList.add('active');
  },

  markResolved(issueId) {
    const issues = store.getIssues();
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    issue.status = "Resolved";
    store.saveIssues(issues);

    Navigation.closeModal('issueDetailModal');
    this.render();
    Navigation.updateBadges();

    showToast(`Issue (${issue.category}) marked as Resolved.`, "success");
  }
};

window.Issues = Issues;

