// Navigation Component
class NavigationComponent {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.renderNavigation();
      this.bindEvents();
    });
  }

  renderNavigation() {
    const nav = this.createNavigationElement();
    const existingNav = document.querySelector('nav');
    
    if (existingNav) {
      existingNav.replaceWith(nav);
    } else {
      document.body.insertBefore(nav, document.body.firstChild);
    }
  }

  createNavigationElement() {
    const nav = document.createElement('nav');
    nav.className = 'hrms-navigation';
    nav.innerHTML = this.getNavigationHTML();
    return nav;
  }

  getNavigationHTML() {
    const user = Auth?.getUser();
    const isAuthenticated = Auth?.isAuthenticated();

    return `
      <div class="nav-container">
        <div class="nav-brand">
          <a href="home page.html">HRMS</a>
        </div>
        <div class="nav-menu" id="navMenu">
          ${this.getNavigationItems(user, isAuthenticated)}
        </div>
        <div class="nav-toggle" id="navToggle">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
  }

  getNavigationItems(user, isAuthenticated) {
    if (!isAuthenticated) {
      return `
        <a href="home page.html" class="nav-item">Home</a>
        <a href="login.html" class="nav-item nav-login">Login</a>
      `;
    }

    const baseItems = `
      <a href="dashboard.html" class="nav-item">Dashboard</a>
      <a href="project_analysis_member.html" class="nav-item">Projects</a>
    `;

    const managerItems = user?.role === 'manager' ? `
      <a href="project_analysis_leader.html" class="nav-item">Team Management</a>
    ` : '';

    const userInfo = `
      <div class="nav-user">
        <span class="nav-username">${user?.name || 'User'}</span>
        <div class="nav-dropdown">
          <span class="nav-role">${user?.role || 'Employee'}</span>
          <button onclick="Auth.logout()" class="nav-logout">Logout</button>
        </div>
      </div>
    `;

    return baseItems + managerItems + userInfo;
  }

  bindEvents() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
      });
    }
  }

  // CSS Styles for the navigation
  static getStyles() {
    return `
      .hrms-navigation {
        background: var(--primary-color, #0F4C3A);
        color: white;
        padding: 1rem 0;
        position: sticky;
        top: 0;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }

      .nav-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .nav-brand a {
        font-size: 1.5rem;
        font-weight: bold;
        color: white;
        text-decoration: none;
      }

      .nav-menu {
        display: flex;
        align-items: center;
        gap: 2rem;
      }

      .nav-item {
        color: white;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        transition: background-color 0.3s ease;
      }

      .nav-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .nav-login {
        background-color: var(--accent-color, #88d498);
        color: var(--primary-color, #0F4C3A);
        font-weight: bold;
      }

      .nav-user {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .nav-username {
        font-weight: bold;
      }

      .nav-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        color: var(--primary-color, #0F4C3A);
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 1rem;
        min-width: 150px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
      }

      .nav-user:hover .nav-dropdown {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .nav-role {
        display: block;
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 0.5rem;
      }

      .nav-logout {
        background: #d32f2f;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        width: 100%;
      }

      .nav-logout:hover {
        background: #b71c1c;
      }

      .nav-toggle {
        display: none;
        flex-direction: column;
        cursor: pointer;
        gap: 4px;
      }

      .nav-toggle span {
        width: 25px;
        height: 3px;
        background: white;
        transition: all 0.3s ease;
      }

      .nav-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(6px, 6px);
      }

      .nav-toggle.active span:nth-child(2) {
        opacity: 0;
      }

      .nav-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(6px, -6px);
      }

      @media (max-width: 768px) {
        .nav-menu {
          position: fixed;
          top: 70px;
          right: -100%;
          width: 300px;
          height: calc(100vh - 70px);
          background: var(--primary-color, #0F4C3A);
          flex-direction: column;
          align-items: flex-start;
          gap: 0;
          padding: 2rem;
          transition: right 0.3s ease;
        }

        .nav-menu.active {
          right: 0;
        }

        .nav-item {
          width: 100%;
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-toggle {
          display: flex;
        }

        .nav-user {
          width: 100%;
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-dropdown {
          position: static;
          opacity: 1;
          visibility: visible;
          transform: none;
          box-shadow: none;
          background: transparent;
          color: white;
        }
      }
    `;
  }
}

// Auto-initialize if Auth is available
if (typeof Auth !== 'undefined') {
  new NavigationComponent();
}

// Export for manual initialization
window.NavigationComponent = NavigationComponent;