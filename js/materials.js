/**
 * LoomPilot Supervisor Portal - Raw Materials Availability Controller
 * Manages yarn lots, warp beams, dyes & sizing chemistry inventory,
 * threshold alerts, search/filtering, and restock requisition flows.
 */

const Materials = {
  currentFilter: 'all',
  searchQuery: '',
  selectedMaterial: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Filter Tabs
    const filterTabs = document.querySelectorAll('#materialsFilterTabs .filter-tab-btn, #materialsFilterTabs .filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.getAttribute('data-filter') || 'all';
        this.renderTable();
      });
    });

    // Search Input
    const searchInput = document.getElementById('materialsSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderTable();
      });
    }

    // New Restock Request Trigger
    const openRestockBtn = document.getElementById('openRestockModalBtn');
    if (openRestockBtn) {
      openRestockBtn.addEventListener('click', () => {
        this.openRestockModal();
      });
    }

    // Submit Restock Form Handler
    const restockForm = document.getElementById('materialRestockForm');
    if (restockForm) {
      restockForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRestockSubmit();
      });
    }
  },

  render() {
    this.renderMetrics();
    this.renderTable();
  },

  renderMetrics() {
    const materials = store.getMaterials();
    
    // Total lots
    const totalLots = materials.length;
    
    // Cotton yarns total kg
    const cottonMaterials = materials.filter(m => m.category === 'Cotton Yarns');
    const cottonKg = cottonMaterials.reduce((acc, m) => acc + (typeof m.inStockQty === 'number' ? m.inStockQty : 0), 0);

    // Specialty & Synthetics kg
    const specMaterials = materials.filter(m => m.category.includes('Specialty') || m.category.includes('Synthetics'));
    const specKg = specMaterials.reduce((acc, m) => acc + (typeof m.inStockQty === 'number' ? m.inStockQty : 0), 0);

    // Warp Beams ready count
    const beams = materials.filter(m => m.category === 'Warp Beams');
    const beamCount = beams.reduce((acc, m) => acc + (typeof m.inStockQty === 'number' ? m.inStockQty : 0), 0);

    // Sizing & Dyes kg
    const chemicals = materials.filter(m => m.category === 'Chemicals & Dyes');
    const chemKg = chemicals.reduce((acc, m) => acc + (typeof m.inStockQty === 'number' ? m.inStockQty : 0), 0);

    // Alerts count
    const alertCount = materials.filter(m => m.status === 'Low Stock Alert' || m.inStockQty <= m.thresholdQty).length;

    // Update DOM
    const elTotalLots = document.getElementById('matMetricTotalLots');
    const elCottonKg = document.getElementById('matMetricCotton');
    const elSpecialtyKg = document.getElementById('matMetricSpecialty');
    const elBeams = document.getElementById('matMetricBeams');
    const elAlerts = document.getElementById('matMetricAlerts');

    if (elTotalLots) elTotalLots.textContent = `${totalLots} Lots`;
    if (elCottonKg) elCottonKg.textContent = `${cottonKg.toLocaleString()} kg`;
    if (elSpecialtyKg) elSpecialtyKg.textContent = `${specKg.toLocaleString()} kg`;
    if (elBeams) elBeams.textContent = `${beamCount} Beams Ready`;
    if (elAlerts) {
      elAlerts.textContent = `${alertCount} Shortage`;
      if (alertCount > 0) {
        elAlerts.style.color = 'var(--danger-red)';
      }
    }
  },

  renderTable() {
    const tbody = document.getElementById('materialsTableBody');
    if (!tbody) return;

    let materials = store.getMaterials();

    // Apply Filter Tab
    if (this.currentFilter === 'cotton') {
      materials = materials.filter(m => m.category === 'Cotton Yarns');
    } else if (this.currentFilter === 'specialty') {
      materials = materials.filter(m => m.category.includes('Specialty') || m.category.includes('Synthetics'));
    } else if (this.currentFilter === 'beams') {
      materials = materials.filter(m => m.category === 'Warp Beams');
    } else if (this.currentFilter === 'chemicals') {
      materials = materials.filter(m => m.category === 'Chemicals & Dyes');
    } else if (this.currentFilter === 'alerts') {
      materials = materials.filter(m => m.status === 'Low Stock Alert' || m.inStockQty <= m.thresholdQty);
    }

    // Apply Search Query
    if (this.searchQuery) {
      const q = this.searchQuery;
      materials = materials.filter(m => 
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.composition.toLowerCase().includes(q) ||
        m.storageLocation.toLowerCase().includes(q) ||
        m.allocatedOrder.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    }

    if (materials.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 40px; color: var(--muted-text);">
            <div style="font-size: 1.2rem; font-weight: 700; margin-bottom: 6px; color: var(--deep-charcoal);">No Raw Materials Found</div>
            <div>No inventory items match the selected filter or search criteria.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = materials.map(mat => {
      const isLowStock = mat.status === 'Low Stock Alert' || mat.inStockQty <= mat.thresholdQty;
      
      let statusBadge = '';
      if (isLowStock) {
        statusBadge = `<span class="badge badge-danger"><span class="badge-dot"></span> Low Stock Alert</span>`;
      } else if (mat.status === 'Ready for Loom') {
        statusBadge = `<span class="badge badge-success"><span class="badge-dot"></span> Ready for Loom</span>`;
      } else {
        statusBadge = `<span class="badge badge-success"><span class="badge-dot"></span> In Stock (Adequate)</span>`;
      }

      let categoryBadgeClass = 'badge-neutral';
      if (mat.category === 'Cotton Yarns') categoryBadgeClass = 'badge-info';
      else if (mat.category.includes('Specialty')) categoryBadgeClass = 'badge-amber';
      else if (mat.category === 'Warp Beams') categoryBadgeClass = 'badge-vermilion';
      else if (mat.category === 'Chemicals & Dyes') categoryBadgeClass = 'badge-neutral';

      return `
        <tr class="${isLowStock ? 'row-alert-highlight' : ''}" onclick="Materials.openDetailModal('${mat.id}')">
          <td>
            <div style="font-weight: 700; color: var(--deep-charcoal); font-size: 0.84rem; margin-bottom: 2px;">
              ${mat.name}
            </div>
            <div style="font-size: 0.72rem; color: var(--muted-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px;" title="${mat.composition}">
              ${mat.composition}
            </div>
          </td>
          <td>
            <span class="badge ${categoryBadgeClass}" style="font-size: 0.7rem;">
              ${mat.category}
            </span>
          </td>
          <td>
            <div style="font-weight: 800; font-size: 0.86rem; color: ${isLowStock ? 'var(--danger-red)' : 'var(--deep-charcoal)'};">
              ${typeof mat.inStockQty === 'number' ? mat.inStockQty.toLocaleString() : mat.inStockQty}
            </div>
            <div style="font-size: 0.7rem; color: var(--muted-text);">${mat.unit}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--deep-charcoal); font-size: 0.82rem;">
              ${mat.orderName || 'Buffer Stock'}
            </div>
            <div style="font-size: 0.7rem; color: var(--muted-text);">
              ${mat.allocatedOrder === 'Buffer Stock' || !mat.allocatedOrder ? 'General Floor Buffer' : 'Active Batch Allocation'}
            </div>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--deep-charcoal); font-size: 0.78rem;">
              ${mat.storageLocation}
            </div>
            <div style="font-size: 0.7rem; color: var(--muted-text);">Received: ${mat.lastReceived}</div>
          </td>
          <td>
            ${statusBadge}
          </td>
          <td style="text-align: right;" onclick="event.stopPropagation();">
            <div style="display: flex; gap: 6px; justify-content: flex-end;">
              <button class="btn btn-secondary btn-sm" style="padding: 4px 8px; font-size: 0.72rem;" onclick="Materials.openDetailModal('${mat.id}')">
                Specs
              </button>
              <button class="btn ${isLowStock ? 'btn-primary' : 'btn-secondary'} btn-sm" style="padding: 4px 8px; font-size: 0.72rem;" onclick="Materials.openRestockModal('${mat.id}')">
                Restock
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openDetailModal(lotId) {
    const materials = store.getMaterials();
    const mat = materials.find(m => m.id === lotId);
    if (!mat) return;

    this.selectedMaterial = mat;

    const modalBody = document.getElementById('materialDetailModalBody');
    if (!modalBody) return;

    const isLowStock = mat.status === 'Low Stock Alert' || mat.inStockQty <= mat.thresholdQty;

    modalBody.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; border-bottom: 1px solid var(--soft-border); padding-bottom: 14px;">
        <div>
          <span class="badge badge-neutral" style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; margin-bottom: 6px; display: inline-block;">
            ${mat.category}
          </span>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--deep-charcoal); margin: 4px 0 4px 0;">
            ${mat.name}
          </h3>
          <p style="font-size: 0.8rem; color: var(--muted-text); margin: 0;">
            ${mat.composition}
          </p>
        </div>
        <div>
          ${isLowStock 
            ? `<span class="badge badge-danger" style="font-size:0.75rem;"><span class="badge-dot"></span> Low Stock Alert</span>` 
            : `<span class="badge badge-success" style="font-size:0.75rem;"><span class="badge-dot"></span> In Stock</span>`
          }
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 16px;">
        <div style="background: var(--surface-alt); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--soft-border);">
          <div style="font-size: 0.72rem; color: var(--muted-text); font-weight: 700; text-transform: uppercase;">Stock Availability</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: ${isLowStock ? 'var(--danger-red)' : 'var(--deep-charcoal)'}; margin-top: 4px;">
            ${typeof mat.inStockQty === 'number' ? mat.inStockQty.toLocaleString() : mat.inStockQty}
          </div>
          <div style="font-size: 0.74rem; color: var(--muted-text); margin-top: 2px;">
            Package / Units: <strong>${mat.unit}</strong> (Threshold: ${mat.thresholdQty.toLocaleString()})
          </div>
        </div>

        <div style="background: var(--surface-alt); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--soft-border);">
          <div style="font-size: 0.72rem; color: var(--muted-text); font-weight: 700; text-transform: uppercase;">Storage & Location</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: var(--deep-charcoal); margin-top: 4px;">
            ${mat.storageLocation}
          </div>
          <div style="font-size: 0.74rem; color: var(--muted-text); margin-top: 2px;">
            Last Batch Received: <strong>${mat.lastReceived}</strong>
          </div>
        </div>
      </div>

      <!-- Technical Specifications Sheet -->
      <div style="background: #FFFFFF; border: 1px solid var(--soft-border); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 16px;">
        <h4 style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: var(--deep-charcoal); margin: 0 0 10px 0;">
          Textile Technical Data
        </h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 0.78rem;">
          <div><span style="color:var(--muted-text);">Yarn Count / Fineness:</span> <strong>${mat.yarnCount || 'Standard'}</strong></div>
          <div><span style="color:var(--muted-text);">CSP / Tensile Strength:</span> <strong>${mat.csp || 'Grade A'}</strong></div>
          <div><span style="color:var(--muted-text);">Twist Specification:</span> <strong>${mat.twistPerInch || 'Balanced'}</strong></div>
          <div><span style="color:var(--muted-text);">Moisture Regain:</span> <strong>${mat.moistureRegain || '7.5%'}</strong></div>
          <div><span style="color:var(--muted-text);">Allocated Fabric:</span> <strong>${mat.orderName || 'General Mill Stock'}</strong></div>
          <div><span style="color:var(--muted-text);">Supplier Origin:</span> <strong>${mat.supplier || 'Approved Mill'}</strong></div>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary" data-close-modal>Close</button>
        <button class="btn btn-primary" onclick="Materials.openRestockModal('${mat.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          Request Restock Requisition
        </button>
      </div>
    `;

    Navigation.openModal('materialDetailModal');
  },

  openRestockModal(lotId) {
    Navigation.closeModal('materialDetailModal');
    
    const materials = store.getMaterials();
    const selectEl = document.getElementById('restockMaterialSelect');
    if (selectEl) {
      selectEl.innerHTML = materials.map(m => `
        <option value="${m.id}" ${m.id === lotId ? 'selected' : ''}>
          ${m.name} (${m.composition}) — ${m.inStockQty} ${m.unit} in stock
        </option>
      `).join('');
    }

    const mat = materials.find(m => m.id === lotId) || materials[0];
    const qtyInput = document.getElementById('restockQtyInput');
    if (qtyInput && mat) {
      qtyInput.value = mat.category === 'Warp Beams' ? '2' : '2000';
    }

    Navigation.openModal('materialRestockModal');
  },

  handleRestockSubmit() {
    const selectEl = document.getElementById('restockMaterialSelect');
    const qtyInput = document.getElementById('restockQtyInput');
    const urgencySelect = document.getElementById('restockUrgencySelect');
    const notesInput = document.getElementById('restockNotesInput');

    const lotId = selectEl.value;
    const reqQty = qtyInput.value;
    const urgency = urgencySelect.value;
    const notes = notesInput ? notesInput.value : '';

    const materials = store.getMaterials();
    const mat = materials.find(m => m.id === lotId);
    const materialName = mat ? mat.name : 'Raw Material';

    // Create Notification
    const notifs = store.getNotifications();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    notifs.unshift({
      id: `NOTIF-${Date.now()}`,
      type: "materials",
      title: `Raw Material Requisition Dispatched: ${materialName}`,
      message: `Supervisor Rajesh Kumar requested restock of ${reqQty} units for ${materialName} (${urgency} priority) to Yarn Warehouse Dispatch.`,
      timestamp: "Just now",
      timeFormatted: `Today, ${timeStr}`,
      isRead: false,
      linkPage: "materials",
      refId: lotId
    });
    store.saveNotifications(notifs);

    Navigation.closeModal('materialRestockModal');
    Navigation.updateBadges();

    showToast(`Restock requisition for ${materialName} (${reqQty} units) dispatched to Yarn Warehouse.`, "success", 4000);
    this.render();
  }
};

if (typeof window !== 'undefined') window.Materials = Materials;
if (typeof global !== 'undefined') global.Materials = Materials;
