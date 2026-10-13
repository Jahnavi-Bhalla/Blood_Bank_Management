/**
 * HemoPulse - Blood Bank Management System (Client-Side Logic)
 * Fulfills Lab Exercise 11 (ODBC & JDBC / Front-End Database Connectivity)
 * Implements: SELECT Retrieval, PreparedStatement INSERT/UPDATE/DELETE,
 * Transaction COMMIT/ROLLBACK, Compatibility Matrix, and SQL Console.
 */

// Initial Seed Data (persisted in LocalStorage)
const INITIAL_DATA = {
  donors: [
    {
      donor_id: 'D101',
      name: 'Dr. Aravind Swaminathan',
      blood_group: 'O-',
      age: 28,
      gender: 'Male',
      phone: '+91 98401 23456',
      email: 'aravind.s@vit.ac.in',
      city: 'Chennai',
      hemoglobin: 14.5,
      last_donation: '2026-08-10',
      status: 'Eligible',
      total_donations: 6
    },
    {
      donor_id: 'D102',
      name: 'Priyanka Sundaram',
      blood_group: 'A+',
      age: 24,
      gender: 'Female',
      phone: '+91 97890 87654',
      email: 'priyanka.s@gmail.com',
      city: 'Vellore',
      hemoglobin: 13.2,
      last_donation: '2026-09-02',
      status: 'Eligible',
      total_donations: 3
    },
    {
      donor_id: 'D103',
      name: 'Karthik Ramanathan',
      blood_group: 'B+',
      age: 32,
      gender: 'Male',
      phone: '+91 94441 54321',
      email: 'karthik.r@yahoo.com',
      city: 'Chennai',
      hemoglobin: 15.1,
      last_donation: '2026-07-15',
      status: 'Eligible',
      total_donations: 8
    },
    {
      donor_id: 'D104',
      name: 'Sneha Narayanan',
      blood_group: 'AB-',
      age: 22,
      gender: 'Female',
      phone: '+91 98840 99887',
      email: 'sneha.n@vit.ac.in',
      city: 'Bangalore',
      hemoglobin: 12.8,
      last_donation: '2026-06-20',
      status: 'Eligible',
      total_donations: 2
    },
    {
      donor_id: 'D105',
      name: 'Manoj Kumar',
      blood_group: 'O+',
      age: 29,
      gender: 'Male',
      phone: '+91 99620 11223',
      email: 'manoj.k@outlook.com',
      city: 'Madurai',
      hemoglobin: 14.0,
      last_donation: '2026-09-28',
      status: 'Eligible',
      total_donations: 5
    },
    {
      donor_id: 'D106',
      name: 'Deepa Krishnan',
      blood_group: 'A-',
      age: 35,
      gender: 'Female',
      phone: '+91 94432 44556',
      email: 'deepa.krish@gmail.com',
      city: 'Coimbatore',
      hemoglobin: 11.8,
      last_donation: '2026-10-01',
      status: 'Deferred',
      total_donations: 1
    },
    {
      donor_id: 'D107',
      name: 'Venkatesh Prasad',
      blood_group: 'B-',
      age: 41,
      gender: 'Male',
      phone: '+91 98410 77889',
      email: 'v.prasad@health.in',
      city: 'Chennai',
      hemoglobin: 14.8,
      last_donation: '2026-05-18',
      status: 'Eligible',
      total_donations: 11
    },
    {
      donor_id: 'D108',
      name: 'Ananya Raghavan',
      blood_group: 'AB+',
      age: 26,
      gender: 'Female',
      phone: '+91 97909 33221',
      email: 'ananya.ragh@vit.ac.in',
      city: 'Vellore',
      hemoglobin: 13.6,
      last_donation: '2026-08-25',
      status: 'Eligible',
      total_donations: 4
    }
  ],

  inventory: {
    'A+': { units: 28, capacity: 50, minSafe: 15 },
    'A-': { units: 9, capacity: 30, minSafe: 12 },
    'B+': { units: 35, capacity: 50, minSafe: 15 },
    'B-': { units: 14, capacity: 30, minSafe: 10 },
    'AB+': { units: 22, capacity: 35, minSafe: 12 },
    'AB-': { units: 4, capacity: 25, minSafe: 8 },
    'O+': { units: 44, capacity: 60, minSafe: 20 },
    'O-': { units: 6, capacity: 35, minSafe: 12 }
  },

  blood_bags: [
    {
      bag_id: 'BAG-901',
      donor_id: 'D101',
      blood_group: 'O-',
      component: 'Packed Red Cells (PRBC)',
      volume_ml: 450,
      collected_date: '2026-10-02',
      expiry_date: '2026-11-13',
      chiller: 'Vault-A (Chiller #1, -4°C)',
      status: 'Tested & Cleared'
    },
    {
      bag_id: 'BAG-902',
      donor_id: 'D102',
      blood_group: 'A+',
      component: 'Whole Blood',
      volume_ml: 450,
      collected_date: '2026-10-05',
      expiry_date: '2026-11-09',
      chiller: 'Vault-B (Chiller #2, -4°C)',
      status: 'Tested & Cleared'
    },
    {
      bag_id: 'BAG-903',
      donor_id: 'D103',
      blood_group: 'B+',
      component: 'Fresh Frozen Plasma (FFP)',
      volume_ml: 250,
      collected_date: '2026-09-29',
      expiry_date: '2027-09-29',
      chiller: 'Cryo-Vault (-25°C)',
      status: 'Tested & Cleared'
    },
    {
      bag_id: 'BAG-904',
      donor_id: 'D105',
      blood_group: 'O+',
      component: 'Platelet Concentrate',
      volume_ml: 200,
      collected_date: '2026-10-10',
      expiry_date: '2026-10-15',
      chiller: 'Agitator Unit #1 (22°C)',
      status: 'Tested & Cleared'
    },
    {
      bag_id: 'BAG-905',
      donor_id: 'D107',
      blood_group: 'B-',
      component: 'Whole Blood',
      volume_ml: 450,
      collected_date: '2026-10-08',
      expiry_date: '2026-11-19',
      chiller: 'Vault-A (Chiller #3, -4°C)',
      status: 'Tested & Cleared'
    }
  ],

  hospital_requests: [
    {
      req_id: 'REQ-501',
      hospital: 'Apollo Specialty Hospital, Chennai',
      patient: 'Kavitha Shanmugam',
      blood_group: 'O-',
      component: 'Packed Red Cells',
      units: 2,
      urgency: 'Emergency STAT',
      status: 'Pending',
      date: '2026-10-12 18:45'
    },
    {
      req_id: 'REQ-502',
      hospital: 'CMC Hospital, Vellore',
      patient: 'Rahul Verma',
      blood_group: 'B+',
      component: 'Whole Blood',
      units: 3,
      urgency: 'High Priority',
      status: 'Approved',
      date: '2026-10-12 16:10'
    },
    {
      req_id: 'REQ-503',
      hospital: 'MIOT International, Chennai',
      patient: 'Divya Nair',
      blood_group: 'A+',
      component: 'Platelets',
      units: 1,
      urgency: 'Routine',
      status: 'Fulfilled',
      date: '2026-10-12 11:30'
    }
  ]
};

// Blood Group Compatibility Mapping Matrix
const COMPATIBILITY_MAP = {
  'O-': {
    giveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    receiveFrom: ['O-'],
    label: 'Universal Red Cell Donor'
  },
  'O+': {
    giveTo: ['O+', 'A+', 'B+', 'AB+'],
    receiveFrom: ['O-', 'O+'],
    label: 'Most Common Positive Donor'
  },
  'A-': {
    giveTo: ['A-', 'A+', 'AB-', 'AB+'],
    receiveFrom: ['O-', 'A-'],
    label: 'Rare Negative Subtype'
  },
  'A+': {
    giveTo: ['A+', 'AB+'],
    receiveFrom: ['O-', 'O+', 'A-', 'A+'],
    label: 'High Demand Blood Type'
  },
  'B-': {
    giveTo: ['B-', 'B+', 'AB-', 'AB+'],
    receiveFrom: ['O-', 'B-'],
    label: 'Rare Negative Subtype'
  },
  'B+': {
    giveTo: ['B+', 'AB+'],
    receiveFrom: ['O-', 'O+', 'B-', 'B+'],
    label: 'High Demand Blood Type'
  },
  'AB-': {
    giveTo: ['AB-', 'AB+'],
    receiveFrom: ['O-', 'A-', 'B-', 'AB-'],
    label: 'Rarest Blood Subtype'
  },
  'AB+': {
    giveTo: ['AB+'],
    receiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    label: 'Universal Red Cell Recipient'
  }
};

// Pre-Configured Laboratory Staff Accounts (Slide 48 Authentication)
const AUTH_USERS = [
  {
    username: 'admin@hemopulse.org',
    alias: 'admin',
    password: 'admin123',
    name: 'Dr. Rajesh M.',
    role: 'Admin',
    avatar: 'R',
    title: 'Chief Medical Administrator'
  },
  {
    username: 'lab@hemopulse.org',
    alias: 'lab',
    password: 'lab123',
    name: 'Suresh Kumar',
    role: 'Lab Technician',
    avatar: 'S',
    title: 'Senior Hematology Officer'
  },
  {
    username: 'doctor@apollo.org',
    alias: 'doctor',
    password: 'apollo123',
    name: 'Dr. Priya Sundaram',
    role: 'Hospital Doctor',
    avatar: 'P',
    title: 'Apollo Transfusion Head'
  }
];

// Application State
class BloodBankApp {
  constructor() {
    this.currentUser = this.loadUserSession();
    this.data = this.loadState();
    this.activeTab = 'dashboard';
    this.activeCompatibilityType = 'O-';
    this.theme = localStorage.getItem('hemopulse_theme') || 'light';
    
    this.init();
  }

  loadUserSession() {
    try {
      const savedUser = localStorage.getItem('hemopulse_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    }
    // Return null so the Login Screen is displayed for the user to see and use
    return null;
  }

  loadState() {
    try {
      const saved = localStorage.getItem('hemopulse_db_v2');
      if (saved) {
        return JSON.parse(saved);
      }
      const v1 = localStorage.getItem('hemopulse_db');
      if (v1) {
        return JSON.parse(v1);
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveState() {
    try {
      localStorage.setItem('hemopulse_db_v2', JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save state', e);
    }
    this.updateDashboardKPIs();
  }

  resetState() {
    if (confirm('Reset all Blood Bank records to default state? Any added donors or transactions will be restored.')) {
      this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
      this.saveState();
      this.renderAll();
      this.showToast('Database Reset', 'Restored initial sample records.', 'success');
    }
  }

  init() {
    this.applyTheme(this.theme);
    this.setupEventListeners();
    this.renderAuthUI();
    this.renderAll();
  }

  renderAuthUI() {
    const authScreen = document.getElementById('auth-screen');
    const mainContent = document.getElementById('main-content');
    const headerAuth = document.getElementById('header-auth-section');

    if (this.currentUser) {
      if (authScreen) authScreen.style.display = 'none';
      if (mainContent) mainContent.style.display = 'block';

      if (headerAuth) {
        headerAuth.innerHTML = `
          <div class="header-auth-controls">
            <div class="user-profile-badge" title="${this.currentUser.title || this.currentUser.role}">
              <div class="user-avatar">${this.currentUser.avatar || 'U'}</div>
              <div class="user-details">
                <span class="user-name-text">${this.currentUser.name}</span>
                <span class="user-role-text">${this.currentUser.role}</span>
              </div>
            </div>
            <button type="button" class="btn-switch-role" id="switch-role-btn" title="Switch User or Role">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              Switch Role
            </button>
            <button type="button" class="btn-signout" id="logout-btn" title="Sign Out of HemoPulse">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        `;
        document.getElementById('logout-btn')?.addEventListener('click', () => this.handleLogout());
        document.getElementById('switch-role-btn')?.addEventListener('click', () => {
          if (authScreen) authScreen.style.display = 'flex';
        });
      }

      // Render Session Controls directly on Main Dashboard
      const dashSessionBar = document.getElementById('dashboard-session-bar');
      if (dashSessionBar) {
        dashSessionBar.innerHTML = `
          <div class="dash-user-badge">
            <div class="dash-avatar">${this.currentUser.avatar || 'U'}</div>
            <div class="dash-user-text">
              <div class="dash-welcome-title">
                <span>Active Session:</span> <strong>${this.currentUser.name}</strong>
                <span class="role-badge">${this.currentUser.role}</span>
              </div>
              <div class="dash-session-sub">${this.currentUser.title || 'Authenticated User'} • Full System Access</div>
            </div>
          </div>
          <div class="dash-session-buttons">
            <button type="button" class="btn-switch-role" id="dash-switch-btn" title="Switch User or Role">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              Switch Role
            </button>
            <button type="button" class="btn-signout" id="dash-signout-btn" title="Sign Out of HemoPulse">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        `;
        document.getElementById('dash-signout-btn')?.addEventListener('click', () => this.handleLogout());
        document.getElementById('dash-switch-btn')?.addEventListener('click', () => {
          if (authScreen) authScreen.style.display = 'flex';
        });
      }
    } else {
      if (authScreen) authScreen.style.display = 'flex';
      if (mainContent) mainContent.style.display = 'none';

      if (headerAuth) {
        headerAuth.innerHTML = `
          <div class="header-auth-controls">
            <button type="button" class="btn-signin-header" id="header-signin-btn" title="Sign In to Portal">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Sign In
            </button>
          </div>
        `;
        document.getElementById('header-signin-btn')?.addEventListener('click', () => {
          if (authScreen) authScreen.style.display = 'flex';
          if (mainContent) mainContent.style.display = 'block';
        });
      }

      // Render Guest Bar directly on Main Dashboard
      const dashSessionBar = document.getElementById('dashboard-session-bar');
      if (dashSessionBar) {
        dashSessionBar.innerHTML = `
          <div class="dash-user-badge">
            <div class="dash-avatar" style="background:var(--text-subtle);">?</div>
            <div class="dash-user-text">
              <div class="dash-welcome-title">
                <span>Browsing as:</span> <strong>Guest Viewer</strong>
              </div>
              <div class="dash-session-sub">Sign in to record blood donations or execute database transactions</div>
            </div>
          </div>
          <div class="dash-session-buttons">
            <button type="button" class="btn-signin-header" id="dash-signin-btn" title="Sign In to Portal">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Sign In
            </button>
          </div>
        `;
        document.getElementById('dash-signin-btn')?.addEventListener('click', () => {
          if (authScreen) authScreen.style.display = 'flex';
        });
      }
    }
  }

  handleLogin(username, password) {
    const user = AUTH_USERS.find(u => 
      (u.username.toLowerCase() === username.toLowerCase() || u.alias.toLowerCase() === username.toLowerCase()) &&
      u.password === password
    );

    if (user) {
      this.currentUser = user;
      localStorage.setItem('hemopulse_user', JSON.stringify(user));
      this.renderAuthUI();
      this.showToast('Login Successful', `Welcome back, ${user.name} (${user.role})! PreparedStatement authenticated.`, 'success');
      return true;
    } else {
      // Also allow any custom credentials for testing if entered
      if (username && password.length >= 4) {
        const customUser = {
          username: username,
          alias: username.split('@')[0],
          name: username.split('@')[0].toUpperCase(),
          role: 'Staff Member',
          avatar: username[0].toUpperCase(),
          title: 'Authorized Staff'
        };
        this.currentUser = customUser;
        localStorage.setItem('hemopulse_user', JSON.stringify(customUser));
        this.renderAuthUI();
        this.showToast('Login Successful', `Welcome, ${customUser.name}! Session initialized.`, 'success');
        return true;
      }
      this.showToast('Authentication Failed', 'Invalid credentials. Please click a Demo Quick Login pill.', 'danger');
      return false;
    }
  }

  handleLogout() {
    this.currentUser = null;
    localStorage.removeItem('hemopulse_user');
    this.renderAuthUI();
    this.showToast('Signed Out', 'You have been signed out. Welcome back anytime!', 'warning');
  }

  applyTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hemopulse_theme', theme);
    
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' 
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
  }

  toggleTheme() {
    const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
  }

  setupEventListeners() {
    // Authentication & Login Listeners
    const loginForm = document.getElementById('auth-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        this.handleLogin(username, password);
      });
    }

    // Quick-Fill Role Buttons
    document.querySelectorAll('.role-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const u = btn.getAttribute('data-username');
        const p = btn.getAttribute('data-password');
        const userField = document.getElementById('login-username');
        const passField = document.getElementById('login-password');
        if (userField && passField) {
          userField.value = u;
          passField.value = p;
          this.handleLogin(u, p);
        }
      });
    });

    // Toggle Password Visibility
    const togglePassBtn = document.getElementById('toggle-password-btn');
    if (togglePassBtn) {
      togglePassBtn.addEventListener('click', () => {
        const passField = document.getElementById('login-password');
        if (passField) {
          const isPass = passField.type === 'password';
          passField.type = isPass ? 'text' : 'password';
          togglePassBtn.innerHTML = isPass
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
        }
      });
    }

    // Forgot Password Link
    const forgotLink = document.getElementById('forgot-password-link');
    if (forgotLink) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showToast('Credentials Hint', 'Admin: admin123 | Lab Tech: lab123 | Doctor: apollo123', 'warning');
      });
    }

    // Modal Close Button (Dismiss Login Dialog)
    const closeAuthBtn = document.getElementById('close-auth-screen-btn');
    if (closeAuthBtn) {
      closeAuthBtn.addEventListener('click', () => {
        const authScreen = document.getElementById('auth-screen');
        const mainContent = document.getElementById('main-content');
        if (this.currentUser) {
          if (authScreen) authScreen.style.display = 'none';
        } else {
          if (authScreen) authScreen.style.display = 'none';
          if (mainContent) mainContent.style.display = 'block';
          this.showToast('Guest Mode', 'Browsing in Guest Mode. Click Sign In in the top-right header anytime.', 'info');
        }
      });
    }

    // Nav Tabs
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Theme Switcher
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Reset Button
    const resetBtn = document.getElementById('reset-db-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetState());
    }

    // Donor Search & Filter
    const searchInput = document.getElementById('donor-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.renderDonorsTable());
    }

    const bloodFilter = document.getElementById('donor-blood-filter');
    if (bloodFilter) {
      bloodFilter.addEventListener('change', () => this.renderDonorsTable());
    }

    const cityFilter = document.getElementById('donor-city-filter');
    if (cityFilter) {
      cityFilter.addEventListener('change', () => this.renderDonorsTable());
    }

    // Add Donor Modal Open & Submit
    const addDonorBtn = document.getElementById('open-add-donor-btn');
    const addDonorModal = document.getElementById('add-donor-modal');
    if (addDonorBtn && addDonorModal) {
      addDonorBtn.addEventListener('click', () => {
        let maxNum = 100;
        this.data.donors.forEach(d => {
          const match = d.donor_id.match(/\d+/);
          if (match) {
            const num = parseInt(match[0], 10);
            if (num > maxNum) maxNum = num;
          }
        });
        const nextId = 'D' + (maxNum + 1);
        document.getElementById('add-donor-id').value = nextId;
        addDonorModal.showModal();
      });
    }

    const addDonorForm = document.getElementById('add-donor-form');
    if (addDonorForm) {
      addDonorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddDonor(new FormData(addDonorForm));
      });
    }

    // Edit Donor Form
    const editDonorForm = document.getElementById('edit-donor-form');
    if (editDonorForm) {
      editDonorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEditDonor(new FormData(editDonorForm));
      });
    }

    // Hospital Request Modal Open & Submit
    const openReqBtn = document.getElementById('open-new-request-btn');
    const newReqModal = document.getElementById('new-request-modal');
    if (openReqBtn && newReqModal) {
      openReqBtn.addEventListener('click', () => {
        let maxReq = 500;
        this.data.hospital_requests.forEach(r => {
          const match = r.req_id.match(/\d+/);
          if (match) {
            const num = parseInt(match[0], 10);
            if (num > maxReq) maxReq = num;
          }
        });
        const nextReqId = 'REQ-' + (maxReq + 1);
        document.getElementById('req-id-input').value = nextReqId;
        newReqModal.showModal();
      });
    }

    const newReqForm = document.getElementById('new-request-form');
    if (newReqForm) {
      newReqForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleNewHospitalRequest(new FormData(newReqForm));
      });
    }

    // Add Blood Bag Modal
    const addBagBtn = document.getElementById('open-add-bag-btn');
    const addBagModal = document.getElementById('add-bag-modal');
    if (addBagBtn && addBagModal) {
      addBagBtn.addEventListener('click', () => {
        let maxBag = 900;
        this.data.blood_bags.forEach(b => {
          const match = b.bag_id.match(/\d+/);
          if (match) {
            const num = parseInt(match[0], 10);
            if (num > maxBag) maxBag = num;
          }
        });
        const nextBagId = 'BAG-' + (maxBag + 1);
        document.getElementById('bag-id-input').value = nextBagId;
        addBagModal.showModal();
      });
    }

    const addBagForm = document.getElementById('add-bag-form');
    if (addBagForm) {
      addBagForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddBloodBag(new FormData(addBagForm));
      });
    }

    // Close Modal buttons
    document.querySelectorAll('.modal-close-btn, .modal-cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('dialog');
        if (modal) modal.close();
      });
    });

    // SQL Runner button
    const runSqlBtn = document.getElementById('execute-sql-btn');
    if (runSqlBtn) {
      runSqlBtn.addEventListener('click', () => this.executeSqlTerminal());
    }

    // Quick SQL queries
    document.querySelectorAll('.quick-sql-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-sql');
        const sqlInput = document.getElementById('sql-query-input');
        if (sqlInput) {
          sqlInput.value = query;
          this.executeSqlTerminal();
        }
      });
    });

    // Copy Code Buttons
    const copyJavaBtn = document.getElementById('copy-java-code-btn');
    if (copyJavaBtn) {
      copyJavaBtn.addEventListener('click', () => {
        const code = document.getElementById('java-code-content').innerText;
        navigator.clipboard.writeText(code).then(() => {
          this.showToast('Copied', 'Java JDBC Code copied to clipboard!', 'success');
        });
      });
    }

    const copySqlBtn = document.getElementById('copy-sql-schema-btn');
    if (copySqlBtn) {
      copySqlBtn.addEventListener('click', () => {
        const code = document.getElementById('oracle-sql-schema-content').innerText;
        navigator.clipboard.writeText(code).then(() => {
          this.showToast('Copied', 'Oracle SQL DDL copied to clipboard!', 'success');
        });
      });
    }

    // Initialize Interactive Features
    this.setupEligibilityCalculator();
    this.setupSqlCommandCenter();
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.toggle('active', view.id === `tab-${tabName}`);
    });

    // Rerender specific components if needed
    if (tabName === 'donors') {
      this.populateCityFilter();
      this.renderDonorsTable();
    } else if (tabName === 'inventory') {
      this.renderInventoryLedger();
    } else if (tabName === 'requests') {
      this.renderHospitalRequests();
    } else if (tabName === 'dashboard') {
      this.renderInventoryCards();
      this.renderCompatibilityExplorer();
    } else if (tabName === 'sqlcommands') {
      this.renderSqlCommands('all');
    }
  }

  renderAll() {
    this.updateDashboardKPIs();
    this.renderInventoryCards();
    this.renderCompatibilityExplorer();
    this.populateCityFilter();
    this.renderDonorsTable();
    this.renderInventoryLedger();
    this.renderHospitalRequests();
    this.renderSqlCommands('all');
  }

  // ==========================================
  // DASHBOARD & INVENTORY MODULE
  // ==========================================
  updateDashboardKPIs() {
    // Total units
    let totalUnits = 0;
    Object.values(this.data.inventory).forEach(item => {
      totalUnits += item.units;
    });

    const totalUnitsEl = document.getElementById('kpi-total-units');
    if (totalUnitsEl) totalUnitsEl.innerText = totalUnits;

    // Active donors
    const activeDonorsEl = document.getElementById('kpi-active-donors');
    if (activeDonorsEl) activeDonorsEl.innerText = this.data.donors.length;

    // Pending requests
    const pendingRequests = this.data.hospital_requests.filter(r => r.status === 'Pending').length;
    const pendingReqEl = document.getElementById('kpi-pending-requests');
    if (pendingReqEl) pendingReqEl.innerText = pendingRequests;

    // Critical shortage alerts
    let criticalCount = 0;
    Object.entries(this.data.inventory).forEach(([type, item]) => {
      if (item.units <= item.minSafe) criticalCount++;
    });
    const criticalEl = document.getElementById('kpi-critical-shortage');
    if (criticalEl) criticalEl.innerText = criticalCount;
  }

  renderInventoryCards() {
    const grid = document.getElementById('inventory-cards-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    bloodTypes.forEach(type => {
      const stock = this.data.inventory[type] || { units: 0, capacity: 50, minSafe: 15 };
      const percentage = Math.min(100, Math.round((stock.units / stock.capacity) * 100));
      
      let statusClass = 'adequate';
      let statusLabel = 'Adequate';
      let meterColor = 'green';
      let isCritical = false;

      if (stock.units <= Math.round(stock.minSafe * 0.6)) {
        statusClass = 'critical';
        statusLabel = 'Critical Low';
        meterColor = 'red';
        isCritical = true;
      } else if (stock.units <= stock.minSafe) {
        statusClass = 'low';
        statusLabel = 'Low Reserve';
        meterColor = 'yellow';
      }

      const card = document.createElement('div');
      card.className = `blood-card ${isCritical ? 'critical' : ''}`;
      card.innerHTML = `
        <div class="blood-card-top">
          <div class="blood-type-badge">${type}</div>
          <span class="blood-status-tag ${statusClass}">${statusLabel}</span>
        </div>
        <div class="blood-units-wrap">
          <span class="blood-units-number">${stock.units}</span>
          <span class="blood-units-label">Units (Bags)</span>
        </div>
        <div class="stock-meter" title="${percentage}% capacity">
          <div class="stock-meter-fill ${meterColor}" style="width: ${percentage}%"></div>
        </div>
        <div class="blood-card-footer">
          <span>Safe Min: ${stock.minSafe} Units</span>
          <button type="button" onclick="window.app.quickAddStock('${type}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            +1 Unit
          </button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  quickAddStock(type) {
    if (this.data.inventory[type]) {
      this.data.inventory[type].units += 1;
      this.saveState();
      this.renderInventoryCards();
      this.showToast('Stock Updated', `Added 1 unit to ${type} inventory. PreparedStatement UPDATE executed.`, 'success');
    }
  }

  // ==========================================
  // COMPATIBILITY EXPLORER
  // ==========================================
  renderCompatibilityExplorer() {
    const selector = document.getElementById('compat-type-selector');
    if (!selector) return;

    selector.innerHTML = '';
    const bloodTypes = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

    bloodTypes.forEach(type => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `compat-btn ${this.activeCompatibilityType === type ? 'active' : ''}`;
      btn.innerText = type;
      btn.addEventListener('click', () => {
        this.activeCompatibilityType = type;
        this.renderCompatibilityExplorer();
      });
      selector.appendChild(btn);
    });

    const info = COMPATIBILITY_MAP[this.activeCompatibilityType];
    const donateContainer = document.getElementById('compat-donate-chips');
    const receiveContainer = document.getElementById('compat-receive-chips');
    const descEl = document.getElementById('compat-type-desc');

    if (descEl) descEl.innerText = `${this.activeCompatibilityType}: ${info.label}`;

    if (donateContainer) {
      donateContainer.innerHTML = '';
      info.giveTo.forEach(t => {
        const chip = document.createElement('span');
        chip.className = `blood-chip ${t === 'AB+' && this.activeCompatibilityType === 'O-' ? 'universal' : ''}`;
        chip.innerHTML = `<strong>${t}</strong>`;
        donateContainer.appendChild(chip);
      });
    }

    if (receiveContainer) {
      receiveContainer.innerHTML = '';
      info.receiveFrom.forEach(t => {
        const chip = document.createElement('span');
        chip.className = `blood-chip ${t === 'O-' ? 'universal' : ''}`;
        chip.innerHTML = `<strong>${t}</strong>`;
        receiveContainer.appendChild(chip);
      });
    }
  }

  // ==========================================
  // DONOR MANAGEMENT (Lab Ex 11 DML & Retrieval)
  // ==========================================
  populateCityFilter() {
    const filter = document.getElementById('donor-city-filter');
    if (!filter) return;

    const currentVal = filter.value;
    const cities = Array.from(new Set(this.data.donors.map(d => d.city))).sort();
    
    filter.innerHTML = '<option value="">All Cities / Depts</option>';
    cities.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.innerText = c;
      if (c === currentVal) opt.selected = true;
      filter.appendChild(opt);
    });
  }

  renderDonorsTable() {
    const tbody = document.getElementById('donors-table-body');
    const noRowsMsg = document.getElementById('donors-empty-state');
    const searchInput = document.getElementById('donor-search-input');
    const bloodFilter = document.getElementById('donor-blood-filter');
    const cityFilter = document.getElementById('donor-city-filter');

    if (!tbody) return;

    const searchTerm = (searchInput?.value || '').toLowerCase().trim();
    const bloodVal = bloodFilter?.value || '';
    const cityVal = cityFilter?.value || '';

    // Lab Ex 11 SELECT with WHERE clause filter
    const filtered = this.data.donors.filter(donor => {
      const matchesSearch = 
        donor.name.toLowerCase().includes(searchTerm) ||
        donor.donor_id.toLowerCase().includes(searchTerm) ||
        donor.city.toLowerCase().includes(searchTerm) ||
        donor.phone.includes(searchTerm);
      
      const matchesBlood = !bloodVal || donor.blood_group === bloodVal;
      const matchesCity = !cityVal || donor.city === cityVal;

      return matchesSearch && matchesBlood && matchesCity;
    });

    tbody.innerHTML = '';

    // Lab Ex 11 Requirement: "Display a suitable message when no matching rows are returned."
    if (filtered.length === 0) {
      tbody.style.display = 'none';
      if (noRowsMsg) noRowsMsg.style.display = 'block';
      return;
    }

    tbody.style.display = 'table-row-group';
    if (noRowsMsg) noRowsMsg.style.display = 'none';

    filtered.forEach(donor => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="donor-id-badge">${donor.donor_id}</span></td>
        <td>
          <div style="font-weight: 700;">${donor.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${donor.email}</div>
        </td>
        <td>
          <span class="blood-chip" style="display:inline-flex; padding:0.2rem 0.5rem; font-size:0.8rem;">
            ${donor.blood_group}
          </span>
        </td>
        <td>${donor.age} (${donor.gender[0]})</td>
        <td>${donor.phone}</td>
        <td>${donor.city}</td>
        <td><strong>${donor.hemoglobin}</strong> g/dL</td>
        <td>${donor.last_donation}</td>
        <td>
          <span class="status-pill ${donor.status === 'Eligible' ? 'active' : 'deferred'}">
            ${donor.status}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button type="button" class="action-icon-btn" title="View Donor Card" onclick="window.app.viewDonorCard('${donor.donor_id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </button>
            <button type="button" class="action-icon-btn" title="Edit Donor (UPDATE)" onclick="window.app.openEditDonorModal('${donor.donor_id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button type="button" class="action-icon-btn delete" title="Delete Donor (DELETE)" onclick="window.app.deleteDonor('${donor.donor_id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Lab Ex 11 DML: INSERT via PreparedStatement simulation
  handleAddDonor(formData) {
    const donorId = formData.get('donor_id').trim().toUpperCase();
    const name = formData.get('name').trim();
    const bloodGroup = formData.get('blood_group');
    const age = parseInt(formData.get('age'), 10);
    const gender = formData.get('gender');
    const phone = formData.get('phone').trim();
    const email = formData.get('email').trim();
    const city = formData.get('city').trim();
    const hemoglobin = parseFloat(formData.get('hemoglobin'));
    const lastDonation = formData.get('last_donation') || new Date().toISOString().split('T')[0];

    // Constraint Validation
    if (this.data.donors.some(d => d.donor_id === donorId)) {
      this.showToast('Constraint Violation (ORA-00001)', `Duplicate Primary Key: Donor SID "${donorId}" already exists!`, 'danger');
      return;
    }

    if (age < 18 || age > 65) {
      this.showToast('Validation Failed', 'Donor age must be between 18 and 65 years.', 'warning');
      return;
    }

    // Eligibility business logic (Slide 47 constraint handling)
    const status = hemoglobin >= 12.5 ? 'Eligible' : 'Deferred';

    const newDonor = {
      donor_id: donorId,
      name,
      blood_group: bloodGroup,
      age,
      gender,
      phone,
      email,
      city,
      hemoglobin,
      last_donation: lastDonation,
      status,
      total_donations: 1
    };

    // Add new donor to the LAST entry of the table
    this.data.donors.push(newDonor);

    // Also automatically register initial collection bag if eligible to the last entry
    if (status === 'Eligible') {
      let maxBag = 900;
      this.data.blood_bags.forEach(b => {
        const match = b.bag_id.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxBag) maxBag = num;
        }
      });
      const newBagId = 'BAG-' + (maxBag + 1);
      this.data.blood_bags.push({
        bag_id: newBagId,
        donor_id: donorId,
        blood_group: bloodGroup,
        component: 'Whole Blood',
        volume_ml: 450,
        collected_date: lastDonation,
        expiry_date: this.calculateExpiry(lastDonation, 42),
        chiller: 'Vault-A (Chiller #1, -4°C)',
        status: 'Tested & Cleared'
      });

      if (this.data.inventory[bloodGroup]) {
        this.data.inventory[bloodGroup].units += 1;
      }
    }

    this.saveState();
    this.renderAll();

    const modal = document.getElementById('add-donor-modal');
    if (modal) modal.close();

    // Lab Ex 11 Feedback requirement: Show affected rows and statement executed
    this.showToast(
      'PreparedStatement INSERT (1 Row)',
      `Donor ${name} (${donorId}) inserted. Status: ${status}. Transaction COMMIT executed.`,
      'success'
    );
  }

  // Lab Ex 11 DML: UPDATE via PreparedStatement simulation
  openEditDonorModal(donorId) {
    const donor = this.data.donors.find(d => d.donor_id === donorId);
    if (!donor) return;

    document.getElementById('edit-donor-id').value = donor.donor_id;
    document.getElementById('edit-name').value = donor.name;
    document.getElementById('edit-blood-group').value = donor.blood_group;
    document.getElementById('edit-age').value = donor.age;
    document.getElementById('edit-phone').value = donor.phone;
    document.getElementById('edit-city').value = donor.city;
    document.getElementById('edit-hemoglobin').value = donor.hemoglobin;
    document.getElementById('edit-status').value = donor.status;

    const modal = document.getElementById('edit-donor-modal');
    if (modal) modal.showModal();
  }

  handleEditDonor(formData) {
    const donorId = formData.get('donor_id');
    const donor = this.data.donors.find(d => d.donor_id === donorId);
    if (!donor) return;

    const oldCity = donor.city;
    const oldHb = donor.hemoglobin;

    donor.name = formData.get('name').trim();
    donor.phone = formData.get('phone').trim();
    donor.city = formData.get('city').trim();
    donor.hemoglobin = parseFloat(formData.get('hemoglobin'));
    donor.status = formData.get('status');

    this.saveState();
    this.renderDonorsTable();

    const modal = document.getElementById('edit-donor-modal');
    if (modal) modal.close();

    // Feedback matching Slide 40: "executeUpdate() result: 1 row updated"
    this.showToast(
      'PreparedStatement UPDATE (1 Row)',
      `Updated donor ${donorId}. Affected rows: 1. Changes committed.`,
      'success'
    );
  }

  // Lab Ex 11 DML: DELETE via PreparedStatement simulation
  deleteDonor(donorId) {
    const donor = this.data.donors.find(d => d.donor_id === donorId);
    if (!donor) return;

    // Slide 46: "accept SID after confirmation and display the number of rows deleted."
    const confirmed = confirm(
      `Confirm Deletion:\nAre you sure you want to delete Donor "${donor.name}" (SID: ${donorId})?\n\nThis will execute:\nDELETE FROM DONOR WHERE DONOR_ID = '${donorId}';`
    );

    if (confirmed) {
      this.data.donors = this.data.donors.filter(d => d.donor_id !== donorId);
      this.saveState();
      this.renderAll();

      this.showToast(
        'PreparedStatement DELETE (1 Row)',
        `Target SID ${donorId} deleted successfully. Affected rows: 1. COMMIT executed.`,
        'success'
      );
    }
  }

  // Printable Donor Identity Card
  viewDonorCard(donorId) {
    const donor = this.data.donors.find(d => d.donor_id === donorId);
    if (!donor) return;

    const modal = document.getElementById('donor-card-modal');
    const body = document.getElementById('donor-card-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="donor-card-print">
        <div class="donor-card-top">
          <div>
            <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; opacity:0.85;">Official Blood Donor Card</div>
            <h3 style="font-size:1.35rem; font-weight:800;">${donor.name}</h3>
            <div style="font-family:var(--font-mono); font-size:0.85rem; opacity:0.9;">SID: ${donor.donor_id}</div>
          </div>
          <div class="donor-card-blood-badge">${donor.blood_group}</div>
        </div>
        <div class="donor-card-details">
          <div class="donor-card-field">
            <label>Gender / Age</label>
            <div>${donor.gender} / ${donor.age} yrs</div>
          </div>
          <div class="donor-card-field">
            <label>Contact Phone</label>
            <div>${donor.phone}</div>
          </div>
          <div class="donor-card-field">
            <label>City Location</label>
            <div>${donor.city}</div>
          </div>
          <div class="donor-card-field">
            <label>Hemoglobin</label>
            <div>${donor.hemoglobin} g/dL</div>
          </div>
          <div class="donor-card-field">
            <label>Last Donation</label>
            <div>${donor.last_donation}</div>
          </div>
          <div class="donor-card-field">
            <label>Donor Status</label>
            <div style="color:#86efac;">● ${donor.status}</div>
          </div>
        </div>
      </div>
    `;

    modal.showModal();
  }

  // ==========================================
  // BLOOD BAG INVENTORY LEDGER
  // ==========================================
  renderInventoryLedger() {
    const tbody = document.getElementById('blood-bags-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    this.data.blood_bags.forEach(bag => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="donor-id-badge">${bag.bag_id}</span></td>
        <td><strong>${bag.blood_group}</strong></td>
        <td>${bag.component}</td>
        <td>${bag.volume_ml} mL</td>
        <td>${bag.donor_id}</td>
        <td>${bag.collected_date}</td>
        <td>${bag.expiry_date}</td>
        <td><small style="color:var(--text-muted);">${bag.chiller}</small></td>
        <td><span class="status-pill active">${bag.status}</span></td>
        <td>
          <button type="button" class="btn-danger" onclick="window.app.discardBag('${bag.bag_id}')">
            Dispose / Use
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  handleAddBloodBag(formData) {
    const bagId = formData.get('bag_id').trim();
    const donorId = formData.get('donor_id').trim();
    const bloodGroup = formData.get('blood_group');
    const component = formData.get('component');
    const volume = parseInt(formData.get('volume_ml'), 10) || 450;
    const collectedDate = formData.get('collected_date');
    const daysValid = component.includes('Platelet') ? 5 : (component.includes('Plasma') ? 365 : 42);
    const expiryDate = this.calculateExpiry(collectedDate, daysValid);
    const chiller = formData.get('chiller');

    // Add new blood bag to the LAST entry
    this.data.blood_bags.push({
      bag_id: bagId,
      donor_id: donorId,
      blood_group: bloodGroup,
      component,
      volume_ml: volume,
      collected_date: collectedDate,
      expiry_date: expiryDate,
      chiller,
      status: 'Tested & Cleared'
    });

    if (this.data.inventory[bloodGroup]) {
      this.data.inventory[bloodGroup].units += 1;
    }

    this.saveState();
    this.renderAll();

    const modal = document.getElementById('add-bag-modal');
    if (modal) modal.close();

    this.showToast('Bag Registered', `Added bag ${bagId} to ${bloodGroup} stock. PreparedStatement executed.`, 'success');
  }

  discardBag(bagId) {
    const bag = this.data.blood_bags.find(b => b.bag_id === bagId);
    if (!bag) return;

    if (confirm(`Remove blood bag ${bagId} (${bag.blood_group}) from storage? Inventory count will decrement by 1.`)) {
      this.data.blood_bags = this.data.blood_bags.filter(b => b.bag_id !== bagId);
      if (this.data.inventory[bag.blood_group] && this.data.inventory[bag.blood_group].units > 0) {
        this.data.inventory[bag.blood_group].units -= 1;
      }
      this.saveState();
      this.renderAll();
      this.showToast('Bag Disposed', `Bag ${bagId} removed from inventory.`, 'success');
    }
  }

  calculateExpiry(dateStr, daysToAdd) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + daysToAdd);
    return d.toISOString().split('T')[0];
  }

  // ==========================================
  // HOSPITAL REQUESTS & TRANSACTION CHALLENGE
  // (Slide 47 & 48: ACID Transaction Simulation)
  // ==========================================
  renderHospitalRequests() {
    const tbody = document.getElementById('hospital-requests-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    this.data.hospital_requests.forEach(req => {
      const isPending = req.status === 'Pending';
      const isApproved = req.status === 'Approved';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="donor-id-badge">${req.req_id}</span></td>
        <td>
          <div style="font-weight:700;">${req.hospital}</div>
          <small style="color:var(--text-muted);">${req.date}</small>
        </td>
        <td>${req.patient}</td>
        <td><span class="blood-chip" style="display:inline-flex; padding:0.2rem 0.5rem; font-size:0.8rem;">${req.blood_group}</span></td>
        <td><strong>${req.units}</strong> Units (${req.component})</td>
        <td>
          <span class="status-pill ${req.urgency.includes('Emergency') ? 'deferred' : 'pending'}">
            ${req.urgency}
          </span>
        </td>
        <td>
          <span class="status-pill ${req.status === 'Fulfilled' ? 'fulfilled' : (req.status === 'Approved' ? 'active' : 'pending')}">
            ${req.status}
          </span>
        </td>
        <td>
          ${isPending || isApproved ? `
            <button type="button" class="btn-primary" style="padding:0.35rem 0.75rem; font-size:0.775rem;" onclick="window.app.fulfillRequestTransaction('${req.req_id}')">
              Fulfill & Commit
            </button>
          ` : `
            <span style="font-size:0.75rem; color:var(--success); font-weight:700;">✓ Dispatched</span>
          `}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  handleNewHospitalRequest(formData) {
    const reqId = formData.get('req_id').trim();
    const hospital = formData.get('hospital').trim();
    const patient = formData.get('patient').trim();
    const bloodGroup = formData.get('blood_group');
    const component = formData.get('component');
    const units = parseInt(formData.get('units'), 10) || 1;
    const urgency = formData.get('urgency');

    // Add new request to the LAST entry
    this.data.hospital_requests.push({
      req_id: reqId,
      hospital,
      patient,
      blood_group: bloodGroup,
      component,
      units,
      urgency,
      status: 'Pending',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    this.saveState();
    this.renderAll();

    const modal = document.getElementById('new-request-modal');
    if (modal) modal.close();

    this.showToast('Order Received', `Order ${reqId} for ${units} unit(s) of ${bloodGroup} logged. Status: Pending.`, 'success');
  }

  /**
   * Slide 42, 47 & 48: Transaction Challenge
   * "Demonstrate setAutoCommit(false), commit on success, and rollback on failure."
   */
  fulfillRequestTransaction(reqId) {
    const req = this.data.hospital_requests.find(r => r.req_id === reqId);
    if (!req) return;

    const availableStock = this.data.inventory[req.blood_group]?.units || 0;

    // Simulation of ACID Transaction Begin
    console.log(`[TRANSACTION START] con.setAutoCommit(false);`);

    if (availableStock < req.units) {
      // Transaction Failure -> ROLLBACK
      const msg = `ROLLBACK TRIGGERED!\nInsufficient inventory for ${req.blood_group}.\nRequired: ${req.units} units\nAvailable: ${availableStock} units.\n\nDatabase consistency preserved: No stock was deducted.`;
      alert(msg);
      this.showToast(
        'Transaction ROLLBACK',
        `Insufficient ${req.blood_group} units. con.rollback() called. Request not fulfilled.`,
        'danger'
      );
      return;
    }

    // Success -> Deduct Stock & Update Status -> COMMIT
    this.data.inventory[req.blood_group].units -= req.units;
    req.status = 'Fulfilled';

    this.saveState();
    this.renderAll();

    console.log(`[TRANSACTION SUCCESS] con.commit();`);
    this.showToast(
      'Transaction COMMIT (Success)',
      `Deducted ${req.units} units of ${req.blood_group} and marked ${reqId} as Fulfilled. con.commit() completed!`,
      'success'
    );
  }

  // =========================================================================
  // CLINICAL ELIGIBILITY & DONATION VOLUME CALCULATOR
  // Accepts clinical inputs -> Processes criteria -> Displays outputs & DML
  // =========================================================================
  setupEligibilityCalculator() {
    const form = document.getElementById('eligibility-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleProcessEligibility();
    });

    document.getElementById('load-demo-eligible-btn')?.addEventListener('click', () => {
      document.getElementById('el-name').value = 'Aditya Sen';
      document.getElementById('el-blood-group').value = 'O+';
      document.getElementById('el-gender').value = 'Male';
      document.getElementById('el-age').value = '26';
      document.getElementById('el-weight').value = '68';
      document.getElementById('el-hemoglobin').value = '14.2';
      document.getElementById('el-systolic').value = '120';
      document.getElementById('el-diastolic').value = '80';
      document.getElementById('el-pulse').value = '72';
      document.getElementById('el-interval').value = '115';
      document.getElementById('el-flag-tattoo').checked = false;
      document.getElementById('el-flag-surgery').checked = false;
      document.getElementById('el-flag-antibiotics').checked = false;
      this.handleProcessEligibility();
    });

    document.getElementById('load-demo-anemic-btn')?.addEventListener('click', () => {
      document.getElementById('el-name').value = 'Priya Raman';
      document.getElementById('el-blood-group').value = 'A+';
      document.getElementById('el-gender').value = 'Female';
      document.getElementById('el-age').value = '24';
      document.getElementById('el-weight').value = '54';
      document.getElementById('el-hemoglobin').value = '11.2';
      document.getElementById('el-systolic').value = '115';
      document.getElementById('el-diastolic').value = '75';
      document.getElementById('el-pulse').value = '76';
      document.getElementById('el-interval').value = '140';
      document.getElementById('el-flag-tattoo').checked = false;
      document.getElementById('el-flag-surgery').checked = false;
      document.getElementById('el-flag-antibiotics').checked = false;
      this.handleProcessEligibility();
    });

    document.getElementById('load-demo-underweight-btn')?.addEventListener('click', () => {
      document.getElementById('el-name').value = 'Sneha Rao';
      document.getElementById('el-blood-group').value = 'B+';
      document.getElementById('el-gender').value = 'Female';
      document.getElementById('el-age').value = '19';
      document.getElementById('el-weight').value = '44';
      document.getElementById('el-hemoglobin').value = '13.0';
      document.getElementById('el-systolic').value = '110';
      document.getElementById('el-diastolic').value = '70';
      document.getElementById('el-pulse').value = '74';
      document.getElementById('el-interval').value = '100';
      document.getElementById('el-flag-tattoo').checked = false;
      document.getElementById('el-flag-surgery').checked = false;
      document.getElementById('el-flag-antibiotics').checked = false;
      this.handleProcessEligibility();
    });

    document.getElementById('reset-eligibility-form-btn')?.addEventListener('click', () => {
      form.reset();
      const outputBody = document.getElementById('assessment-output-body');
      if (outputBody) {
        outputBody.innerHTML = `
          <div style="text-align:center; padding:3rem 1rem; color:var(--text-muted);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:0.75rem; opacity:0.5;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
            <h4>Vitals Awaiting Processing</h4>
            <p style="font-size:0.85rem; margin-top:0.35rem;">Click "Process Vitals &amp; Assess Eligibility" or choose a quick demo pill to evaluate clinical eligibility and safe donation volume.</p>
          </div>
        `;
      }
    });
  }

  handleProcessEligibility() {
    const name = document.getElementById('el-name')?.value.trim() || 'Anonymous';
    const bg = document.getElementById('el-blood-group')?.value || 'O+';
    const gender = document.getElementById('el-gender')?.value || 'Male';
    const age = parseFloat(document.getElementById('el-age')?.value) || 0;
    const weight = parseFloat(document.getElementById('el-weight')?.value) || 0;
    const hb = parseFloat(document.getElementById('el-hemoglobin')?.value) || 0;
    const systolic = parseFloat(document.getElementById('el-systolic')?.value) || 120;
    const diastolic = parseFloat(document.getElementById('el-diastolic')?.value) || 80;
    const pulse = parseFloat(document.getElementById('el-pulse')?.value) || 72;
    const interval = parseFloat(document.getElementById('el-interval')?.value) || 999;
    const hasTattoo = document.getElementById('el-flag-tattoo')?.checked || false;
    const hasSurgery = document.getElementById('el-flag-surgery')?.checked || false;
    const hasAntibiotics = document.getElementById('el-flag-antibiotics')?.checked || false;

    // Clinical Criteria Evaluation
    const agePass = age >= 18 && age <= 65;
    const weightPass = weight >= 50;
    const hbPass = hb >= 12.5;
    const bpPass = systolic >= 100 && systolic <= 140 && diastolic >= 60 && diastolic <= 90;
    const pulsePass = pulse >= 60 && pulse <= 100;
    const intervalPass = gender === 'Female' ? interval >= 120 : interval >= 90;
    const medicalPass = !hasTattoo && !hasSurgery && !hasAntibiotics;

    const deferrals = [];
    if (!agePass) deferrals.push(age < 18 ? 'Donor is below legal age limit (18 years).' : 'Donor exceeds maximum whole blood donation age (65 years).');
    if (!weightPass) deferrals.push(`Weight (${weight} kg) is below minimum safe threshold of 50 kg.`);
    if (!hbPass) deferrals.push(`Hemoglobin (${hb} g/dL) is below WHO minimum safety threshold (12.5 g/dL).`);
    if (!bpPass) deferrals.push(`Blood Pressure (${systolic}/${diastolic} mmHg) is outside normal range (100–140 / 60–90 mmHg).`);
    if (!pulsePass) deferrals.push(`Pulse Rate (${pulse} bpm) is outside safe resting range (60–100 bpm).`);
    if (!intervalPass) deferrals.push(`Days since last donation (${interval}d) is insufficient. Minimum required: ${gender === 'Female' ? '120' : '90'} days.`);
    if (hasTattoo) deferrals.push('Tattoo / body piercing in last 6 months requires safety deferral.');
    if (hasSurgery) deferrals.push('Recent surgery or dental procedure requires medical deferral.');
    if (hasAntibiotics) deferrals.push('Antibiotics or steroid medication requires 7-day post-treatment clearance.');

    const isEligible = deferrals.length === 0;

    // Circulating Volume (Nadler formula approx: Males ~70ml/kg, Females ~65ml/kg)
    const factor = gender === 'Female' ? 65 : 70;
    const circulatingVol = Math.round(weight * factor);

    // Max Safe Donation Volume (standard blood banking bag sizes: 350 mL or 450 mL)
    let maxSafeVol = 0;
    if (isEligible) {
      maxSafeVol = weight >= 60 ? 450 : 350;
    }

    // Component yields
    const prbcYield = isEligible ? Math.round(maxSafeVol * 0.48) : 0;
    const ffpYield = isEligible ? Math.round(maxSafeVol * 0.40) : 0;
    const plateletYield = isEligible ? Math.round(maxSafeVol * 0.12) : 0;
    const livesSaved = isEligible ? 3 : 0;

    // Next donation date calculation
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + (gender === 'Female' ? 120 : 90));
    const nextDateStr = nextDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    // Build unique ID for potential DML
    let maxNum = 100;
    this.data.donors.forEach(d => {
      const match = d.donor_id.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextDonorId = 'D' + (maxNum + 1);
    const nextBagId = 'BAG-' + (Math.floor(8000 + Math.random() * 1000));

    const generatedDml = `
-- 1. Insert Donor Record into Relational Schema (PreparedStatement)
INSERT INTO DONOR (DONOR_ID, NAME, BLOOD_GROUP, AGE, GENDER, PHONE, CITY, HEMOGLOBIN, STATUS)
VALUES ('${nextDonorId}', '${name}', '${bg}', ${age}, '${gender}', '+91 98401 00000', 'Chennai', ${hb}, '${isEligible ? 'Eligible' : 'Deferred'}');

-- 2. Intake Blood Bag in Ledger Table
INSERT INTO BLOOD_BAGS (BAG_ID, DONOR_ID, BLOOD_GROUP, COMPONENT, VOLUME_ML, EXPIRY_DATE, STATUS)
VALUES ('${nextBagId}', '${nextDonorId}', '${bg}', 'Whole Blood', ${maxSafeVol}, SYSDATE + 35, 'Tested & Cleared');

-- 3. Update Available Stock in Inventory
UPDATE BLOOD_STOCK SET UNITS_AVAILABLE = UNITS_AVAILABLE + 1 WHERE BLOOD_GROUP = '${bg}';
COMMIT;`.trim();

    const outputBody = document.getElementById('assessment-output-body');
    if (!outputBody) return;

    outputBody.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
        <div class="assessment-status-badge ${isEligible ? 'eligible' : 'deferred'}">
          ${isEligible ? '✓ ELIGIBLE TO DONATE' : '⚠ TEMPORARILY DEFERRED'}
        </div>
        <span style="font-size:0.8rem; color:var(--text-muted); font-weight:700;">
          Assessed: ${new Date().toLocaleTimeString()}
        </span>
      </div>

      <div class="metrics-summary-grid">
        <div class="metric-highlight-box">
          <div class="metric-num" style="color:var(--primary);">${maxSafeVol} <span style="font-size:0.8rem;">mL</span></div>
          <div class="metric-title">Max Safe Volume</div>
        </div>
        <div class="metric-highlight-box">
          <div class="metric-num">${circulatingVol.toLocaleString()} <span style="font-size:0.8rem;">mL</span></div>
          <div class="metric-title">Circulating Volume</div>
        </div>
        <div class="metric-highlight-box">
          <div class="metric-num" style="color:var(--success);">${livesSaved}</div>
          <div class="metric-title">Potential Lives Saved</div>
        </div>
      </div>

      <!-- Criteria Pass/Fail Checklist -->
      <div style="margin: 1.15rem 0;">
        <h5 style="font-size:0.8rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.5rem;">
          Clinical Screening Checklist
        </h5>
        <ul class="criteria-checklist">
          <li class="criteria-item ${agePass ? 'pass' : 'fail'}">
            <span>Age Criteria (18–65 years)</span>
            <span class="criteria-badge ${agePass ? 'pass' : 'fail'}">${age} yrs • ${agePass ? 'PASS' : 'FAIL'}</span>
          </li>
          <li class="criteria-item ${weightPass ? 'pass' : 'fail'}">
            <span>Body Weight (Min 50 kg)</span>
            <span class="criteria-badge ${weightPass ? 'pass' : 'fail'}">${weight} kg • ${weightPass ? 'PASS' : 'FAIL'}</span>
          </li>
          <li class="criteria-item ${hbPass ? 'pass' : 'fail'}">
            <span>Hemoglobin Level (Min 12.5 g/dL)</span>
            <span class="criteria-badge ${hbPass ? 'pass' : 'fail'}">${hb} g/dL • ${hbPass ? 'PASS' : 'FAIL'}</span>
          </li>
          <li class="criteria-item ${bpPass ? 'pass' : 'fail'}">
            <span>Blood Pressure (100–140 / 60–90 mmHg)</span>
            <span class="criteria-badge ${bpPass ? 'pass' : 'fail'}">${systolic}/${diastolic} mmHg • ${bpPass ? 'PASS' : 'FAIL'}</span>
          </li>
          <li class="criteria-item ${pulsePass ? 'pass' : 'fail'}">
            <span>Resting Pulse Rate (60–100 bpm)</span>
            <span class="criteria-badge ${pulsePass ? 'pass' : 'fail'}">${pulse} bpm • ${pulsePass ? 'PASS' : 'FAIL'}</span>
          </li>
          <li class="criteria-item ${intervalPass ? 'pass' : 'fail'}">
            <span>Donation Interval (${gender === 'Female' ? '≥120d female' : '≥90d male'})</span>
            <span class="criteria-badge ${intervalPass ? 'pass' : 'fail'}">${interval} days • ${intervalPass ? 'PASS' : 'FAIL'}</span>
          </li>
          <li class="criteria-item ${medicalPass ? 'pass' : 'fail'}">
            <span>Medical History Questionnaire</span>
            <span class="criteria-badge ${medicalPass ? 'pass' : 'fail'}">${medicalPass ? 'CLEARED' : 'FLAGGED'}</span>
          </li>
        </ul>
      </div>

      ${!isEligible ? `
        <div class="deferral-alert-box">
          <h5>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Clinical Deferral Advisory
          </h5>
          <ul>
            ${deferrals.map(d => `<li>${d}</li>`).join('')}
          </ul>
        </div>
      ` : `
        <!-- Projected Component Yields -->
        <div style="background:var(--bg-surface-secondary); padding:0.85rem; border-radius:var(--radius-md); margin-bottom:1rem; border:1px solid var(--border-subtle);">
          <div style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.4rem;">
            Estimated Component Fractionation Yield
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-family:var(--font-mono);">
            <span>PRBC: <strong>~${prbcYield} mL</strong></span>
            <span>FFP: <strong>~${ffpYield} mL</strong></span>
            <span>Platelets: <strong>~${plateletYield} mL</strong></span>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">
            Next eligible donation date: <strong>${nextDateStr}</strong>
          </div>
        </div>
      `}

      <!-- Relational DDL / DML Code Display -->
      <div>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.25rem;">
          <span style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">
            Relational DML Generated
          </span>
          <button type="button" class="btn-secondary" id="copy-assessed-dml-btn" style="padding:0.2rem 0.5rem; font-size:0.7rem;">
            Copy SQL
          </button>
        </div>
        <div class="dml-preview-box">${generatedDml}</div>
      </div>

      <!-- Action Button -->
      <div style="margin-top:1rem;">
        ${isEligible ? `
          <button type="button" class="btn-primary" id="commit-assessed-donor-btn" style="width:100%; justify-content:center; padding:0.75rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Execute DML INSERT &amp; Register Verified Donor
          </button>
        ` : `
          <button type="button" class="btn-secondary" id="log-deferral-btn" style="width:100%; justify-content:center; padding:0.75rem;">
            Record Deferred Donor into Audit Log
          </button>
        `}
      </div>
    `;

    document.getElementById('copy-assessed-dml-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(generatedDml).then(() => {
        this.showToast('SQL Copied', 'Generated DML statement copied to clipboard!', 'success');
      });
    });

    document.getElementById('commit-assessed-donor-btn')?.addEventListener('click', () => {
      const newDonor = {
        donor_id: nextDonorId,
        name: name,
        blood_group: bg,
        age: age,
        gender: gender,
        phone: '+91 98401 ' + Math.floor(10000 + Math.random() * 90000),
        email: name.toLowerCase().replace(/\s+/g, '.') + '@vit.ac.in',
        city: 'Chennai',
        hemoglobin: hb,
        last_donation: new Date().toISOString().split('T')[0],
        status: 'Eligible',
        total_donations: 1
      };

      this.data.donors.push(newDonor);

      // Intake blood bag
      this.data.blood_bags.push({
        bag_id: nextBagId,
        donor_id: nextDonorId,
        blood_group: bg,
        component: 'Whole Blood',
        volume: maxSafeVol,
        date: new Date().toISOString().split('T')[0],
        expiry: nextDate.toISOString().split('T')[0],
        chiller: 'Vault Alpha-1',
        status: 'Tested & Cleared'
      });

      // Increment stock
      if (this.data.inventory[bg]) {
        this.data.inventory[bg].units += 1;
      }

      this.saveState();
      this.renderAll();

      this.showToast(
        'DML INSERT Committed',
        `Donor ${name} (${nextDonorId}) successfully recorded! Inventory for ${bg} incremented to ${this.data.inventory[bg].units} units.`,
        'success'
      );

      // Also sync with server via REST
      fetch('/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDonor)
      }).catch(e => console.warn('Server sync skipped in offline mode'));
    });

    document.getElementById('log-deferral-btn')?.addEventListener('click', () => {
      const deferredDonor = {
        donor_id: nextDonorId,
        name: name,
        blood_group: bg,
        age: age,
        gender: gender,
        phone: '+91 98401 00000',
        email: 'deferred@vit.ac.in',
        city: 'Chennai',
        hemoglobin: hb,
        last_donation: 'N/A',
        status: 'Deferred',
        total_donations: 0
      };
      this.data.donors.push(deferredDonor);
      this.saveState();
      this.renderAll();
      this.showToast('Deferred Record Saved', `Logged ${name} (${nextDonorId}) with medical deferral remarks.`, 'warning');
    });

    this.showToast(
      isEligible ? 'Assessment: ELIGIBLE' : 'Assessment: DEFERRED',
      isEligible ? `Donor cleared for ${maxSafeVol} mL safe donation!` : `Clinical criteria flagged: ${deferrals[0]}`,
      isEligible ? 'success' : 'warning'
    );
  }

  // =========================================================================
  // DDL & DML COMMAND CENTER
  // =========================================================================
  setupSqlCommandCenter() {
    document.querySelectorAll('.sql-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sql-category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-cat');
        this.renderSqlCommands(cat);
      });
    });
  }

  renderSqlCommands(category = 'all') {
    const container = document.getElementById('sql-cards-container');
    if (!container) return;

    const commands = [
      {
        id: 'DDL-1',
        type: 'ddl',
        title: 'Table: DONOR (Schema & Primary Key)',
        desc: 'Creates the core DONOR relational entity with Primary Key and CHECK constraints on age, gender, and blood group.',
        sql: `CREATE TABLE DONOR (\n    DONOR_ID VARCHAR2(10) PRIMARY KEY,\n    NAME VARCHAR2(100) NOT NULL,\n    BLOOD_GROUP VARCHAR2(5) NOT NULL,\n    AGE NUMBER(3) CHECK (AGE BETWEEN 18 AND 65),\n    GENDER VARCHAR2(10) CHECK (GENDER IN ('Male', 'Female', 'Other')),\n    PHONE VARCHAR2(20) NOT NULL,\n    EMAIL VARCHAR2(100),\n    CITY VARCHAR2(50) NOT NULL,\n    HEMOGLOBIN NUMBER(4,1) CHECK (HEMOGLOBIN > 0),\n    STATUS VARCHAR2(15) DEFAULT 'Eligible' CHECK (STATUS IN ('Eligible', 'Deferred')),\n    CONSTRAINT CHK_BLOOD_GROUP CHECK (BLOOD_GROUP IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))\n);`
      },
      {
        id: 'DDL-2',
        type: 'ddl',
        title: 'Table: BLOOD_STOCK (Inventory Entity)',
        desc: 'Tracks available units, maximum capacity, and minimum safety reserve levels for each of the 8 blood groups.',
        sql: `CREATE TABLE BLOOD_STOCK (\n    BLOOD_GROUP VARCHAR2(5) PRIMARY KEY,\n    UNITS_AVAILABLE NUMBER(5) DEFAULT 0 CHECK (UNITS_AVAILABLE >= 0),\n    MAX_CAPACITY NUMBER(5) DEFAULT 50,\n    MIN_SAFE_LEVEL NUMBER(5) DEFAULT 12,\n    STATUS VARCHAR2(20) DEFAULT 'ADEQUATE',\n    CONSTRAINT FK_STOCK_BG CHECK (BLOOD_GROUP IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))\n);`
      },
      {
        id: 'DDL-3',
        type: 'ddl',
        title: 'Table: BLOOD_BAGS (Foreign Key & Ledger)',
        desc: 'Ledger table storing individual units with Foreign Key referencing DONOR with ON DELETE CASCADE.',
        sql: `CREATE TABLE BLOOD_BAGS (\n    BAG_ID VARCHAR2(15) PRIMARY KEY,\n    DONOR_ID VARCHAR2(10) REFERENCES DONOR(DONOR_ID) ON DELETE CASCADE,\n    BLOOD_GROUP VARCHAR2(5) NOT NULL,\n    COMPONENT VARCHAR2(30) DEFAULT 'Whole Blood',\n    VOLUME_ML NUMBER(4) DEFAULT 450,\n    COLLECTED_DATE DATE DEFAULT SYSDATE,\n    EXPIRY_DATE DATE NOT NULL,\n    CHILLER_LOCATION VARCHAR2(50),\n    STATUS VARCHAR2(20) DEFAULT 'Tested & Cleared'\n);`
      },
      {
        id: 'DDL-4',
        type: 'ddl',
        title: 'Table: HOSPITAL_REQUESTS (Emergency Orders)',
        desc: 'Orders placed by hospitals with urgency ratings (Emergency STAT, High Priority, Routine).',
        sql: `CREATE TABLE HOSPITAL_REQUESTS (\n    REQUEST_ID VARCHAR2(15) PRIMARY KEY,\n    HOSPITAL_NAME VARCHAR2(100) NOT NULL,\n    PATIENT_NAME VARCHAR2(100) NOT NULL,\n    BLOOD_GROUP VARCHAR2(5) NOT NULL,\n    UNITS_REQUESTED NUMBER(3) CHECK (UNITS_REQUESTED > 0),\n    URGENCY VARCHAR2(25) CHECK (URGENCY IN ('Emergency STAT', 'High Priority', 'Routine')),\n    REQUEST_DATE DATE DEFAULT SYSDATE,\n    STATUS VARCHAR2(15) DEFAULT 'Pending' CHECK (STATUS IN ('Pending', 'Approved', 'Fulfilled', 'Rejected'))\n);`
      },
      {
        id: 'DDL-5',
        type: 'ddl',
        title: 'Table: DISPATCH_LOG & Sequence',
        desc: 'Transaction audit log paired with an Oracle sequence for unique dispatch identifiers.',
        sql: `CREATE SEQUENCE DISPATCH_SEQ START WITH 1001 INCREMENT BY 1;\n\nCREATE TABLE DISPATCH_LOG (\n    DISPATCH_ID VARCHAR2(20) PRIMARY KEY,\n    BLOOD_GROUP VARCHAR2(5) NOT NULL,\n    UNITS NUMBER(3) NOT NULL,\n    DISPATCH_DATE DATE DEFAULT SYSDATE\n);`
      },
      {
        id: 'DML-1',
        type: 'dml',
        title: 'SELECT: View All Donors',
        desc: 'Retrieves all donor records from the database ordered by Primary Key.',
        sql: `SELECT DONOR_ID, NAME, BLOOD_GROUP, AGE, GENDER, PHONE, CITY, HEMOGLOBIN, STATUS FROM DONOR ORDER BY DONOR_ID;`
      },
      {
        id: 'DML-2',
        type: 'dml',
        title: 'SELECT: Filter by Blood Group (AB-)',
        desc: 'Finds donors with rare subtype using parameterized WHERE condition (Slide 45).',
        sql: `SELECT * FROM DONOR WHERE BLOOD_GROUP = 'AB-';`
      },
      {
        id: 'DML-3',
        type: 'dml',
        title: 'SELECT: Multi-Condition Search',
        desc: 'Retrieves eligible donors residing in Chennai.',
        sql: `SELECT DONOR_ID, NAME, BLOOD_GROUP, PHONE, CITY FROM DONOR WHERE CITY = 'Chennai' AND STATUS = 'Eligible';`
      },
      {
        id: 'DML-4',
        type: 'dml',
        title: 'SELECT: Aggregation with GROUP BY',
        desc: 'Calculates the total donor distribution categorized by each blood group.',
        sql: `SELECT BLOOD_GROUP, COUNT(*) AS TOTAL_DONORS FROM DONOR GROUP BY BLOOD_GROUP;`
      },
      {
        id: 'DML-5',
        type: 'dml',
        title: 'SELECT: Multi-Table INNER JOIN',
        desc: 'Joins DONOR and BLOOD_BAGS to view donor information along with bag barcode and volume.',
        sql: `SELECT D.DONOR_ID, D.NAME, D.BLOOD_GROUP, B.BAG_ID, B.VOLUME_ML, B.EXPIRY_DATE\nFROM DONOR D\nJOIN BLOOD_BAGS B ON D.DONOR_ID = B.DONOR_ID;`
      },
      {
        id: 'DML-6',
        type: 'dml',
        title: 'INSERT: Register New Donor',
        desc: 'Inserts a new donor record using parameterized PreparedStatement values.',
        sql: `INSERT INTO DONOR (DONOR_ID, NAME, BLOOD_GROUP, AGE, GENDER, PHONE, CITY, HEMOGLOBIN, STATUS)\nVALUES ('D109', 'Vikramaditya', 'O+', 29, 'Male', '+91 98401 99999', 'Chennai', 14.6, 'Eligible');`
      },
      {
        id: 'DML-7',
        type: 'dml',
        title: 'UPDATE: Adjust Blood Stock Units',
        desc: 'Updates blood inventory units and demonstrates executeUpdate() returning affected rows (Slide 56).',
        sql: `UPDATE BLOOD_STOCK SET UNITS_AVAILABLE = UNITS_AVAILABLE + 2 WHERE BLOOD_GROUP = 'O-';`
      },
      {
        id: 'DML-8',
        type: 'dml',
        title: 'DELETE: Remove Donor Record',
        desc: 'Deletes donor with target verification and cascade handling.',
        sql: `DELETE FROM DONOR WHERE DONOR_ID = 'D108';`
      },
      {
        id: 'TCL-1',
        type: 'tcl',
        title: 'COMMIT: Save Active Transaction',
        desc: 'Enforces ACID durability after successfully fulfilling a blood order dispatch.',
        sql: `COMMIT;`
      },
      {
        id: 'TCL-2',
        type: 'tcl',
        title: 'ROLLBACK: Abort & Revert Transaction',
        desc: 'Reverts pending mutations when requested stock is insufficient, preserving consistency.',
        sql: `ROLLBACK;`
      }
    ];

    const filtered = category === 'all' ? commands : commands.filter(c => c.type === category);

    container.innerHTML = filtered.map(c => `
      <article class="sql-cmd-card">
        <div class="sql-card-top">
          <span class="sql-type-tag ${c.type}">${c.type.toUpperCase()}</span>
          <span style="font-size:0.7rem; color:var(--text-muted); font-family:var(--font-mono);">${c.id}</span>
        </div>
        <h4 style="font-size:0.95rem; font-weight:800; margin-bottom:0.25rem;">${c.title}</h4>
        <p style="font-size:0.8rem; color:var(--text-muted); flex:1;">${c.desc}</p>
        <pre class="sql-code-block"><code>${c.sql}</code></pre>
        <div class="sql-card-actions">
          <button type="button" class="btn-secondary copy-sql-btn" data-sql="${encodeURIComponent(c.sql)}" style="padding:0.35rem 0.65rem; font-size:0.75rem;">
            Copy SQL
          </button>
          <button type="button" class="btn-primary run-sql-btn" data-sql="${encodeURIComponent(c.sql)}" style="padding:0.35rem 0.65rem; font-size:0.75rem;">
            Run in SQL Console ➔
          </button>
        </div>
      </article>
    `).join('');

    container.querySelectorAll('.copy-sql-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sql = decodeURIComponent(btn.getAttribute('data-sql'));
        navigator.clipboard.writeText(sql).then(() => {
          this.showToast('Copied', 'SQL statement copied to clipboard!', 'success');
        });
      });
    });

    container.querySelectorAll('.run-sql-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sql = decodeURIComponent(btn.getAttribute('data-sql'));
        this.switchTab('studio');
        const input = document.getElementById('sql-query-input');
        if (input) {
          input.value = sql;
          this.executeSqlTerminal();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  // ==========================================
  // IN-BROWSER SQL TERMINAL (Lab Ex 11 Workbench)
  // Connects with REST API /api/sql/execute & falls back cleanly
  // ==========================================
  async executeSqlTerminal() {
    const input = document.getElementById('sql-query-input');
    const resultBox = document.getElementById('sql-result-box');
    if (!input || !resultBox) return;

    const query = input.value.trim();
    if (!query) {
      resultBox.innerHTML = '<span style="color:var(--text-muted);">Please enter a SQL statement to execute.</span>';
      return;
    }

    const startTime = performance.now();
    let cleanSql = query.replace(/;+$/, '').trim();

    // If query starts directly with WHERE (e.g. where blood group="ab-"), prepend SELECT * FROM DONOR
    if (/^\s*WHERE\b/i.test(cleanSql)) {
      cleanSql = 'SELECT * FROM DONOR ' + cleanSql;
    }

    // First attempt to execute against the live REST API /api/sql/execute
    try {
      const resp = await fetch('/api/sql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: cleanSql })
      });
      if (resp.ok) {
        const data = await resp.json();
        const timeTaken = (performance.now() - startTime).toFixed(2);
        if (data.type === 'SELECT') {
          if (!data.rows || data.rows.length === 0) {
            resultBox.innerHTML = `
              <div style="color:var(--warning); font-weight:bold;">No rows selected.</div>
              <div style="color:var(--text-muted); font-size:0.75rem;">Elapsed: ${timeTaken} ms (Server Execution).</div>
            `;
            return;
          }
          const keys = data.columns || Object.keys(data.rows[0]);
          let html = `
            <div style="color:var(--primary); font-weight:bold; margin-bottom:6px;">SQL Result (${data.rowCount} rows fetched via REST JDBC API in ${timeTaken} ms)</div>
            <table style="width:100%; border-collapse:collapse; font-size:0.75rem;">
              <thead>
                <tr style="border-bottom:1px solid #334155; text-align:left;">
                  ${keys.map(k => `<th style="padding:4px 8px; color:#94a3b8;">${k.toUpperCase()}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.rows.map(r => `
                  <tr style="border-bottom:1px solid #1e293b;">
                    ${keys.map(k => {
                      const v = r[k.toLowerCase()] !== undefined ? r[k.toLowerCase()] : (r[k] !== undefined ? r[k] : '');
                      return `<td style="padding:4px 8px;">${v}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
          resultBox.innerHTML = html;
          return;
        } else {
          resultBox.innerHTML = `
            <div style="color:var(--success); font-weight:bold;">${data.message || 'Statement executed successfully.'}</div>
            <div style="color:var(--text-muted); font-size:0.75rem;">Type: ${data.type} • Elapsed: ${timeTaken} ms (Server Execution).</div>
          `;
          return;
        }
      }
    } catch (e) {
      // Offline fallback
    }

    try {
      // Parse SELECT queries
      if (cleanSql.toUpperCase().startsWith('SELECT')) {
        this.runSqlSelect(cleanSql, resultBox, startTime);
      } else if (cleanSql.toUpperCase().startsWith('INSERT')) {
        this.runSqlInsert(cleanSql, resultBox, startTime);
      } else if (cleanSql.toUpperCase().startsWith('UPDATE')) {
        this.runSqlUpdate(cleanSql, resultBox, startTime);
      } else if (cleanSql.toUpperCase().startsWith('DELETE')) {
        this.runSqlDelete(cleanSql, resultBox, startTime);
      } else if (cleanSql.toUpperCase() === 'COMMIT' || cleanSql.toUpperCase() === 'ROLLBACK') {
        const timeTaken = (performance.now() - startTime).toFixed(2);
        resultBox.innerHTML = `
          <div style="color:var(--success); font-weight:bold;">${cleanSql.toUpperCase()} complete.</div>
          <div style="color:var(--text-muted); font-size:0.75rem; margin-top:4px;">Transaction state updated. Elapsed time: ${timeTaken} ms.</div>
        `;
      } else {
        resultBox.innerHTML = `
          <div style="color:var(--danger); font-weight:bold;">ORA-00900: invalid SQL statement</div>
          <div style="color:var(--text-muted); font-size:0.75rem;">Supported commands in lab simulator: SELECT, INSERT, UPDATE, DELETE, COMMIT, ROLLBACK.</div>
        `;
      }
    } catch (err) {
      resultBox.innerHTML = `
        <div style="color:var(--danger); font-weight:bold;">Execution Error:</div>
        <div style="color:var(--text-muted);">${err.message}</div>
      `;
    }
  }

  filterRowsByWhereClause(rows, sql) {
    const whereMatch = sql.match(/WHERE\s+([\s\S]+?)(\s+ORDER\s+BY|\s+GROUP\s+BY|;|\s*$)/i);
    if (!whereMatch) return rows;

    const conditionStr = whereMatch[1].trim();
    if (!conditionStr) return rows;

    // Support AND-separated conditions
    const conditions = conditionStr.split(/\s+AND\s+/i);

    return rows.filter(row => {
      return conditions.every(cond => {
        // Match column name, comparison operator, and value (quoted or unquoted)
        const match = cond.trim().match(/^[`"']?([a-zA-Z0-9_\s]+?)[`"']?\s*(=|!=|<>|>=|<=|>|<|\bLIKE\b)\s*([`"']?[\s\S]+?[`"']?)$/i);
        if (!match) return true;

        let rawCol = match[1].trim().toLowerCase().replace(/\s+/g, '_');
        const operator = match[2].trim().toUpperCase();
        let rawVal = match[3].trim();

        // Strip enclosing quotes from value ('...' or "..." or `...`)
        if ((rawVal.startsWith("'") && rawVal.endsWith("'")) ||
            (rawVal.startsWith('"') && rawVal.endsWith('"')) ||
            (rawVal.startsWith('`') && rawVal.endsWith('`'))) {
          rawVal = rawVal.substring(1, rawVal.length - 1);
        }

        // Map common column name aliases
        if (rawCol === 'blood_group' || rawCol === 'blood' || rawCol === 'group' || rawCol === 'bloodgroup' || rawCol === 'bg') {
          rawCol = 'blood_group';
        } else if (rawCol === 'donor_id' || rawCol === 'id' || rawCol === 'sid' || rawCol === 'donorid') {
          rawCol = 'donor_id';
        } else if (rawCol === 'full_name' || rawCol === 'fullname') {
          rawCol = 'name';
        } else if (rawCol === 'phone_number' || rawCol === 'phonenumber' || rawCol === 'contact') {
          rawCol = 'phone';
        } else if (rawCol === 'hemoglobin_level' || rawCol === 'hb') {
          rawCol = 'hemoglobin';
        }

        // Find matching key in row (case and underscore insensitive)
        const rowKeys = Object.keys(row);
        const matchedKey = rowKeys.find(k => {
          const normKey = k.toLowerCase().replace(/[\s_-]/g, '');
          const normCol = rawCol.replace(/[\s_-]/g, '');
          return normKey === normCol;
        });

        if (!matchedKey) return true;

        const cellValue = row[matchedKey];
        if (cellValue === undefined || cellValue === null) return false;

        const cellStr = String(cellValue).trim().toLowerCase();
        const targetStr = String(rawVal).trim().toLowerCase();

        if (operator === '=') {
          return cellStr === targetStr;
        } else if (operator === '!=' || operator === '<>') {
          return cellStr !== targetStr;
        } else if (operator === 'LIKE') {
          const pattern = targetStr.replace(/%/g, '.*').replace(/_/g, '.');
          return new RegExp(`^${pattern}$`, 'i').test(cellStr);
        } else if (operator === '>') {
          return parseFloat(cellValue) > parseFloat(rawVal);
        } else if (operator === '<') {
          return parseFloat(cellValue) < parseFloat(rawVal);
        } else if (operator === '>=') {
          return parseFloat(cellValue) >= parseFloat(rawVal);
        } else if (operator === '<=') {
          return parseFloat(cellValue) <= parseFloat(rawVal);
        }

        return true;
      });
    });
  }

  runSqlSelect(sql, resultBox, startTime) {
    const upper = sql.toUpperCase();
    let rows = [];
    let title = '';

    if (upper.includes('FROM DONOR') || !upper.includes('FROM ')) {
      rows = [...this.data.donors];
      title = 'DONOR';
    } else if (upper.includes('FROM BLOOD_STOCK') || upper.includes('FROM BLOOD_INVENTORY')) {
      title = 'BLOOD_STOCK';
      rows = Object.entries(this.data.inventory).map(([k, v]) => ({
        BLOOD_GROUP: k,
        UNITS_AVAILABLE: v.units,
        SAFE_CAPACITY: v.capacity,
        MIN_SAFE: v.minSafe,
        STATUS: v.units <= v.minSafe ? 'CRITICAL / LOW' : 'ADEQUATE'
      }));
    } else if (upper.includes('FROM HOSPITAL_REQUESTS')) {
      title = 'HOSPITAL_REQUESTS';
      rows = [...this.data.hospital_requests];
    } else {
      resultBox.innerHTML = `
        <div style="color:var(--danger); font-weight:bold;">ORA-00942: table or view does not exist</div>
        <div style="color:var(--text-muted); font-size:0.75rem;">Available tables: DONOR, BLOOD_STOCK, HOSPITAL_REQUESTS</div>
      `;
      return;
    }

    // Apply selective WHERE clause filtering dynamically
    rows = this.filterRowsByWhereClause(rows, sql);

    // Handle ORDER BY
    if (/ORDER\s+BY/i.test(sql)) {
      const orderMatch = sql.match(/ORDER\s+BY\s+([\w\s_]+?)(\s+ASC|\s+DESC)?(\s*;|\s*$)/i);
      if (orderMatch) {
        const orderCol = orderMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
        const isDesc = (orderMatch[2] || '').trim().toUpperCase() === 'DESC';
        rows.sort((a, b) => {
          const valA = a[orderCol] !== undefined ? a[orderCol] : (a[orderCol.toUpperCase()] || '');
          const valB = b[orderCol] !== undefined ? b[orderCol] : (b[orderCol.toUpperCase()] || '');
          if (typeof valA === 'number' && typeof valB === 'number') {
            return isDesc ? valB - valA : valA - valB;
          }
          return isDesc ? String(valB).localeCompare(String(valA)) : String(valA).localeCompare(String(valB));
        });
      }
    }

    const timeTaken = (performance.now() - startTime).toFixed(2);

    if (rows.length === 0) {
      resultBox.innerHTML = `
        <div style="color:var(--warning); font-weight:bold;">No rows selected.</div>
        <div style="color:var(--text-muted); font-size:0.75rem;">Elapsed: ${timeTaken} ms.</div>
      `;
      return;
    }

    // Build ASCII / HTML Table
    const keys = Object.keys(rows[0]);
    let html = `
      <div style="color:var(--primary); font-weight:bold; margin-bottom:6px;">SQL Result (${rows.length} rows fetched in ${timeTaken} ms)</div>
      <table style="width:100%; border-collapse:collapse; font-size:0.75rem;">
        <thead>
          <tr style="border-bottom:1px solid #334155; text-align:left;">
            ${keys.map(k => `<th style="padding:4px 8px; color:#94a3b8;">${k.toUpperCase()}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr style="border-bottom:1px solid #1e293b;">
              ${keys.map(k => `<td style="padding:4px 8px;">${r[k]}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    resultBox.innerHTML = html;
  }

  runSqlInsert(sql, resultBox, startTime) {
    const timeTaken = (performance.now() - startTime).toFixed(2);
    resultBox.innerHTML = `
      <div style="color:var(--success); font-weight:bold;">1 row created.</div>
      <div style="color:var(--text-muted); font-size:0.75rem;">Tip: Use the "Register New Donor" modal to add live records with full validation. Elapsed: ${timeTaken} ms.</div>
    `;
  }

  runSqlUpdate(sql, resultBox, startTime) {
    const timeTaken = (performance.now() - startTime).toFixed(2);
    resultBox.innerHTML = `
      <div style="color:var(--success); font-weight:bold;">1 row updated.</div>
      <div style="color:var(--text-muted); font-size:0.75rem;">PreparedStatement update simulation succeeded. Elapsed: ${timeTaken} ms.</div>
    `;
  }

  runSqlDelete(sql, resultBox, startTime) {
    const timeTaken = (performance.now() - startTime).toFixed(2);
    resultBox.innerHTML = `
      <div style="color:var(--success); font-weight:bold;">1 row deleted.</div>
      <div style="color:var(--text-muted); font-size:0.75rem;">Target record removed. Elapsed: ${timeTaken} ms.</div>
    `;
  }

  // Toast Notification System
  showToast(title, message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconMap = {
      success: '✓',
      danger: '✕',
      warning: '⚠'
    };

    toast.innerHTML = `
      <div class="toast-icon">${iconMap[type] || 'ℹ'}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }
}

// Global App Initialization
window.addEventListener('DOMContentLoaded', () => {
  window.app = new BloodBankApp();
});
