/**
 * LoomPilot Supervisor Portal - Profile Controller
 * Displays supervisor credentials, assigned plant sections, shift configuration, and logout.
 */

const Profile = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Edit profile modal trigger
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.populateEditForm();
        Navigation.openModal('editProfileModal');
      });
    }

    // Save profile form
    const editForm = document.getElementById('editProfileForm');
    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProfileChanges();
      });
    }

    // Switch shift modal trigger
    const switchShiftBtn = document.getElementById('switchShiftBtn');
    if (switchShiftBtn) {
      switchShiftBtn.addEventListener('click', () => {
        Navigation.openModal('switchShiftModal');
      });
    }

    // Confirm switch shift
    const confirmShiftBtn = document.getElementById('confirmSwitchShiftBtn');
    if (confirmShiftBtn) {
      confirmShiftBtn.addEventListener('click', () => {
        const newShift = document.getElementById('selectNewShift').value;
        const profile = store.getProfile();
        profile.shift = newShift;
        store.saveProfile(profile);

        Navigation.closeModal('switchShiftModal');
        this.render();
        showToast(`Shift updated to ${newShift}. Roster synchronized.`, "success");
      });
    }

    // Confirm Logout Modal Button
    const confirmLogout = document.getElementById('confirmLogoutBtn');
    if (confirmLogout) {
      confirmLogout.addEventListener('click', () => {
        Navigation.closeModal('logoutModal');
        showToast("Logged out of LoomPilot Supervisor Portal (Simulated).", "info", 3000);
        setTimeout(() => {
          Navigation.navigateTo('dashboard');
        }, 800);
      });
    }
  },

  render() {
    const profile = store.getProfile();
    if (!profile) return;

    // Header chip updates
    const chipName = document.querySelector('.profile-chip-name');
    const chipRole = document.querySelector('.profile-chip-role');
    const dropName = document.querySelector('.dropdown-user-name');
    const dropEmail = document.querySelector('.dropdown-user-email');

    if (chipName) chipName.textContent = profile.name;
    if (chipRole) chipRole.textContent = profile.title;
    if (dropName) dropName.textContent = profile.name;
    if (dropEmail) dropEmail.textContent = profile.email;

    // Profile page elements
    const elName = document.getElementById('profName');
    const elId = document.getElementById('profEmpId');
    const elTitle = document.getElementById('profTitle');
    const elEmail = document.getElementById('profEmail');
    const elPhone = document.getElementById('profPhone');
    const elDept = document.getElementById('profDept');
    const elArea = document.getElementById('profArea');
    const elShift = document.getElementById('profShift');
    const elFacility = document.getElementById('profFacility');
    const elReporting = document.getElementById('profReporting');

    if (elName) elName.textContent = profile.name;
    if (elId) elId.textContent = profile.empId;
    if (elTitle) elTitle.textContent = profile.title;
    if (elEmail) elEmail.textContent = profile.email;
    if (elPhone) elPhone.textContent = profile.phone;
    if (elDept) elDept.textContent = profile.department;
    if (elArea) elArea.textContent = profile.area;
    if (elShift) elShift.textContent = profile.shift;
    if (elFacility) elFacility.textContent = profile.facility;
    if (elReporting) elReporting.textContent = profile.reportingTo;

    // Sidebar footer shift info
    const sideShiftTitle = document.querySelector('.shift-title');
    const sideShiftSub = document.querySelector('.shift-sub');
    if (sideShiftTitle) sideShiftTitle.textContent = profile.shift.split('(')[0].trim();
    if (sideShiftSub) sideShiftSub.textContent = profile.area.split('(')[0].trim();
  },

  populateEditForm() {
    const profile = store.getProfile();
    document.getElementById('editProfName').value = profile.name;
    document.getElementById('editProfTitle').value = profile.title;
    document.getElementById('editProfEmail').value = profile.email;
    document.getElementById('editProfPhone').value = profile.phone;
    document.getElementById('editProfArea').value = profile.area;
  },

  saveProfileChanges() {
    const profile = store.getProfile();
    profile.name = document.getElementById('editProfName').value.trim();
    profile.title = document.getElementById('editProfTitle').value.trim();
    profile.email = document.getElementById('editProfEmail').value.trim();
    profile.phone = document.getElementById('editProfPhone').value.trim();
    profile.area = document.getElementById('editProfArea').value.trim();

    store.saveProfile(profile);
    Navigation.closeModal('editProfileModal');
    this.render();
    showToast("Supervisor profile details updated.", "success");
  }
};

window.Profile = Profile;

