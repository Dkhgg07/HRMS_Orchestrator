// Sidebar Component
class SidebarComponent {
  constructor(options = {}) {
    this.options = {
      containerId: 'sidebar',
      menuBtnId: 'menuBtn', 
      closeBtnId: 'closeBtn',
      title: 'Dashboard',
      menuItems: [],
      showUserInfo: true,
      showLogout: true,
      ...options
    };
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const sidebarContainer = document.getElementById(this.options.containerId);
    if (sidebarContainer) {
      sidebarContainer.innerHTML = this.getSidebarHTML();
    }

    // Add CSS if not already present
    if (!document.getElementById('sidebar-styles')) {
      const style = document.createElement('style');
      style.id = 'sidebar-styles';
      style.textContent = SidebarComponent.getStyles();
      document.head.appendChild(style);
    }

    this.updateUserInfo();
  }

  getSidebarHTML() {
    const user = Auth?.getUser();
    
    return `
      <button class="close-btn" id="${this.options.closeBtnId}">
        <i class="fa fa-times"></i>
      </button>
      <h2>${this.options.title}</h2>
      
      ${this.options.showUserInfo ? this.getUserInfoHTML(user) : ''}
      
      <nav class="sidebar-nav">
        ${this.getMenuItemsHTML()}
      </nav>
      
      ${this.options.showLogout ? this.getLogoutHTML() : ''}
    `;
  }

  getUserInfoHTML(user) {
    if (!user) return '';
    
    return `
      <div class="user-info">
        <div class="user-avatar">
          ${user.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div class="user-details">
          <strong>${user.name || 'User'}</strong>
          <small>${user.role || 'Employee'} - ${user.workInfo?.department || 'No Department'}</small>
        </div>
      </div>
    `;
  }

  getMenuItemsHTML() {
    return this.options.menuItems.map(item => {
      if (item.type === 'separator') {
        return '<div class="sidebar-separator"></div>';
      }
      
      const isActive = window.location.pathname.includes(item.href);
      const icon = item.icon ? `<i class="${item.icon}"></i>` : '';
      
      return `
        <a href="${item.href}" class="sidebar-item ${isActive ? 'active' : ''}" ${item.onclick ? `onclick="${item.onclick}"` : ''}>
          ${icon}
          <span>${item.label}</span>
        </a>
      `;
    }).join('');
  }

  getLogoutHTML() {
    return `
      <button class="sidebar-logout" onclick="Auth.logout()">
        <i class="fa fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    `;
  }

  updateUserInfo() {
    const user = Auth?.getUser();
    if (user && this.options.showUserInfo) {
      const userInfo = document.querySelector('.user-info');
      if (userInfo) {
        userInfo.innerHTML = this.getUserInfoHTML(user).replace('<div class="user-info">', '').replace('</div>', '');
      }
    }
  }

  bindEvents() {
    const menuBtn = document.getElementById(this.options.menuBtnId);
    const closeBtn = document.getElementById(this.options.closeBtnId);
    const sidebar = document.getElementById(this.options.containerId);

    if (menuBtn && sidebar) {
      menuBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
      });
    }

    if (closeBtn && sidebar) {
      closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
      });
    }

    // Close sidebar on outside click
    document.addEventListener('click', (e) => {
      if (sidebar && sidebar.classList.contains('active')) {
        if (!sidebar.contains(e.target) && !menuBtn?.contains(e.target)) {
          sidebar.classList.remove('active');
        }
      }
    });
  }

  // Static method to get CSS styles
  static getStyles() {
    return `
      .sidebar {
        position: fixed;
        left: -100%;
        top: 0;
        width: 280px;
        height: 100vh;
        background: linear-gradient(135deg, #0F4C3A, #1a5f47);
        color: white;
        padding: 2rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        transition: left 0.3s ease;
        z-index: 1000;
        overflow-y: auto;
        box-shadow: 4px 0 15px rgba(0,0,0,0.1);
      }

      .sidebar.active {
        left: 0;
      }

      .sidebar h2 {
        margin: 0 0 1rem 0;
        text-align: center;
        font-size: 1.5rem;
        border-bottom: 1px solid rgba(255,255,255,0.2);
        padding-bottom: 1rem;
      }

      .close-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 4px;
        transition: background-color 0.3s ease;
      }

      .close-btn:hover {
        background-color: rgba(255,255,255,0.1);
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        margin-bottom: 1rem;
      }

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.2rem;
      }

      .user-details {
        flex: 1;
      }

      .user-details strong {
        display: block;
        margin-bottom: 0.25rem;
      }

      .user-details small {
        color: rgba(255,255,255,0.8);
        font-size: 0.85rem;
      }

      .sidebar-nav {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .sidebar-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        transition: all 0.3s ease;
        position: relative;
      }

      .sidebar-item:hover {
        background-color: rgba(255,255,255,0.1);
        transform: translateX(4px);
      }

      .sidebar-item.active {
        background-color: rgba(136,212,152,0.3);
        border-left: 3px solid #88d498;
      }

      .sidebar-item i {
        width: 20px;
        text-align: center;
        font-size: 1rem;
      }

      .sidebar-separator {
        height: 1px;
        background: rgba(255,255,255,0.2);
        margin: 0.5rem 0;
      }

      .sidebar-logout {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background: #d32f2f;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        margin-top: auto;
        transition: all 0.3s ease;
      }

      .sidebar-logout:hover {
        background: #b71c1c;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(211,47,47,0.3);
      }

      .sidebar-logout i {
        width: 20px;
        text-align: center;
      }

      .menu-btn {
        position: fixed;
        top: 1rem;
        left: 1rem;
        background: var(--primary-color, #0F4C3A);
        color: white;
        border: none;
        padding: 0.75rem;
        border-radius: 6px;
        cursor: pointer;
        z-index: 999;
        font-size: 1.2rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
      }

      .menu-btn:hover {
        background: #1a5f47;
        transform: scale(1.05);
      }

      @media (min-width: 1024px) {
        .sidebar {
          position: relative;
          left: 0;
          width: 250px;
          height: 100vh;
        }

        .menu-btn {
          display: none;
        }

        .close-btn {
          display: none;
        }
      }

      @media (max-width: 768px) {
        .sidebar {
          width: 100%;
          max-width: 300px;
        }
      }
    `;
  }
}

// Export for use
window.SidebarComponent = SidebarComponent;