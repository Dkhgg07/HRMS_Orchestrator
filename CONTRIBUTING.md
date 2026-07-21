# Contributing to HRMS - Orchestrator

Thank you for your interest in contributing to the HRMS (Human Resource Management System) project! We welcome contributions from developers of all skill levels.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **Git**
- **MongoDB Atlas** account (for database)

### Setting Up the Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/SIH---Orchestrator.git
   cd SIH---Orchestrator
   ```

3. **Install dependencies**:
   ```bash
   npm run setup
   ```

4. **Configure environment variables**:
   - Copy `.env.example` to `.env` in the `backend` directory
   - Fill in your MongoDB Atlas connection string and JWT secret

5. **Start development servers**:
   ```bash
   npm run dev
   ```

## 📋 Code Style Guidelines

### General Principles
- Write clean, readable, and maintainable code
- Follow consistent naming conventions
- Add comments for complex logic
- Keep functions small and focused

### JavaScript Style
- Use `camelCase` for variables and functions
- Use `PascalCase` for classes and constructors
- Use `UPPER_SNAKE_CASE` for constants
- Use semicolons consistently
- Prefer `const` and `let` over `var`

### Backend (Node.js/Express)
- Follow RESTful API conventions
- Use proper HTTP status codes
- Implement proper error handling
- Add input validation for all endpoints
- Use middleware for common functionality

### Frontend (HTML/CSS/JavaScript)
- Use semantic HTML5 elements
- Follow mobile-first responsive design
- Maintain consistent indentation (2 spaces)
- Use meaningful class names
- Organize CSS with logical grouping

### Database (MongoDB)
- Use descriptive schema field names
- Add proper validation rules
- Use indexes for frequently queried fields
- Follow normalization best practices

## 🔧 Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes
- Write clean, well-documented code
- Follow the established patterns in the codebase
- Test your changes thoroughly

### 3. Commit Your Changes
- Use clear, descriptive commit messages
- Follow the conventional commit format:
  ```
  type(scope): description
  
  Examples:
  feat(auth): add password reset functionality
  fix(dashboard): resolve calendar display issue
  docs(readme): update installation instructions
  style(css): improve button hover effects
  ```

### 4. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs **actual behavior**
4. **Environment details** (OS, Node.js version, browser)
5. **Screenshots** or error logs if applicable

Use the bug report template:
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10]
- Node.js: [e.g., v16.14.0]
- Browser: [e.g., Chrome 98]
```

## 💡 Feature Requests

For new features, please:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Explain your proposed solution**
4. **Consider the impact** on existing functionality
5. **Provide mockups** or examples if applicable

## 🔍 Code Review Process

### For Contributors
- Ensure your code follows the style guidelines
- Write descriptive pull request descriptions
- Be responsive to feedback and suggestions
- Update documentation if needed

### Review Criteria
- Code quality and readability
- Adherence to project patterns
- Performance considerations
- Security implications
- Test coverage (when applicable)

## 📚 Project Structure

Understanding the codebase organization:

```
HRMS/
├── backend/                 # Node.js/Express backend
│   ├── controllers/         # Request handlers
│   ├── models/             # Database schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Custom middleware
│   └── config/             # Configuration files
├── frontend/               # Client-side application
│   ├── pages/              # HTML pages
│   ├── assets/             # CSS, JS, images
│   │   ├── js/             # JavaScript modules
│   │   └── css/            # Stylesheets
│   └── components/         # Reusable UI components
└── docs/                   # Additional documentation
```

## 🧪 Testing Guidelines

### Frontend Testing
- Test user interactions manually
- Verify responsive design on different screen sizes
- Check cross-browser compatibility
- Validate form inputs and error handling

### Backend Testing
- Test API endpoints with different inputs
- Verify authentication and authorization
- Check error handling and edge cases
- Validate database operations

### Integration Testing
- Test complete user workflows
- Verify frontend-backend communication
- Check data consistency

## 🚨 Security Considerations

When contributing, keep security in mind:

- **Never commit** sensitive data (passwords, API keys, tokens)
- **Validate all inputs** on both client and server side
- **Use parameterized queries** to prevent SQL injection
- **Implement proper authentication** and authorization
- **Follow OWASP guidelines** for web security

## 📖 Documentation

Help improve documentation by:

- Updating README.md when adding features
- Adding inline code comments
- Creating or updating API documentation
- Writing clear commit messages
- Updating setup instructions

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Ask questions when unclear
- Share knowledge and best practices

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check existing docs first
- **Code Examples**: Look at existing implementations

## 🎯 Areas for Contribution

We welcome contributions in these areas:

### High Priority
- Bug fixes and stability improvements
- Performance optimizations
- Security enhancements
- Mobile responsiveness
- Accessibility improvements

### Medium Priority
- New features (discuss first in issues)
- UI/UX improvements
- Code refactoring
- Documentation updates
- Test coverage

### Low Priority
- Code style improvements
- Minor feature enhancements
- Developer experience improvements

## 📝 Pull Request Template

When creating a pull request, use this template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] I have tested these changes
- [ ] New tests have been added (if applicable)
- [ ] All tests pass

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements left
```

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor graphs

Thank you for contributing to make HRMS better! 🚀