# Frontend Documentation

## 📁 Directory Structure

```
frontend/
├── index.html                 # Main entry point
├── pages/                     # All application pages
│   ├── home page.html         # Landing page
│   ├── login.html             # Authentication page
│   ├── dashboard.html         # Main dashboard
│   ├── [removed] ai-assistant.html  # Assistant is now embedded in dashboard
│   ├── project_analysis_leader.html # Team leader view
│   └── project_analysis_member.html # Team member view
├── assets/                    # Static assets
│   ├── js/                    # JavaScript files
│   │   └── app.js             # Core API and auth utilities
│   ├── css/                   # Stylesheets (future use)
│   └── images/                # Images and icons
└── components/                # Reusable UI components
    ├── navigation.js          # Navigation component
    ├── sidebar.js             # Sidebar component
    └── form.js                # Form validation component
```

## 🏗️ Component Architecture

### Core API Utilities (`assets/js/app.js`)
- **Auth Object**: Authentication management
- **API Object**: HTTP request handling
- **UI Object**: User interface utilities
- **Navigation Object**: Page navigation

### UI Components (`components/`)

#### NavigationComponent
- **Purpose**: Consistent top navigation across pages
- **Features**: Role-based menu items, user dropdown, responsive design
- **Usage**: Auto-initializes with Auth integration

#### SidebarComponent
- **Purpose**: Collapsible sidebar navigation
- **Features**: User info display, menu items, logout button
- **Usage**: Configurable options for different page types

#### FormComponent
- **Purpose**: Enhanced form validation and styling
- **Features**: Real-time validation, custom validators, loading states
- **Usage**: Initialize with form ID and validation rules

## 🔧 Setup Instructions

### 1. Serve Frontend Files
```bash
# Using Node.js
cd frontend
npx serve .

# Using Python
cd frontend
python -m http.server 8000

# Using Live Server (VS Code)
Right-click index.html -> "Open with Live Server"
```

### 2. Access Points
- **Main Entry**: `http://localhost:8000/`
- **Direct Pages**: `http://localhost:8000/pages/[page-name].html`

### 3. Backend Configuration
Update `assets/js/app.js` with your backend URL:
```javascript
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api' // Your backend URL
};
```

## 🎨 Styling Guidelines

### CSS Organization
```
assets/css/
├── base.css           # Reset and base styles
├── components.css     # Component-specific styles
├── pages.css          # Page-specific styles
└── themes.css         # Color themes and variables
```

### Design System
- **Primary Color**: `#0F4C3A` (Dark Green)
- **Accent Color**: `#88d498` (Light Green)
- **Font Family**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Border Radius**: 8px for cards, 4px for buttons
- **Box Shadow**: `0 4px 12px rgba(0,0,0,0.15)` for elevation

## 🔄 Component Usage Examples

### Using NavigationComponent
```javascript
// Auto-initializes with Auth
// Or manually initialize:
const nav = new NavigationComponent();
```

### Using SidebarComponent
```javascript
const sidebar = new SidebarComponent({
  title: 'Dashboard',
  menuItems: [
    { label: 'Dashboard', href: 'dashboard.html', icon: 'fa fa-home' },
    { label: 'Projects', href: 'projects.html', icon: 'fa fa-folder' },
    { type: 'separator' },
    { label: 'Settings', href: 'settings.html', icon: 'fa fa-cog' }
  ]
});
```

### Using FormComponent
```javascript
const loginForm = new FormComponent('loginForm');
loginForm.addRequiredValidator('email', 'Email is required');
loginForm.addEmailValidator('email');
loginForm.addRequiredValidator('password', 'Password is required');

// Listen for valid form submission
document.getElementById('loginForm').addEventListener('formValid', (e) => {
  const { data } = e.detail;
  // Handle form data
});
```

## 🛡️ Security Considerations

### Authentication
- JWT tokens stored in localStorage
- Automatic token expiration handling
- Protected route navigation
- Role-based access control

### API Security
- CORS configuration on backend
- Request/response interceptors
- Error handling for unauthorized access
- Secure headers implementation

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
- Components designed for mobile first
- Progressive enhancement for larger screens
- Touch-friendly interface elements
- Optimized navigation for mobile

## 🔧 Development Workflow

### File Organization Rules
1. **Pages**: All HTML pages in `pages/` directory
2. **Assets**: Static files in appropriate `assets/` subdirectories
3. **Components**: Reusable components in `components/` directory
4. **Imports**: Use relative paths from page location

### Adding New Pages
1. Create HTML file in `pages/` directory
2. Include app.js: `<script src="../assets/js/app.js"></script>`
3. Add authentication check if required
4. Update navigation components with new page links

### Adding New Components
1. Create component file in `components/` directory
2. Follow naming convention: `ComponentName.js`
3. Export to `window.ComponentName` for global access
4. Include CSS styles in static `getStyles()` method

## 🚀 Production Deployment

### Build Process
1. **Minification**: Minify CSS and JavaScript files
2. **Asset Optimization**: Compress images and optimize fonts
3. **CDN Setup**: Serve static assets from CDN
4. **Caching**: Implement proper cache headers

### Environment Configuration
```javascript
// assets/js/config.js
const CONFIG = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.yourcompany.com' 
    : 'http://localhost:5000',
  CDN_URL: 'https://cdn.yourcompany.com'
};
```

## 🐛 Troubleshooting

### Common Issues
1. **CORS Errors**: Check backend CORS configuration
2. **Component Not Loading**: Verify script include order
3. **Authentication Issues**: Clear localStorage and re-login
4. **Styling Issues**: Check CSS file inclusion and paths

### Debug Mode
Enable debug mode by adding to URL: `?debug=true`
- Shows additional console logs
- Displays component initialization status
- Shows API request/response details

## 📚 API Integration

### Making API Calls
```javascript
// GET request
const users = await API.get('/users');

// POST request
const result = await API.post('/auth/login', { email, password });

// PUT request
const updated = await API.put('/users/123', userData);

// DELETE request
await API.delete('/users/123');
```

### Error Handling
```javascript
try {
  const data = await API.get('/protected-endpoint');
} catch (error) {
  if (error.status === 401) {
    Auth.logout(); // Redirect to login
  } else {
    UI.showNotification('An error occurred', 'error');
  }
}
```

## 🔄 Future Enhancements

### Planned Features
- [ ] Dark theme support
- [ ] Internationalization (i18n)
- [ ] Progressive Web App (PWA) features
- [ ] Real-time notifications
- [ ] Advanced data visualization
- [ ] Mobile app integration

### Component Roadmap
- [ ] DataTable component
- [ ] Modal component
- [ ] DatePicker component
- [ ] Chart components
- [ ] File upload component