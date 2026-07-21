// Form Component for consistent form styling and validation
class FormComponent {
  constructor(formId, options = {}) {
    this.formId = formId;
    this.options = {
      validateOnInput: true,
      showSuccessMessages: true,
      autoFocus: true,
      ...options
    };
    this.validators = {};
    this.init();
  }

  init() {
    this.form = document.getElementById(this.formId);
    if (!this.form) {
      console.error(`Form with id "${this.formId}" not found`);
      return;
    }

    this.addStyles();
    this.bindEvents();
    
    if (this.options.autoFocus) {
      this.focusFirstInput();
    }
  }

  addStyles() {
    if (!document.getElementById('form-component-styles')) {
      const style = document.createElement('style');
      style.id = 'form-component-styles';
      style.textContent = FormComponent.getStyles();
      document.head.appendChild(style);
    }
  }

  focusFirstInput() {
    const firstInput = this.form.querySelector('input, textarea, select');
    if (firstInput) {
      firstInput.focus();
    }
  }

  bindEvents() {
    if (this.options.validateOnInput) {
      this.form.addEventListener('input', (e) => {
        if (e.target.matches('input, textarea, select')) {
          this.validateField(e.target);
        }
      });
    }

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Real-time validation
    this.form.addEventListener('blur', (e) => {
      if (e.target.matches('input, textarea, select')) {
        this.validateField(e.target);
      }
    }, true);
  }

  // Add validator for a specific field
  addValidator(fieldName, validatorFn, errorMessage) {
    if (!this.validators[fieldName]) {
      this.validators[fieldName] = [];
    }
    this.validators[fieldName].push({ validatorFn, errorMessage });
  }

  // Add common validators
  addRequiredValidator(fieldName, message = 'This field is required') {
    this.addValidator(fieldName, (value) => value.trim() !== '', message);
  }

  addEmailValidator(fieldName, message = 'Please enter a valid email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.addValidator(fieldName, (value) => emailRegex.test(value), message);
  }

  addMinLengthValidator(fieldName, minLength, message) {
    this.addValidator(fieldName, (value) => value.length >= minLength, 
      message || `Must be at least ${minLength} characters`);
  }

  addMatchValidator(fieldName, matchFieldName, message = 'Fields do not match') {
    this.addValidator(fieldName, (value) => {
      const matchField = this.form.querySelector(`[name="${matchFieldName}"]`);
      return matchField ? value === matchField.value : false;
    }, message);
  }

  validateField(field) {
    const fieldName = field.name;
    const value = field.value;
    const validators = this.validators[fieldName] || [];

    // Remove existing error
    this.clearFieldError(field);

    // Run validators
    for (const { validatorFn, errorMessage } of validators) {
      if (!validatorFn(value)) {
        this.showFieldError(field, errorMessage);
        return false;
      }
    }

    this.showFieldSuccess(field);
    return true;
  }

  validateForm() {
    const fields = this.form.querySelectorAll('input, textarea, select');
    let isValid = true;

    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  showFieldError(field, message) {
    field.classList.add('error');
    field.classList.remove('success');

    // Remove existing error message
    this.clearFieldError(field);

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    const fieldGroup = field.closest('.form-group') || field.parentElement;
    fieldGroup.appendChild(errorDiv);
  }

  showFieldSuccess(field) {
    if (field.value.trim() !== '') {
      field.classList.add('success');
      field.classList.remove('error');
      this.clearFieldError(field);
    }
  }

  clearFieldError(field) {
    field.classList.remove('error', 'success');
    const fieldGroup = field.closest('.form-group') || field.parentElement;
    const existingError = fieldGroup.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  }

  getFormData() {
    const formData = new FormData(this.form);
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    return data;
  }

  setFormData(data) {
    Object.keys(data).forEach(key => {
      const field = this.form.querySelector(`[name="${key}"]`);
      if (field) {
        field.value = data[key];
      }
    });
  }

  resetForm() {
    this.form.reset();
    const fields = this.form.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
      this.clearFieldError(field);
    });
  }

  setLoading(isLoading) {
    const submitBtn = this.form.querySelector('button[type="submit"]');
    if (submitBtn) {
      if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Processing...';
      } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Submit';
      }
    }
  }

  handleSubmit() {
    if (!this.validateForm()) {
      this.showMessage('Please fix the errors below', 'error');
      return;
    }

    const data = this.getFormData();
    
    // Dispatch custom event
    this.form.dispatchEvent(new CustomEvent('formValid', {
      detail: { data }
    }));
  }

  showMessage(message, type = 'info') {
    // Remove existing message
    const existingMessage = this.form.querySelector('.form-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;

    this.form.insertBefore(messageDiv, this.form.firstChild);

    // Auto-remove success messages
    if (type === 'success') {
      setTimeout(() => {
        messageDiv.remove();
      }, 3000);
    }
  }

  static getStyles() {
    return `
      .form-group {
        margin-bottom: 1.5rem;
        position: relative;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #374151;
      }

      .form-group input,
      .form-group textarea,
      .form-group select {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s ease;
        box-sizing: border-box;
      }

      .form-group input:focus,
      .form-group textarea:focus,
      .form-group select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .form-group input.error,
      .form-group textarea.error,
      .form-group select.error {
        border-color: #ef4444;
        background-color: #fef2f2;
      }

      .form-group input.success,
      .form-group textarea.success,
      .form-group select.success {
        border-color: #10b981;
        background-color: #f0fdf4;
      }

      .field-error {
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .field-error::before {
        content: "⚠";
        font-size: 0.75rem;
      }

      .form-message {
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        font-weight: 500;
      }

      .form-message.success {
        background-color: #f0fdf4;
        color: #166534;
        border: 1px solid #bbf7d0;
      }

      .form-message.error {
        background-color: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
      }

      .form-message.info {
        background-color: #f0f9ff;
        color: #1e40af;
        border: 1px solid #bfdbfe;
      }

      button[type="submit"] {
        background: linear-gradient(45deg, #3b82f6, #1d4ed8);
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      button[type="submit"]:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
      }

      button[type="submit"]:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      button[type="submit"].loading {
        color: transparent;
      }

      button[type="submit"].loading::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin: -10px 0 0 -10px;
        border: 2px solid transparent;
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .form-row {
        display: flex;
        gap: 1rem;
      }

      .form-row .form-group {
        flex: 1;
      }

      @media (max-width: 768px) {
        .form-row {
          flex-direction: column;
          gap: 0;
        }
      }
    `;
  }
}

// Export for use
window.FormComponent = FormComponent;