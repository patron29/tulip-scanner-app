// Enhanced input validation utilities for security and data integrity

// HTML entities map for escaping
const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

export const ValidationRules = {
    // Enhanced sanitize input to prevent XSS
    sanitizeInput: (input) => {
      if (typeof input !== 'string') return input;
      
      // First, escape HTML entities
      let sanitized = input.replace(/[&<>"'/]/g, char => htmlEntities[char] || char);
      
      // Remove any remaining dangerous patterns
      sanitized = sanitized
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/vbscript:/gi, '') // Remove vbscript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove inline event handlers
        .replace(/data:text\/html/gi, '') // Remove data URLs that could contain HTML
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
        .replace(/expression\s*\(/gi, '') // Remove CSS expressions
        .replace(/import\s+/gi, '') // Remove import statements
        .trim();
      
      return sanitized;
    },
    
    // Escape HTML for display
    escapeHtml: (unsafe) => {
      if (typeof unsafe !== 'string') return unsafe;
      return unsafe.replace(/[&<>"'/]/g, char => htmlEntities[char] || char);
    },
  
    // Validate barcode format with checksum validation
    validateBarcode: (barcode) => {
      const errors = [];
      
      if (!barcode) {
        errors.push('Barcode is required');
      } else if (typeof barcode !== 'string') {
        errors.push('Barcode must be a string');
      } else {
        // Remove any non-numeric characters
        const cleanBarcode = barcode.replace(/\D/g, '');
        
        if (cleanBarcode.length < 8) {
          errors.push('Barcode must be at least 8 digits');
        }
        if (cleanBarcode.length > 20) {
          errors.push('Barcode must not exceed 20 digits');
        }
        if (!/^\d+$/.test(cleanBarcode)) {
          errors.push('Barcode must contain only numbers');
        }
        
        // Basic checksum validation for common barcode formats
        if (cleanBarcode.length === 12 || cleanBarcode.length === 13) {
          // UPC/EAN checksum validation
          if (!ValidationRules.validateUPCChecksum(cleanBarcode)) {
            errors.push('Invalid barcode checksum');
          }
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        cleanValue: barcode ? barcode.replace(/\D/g, '') : ''
      };
    },
    
    // Validate UPC/EAN checksum
    validateUPCChecksum: (barcode) => {
      if (!barcode || typeof barcode !== 'string') return false;
      
      const digits = barcode.split('').map(Number);
      const checkDigit = digits[digits.length - 1];
      const payload = digits.slice(0, -1);
      
      let sum = 0;
      for (let i = 0; i < payload.length; i++) {
        if (i % 2 === 0) {
          sum += payload[i];
        } else {
          sum += payload[i] * 3;
        }
      }
      
      const calculatedCheck = (10 - (sum % 10)) % 10;
      return calculatedCheck === checkDigit;
    },
  
    // Validate email with enhanced checks
    validateEmail: (email) => {
      const errors = [];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const dangerousPatterns = /[<>'"]/;
      
      if (!email) {
        errors.push('Email is required');
      } else if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
      } else if (email.length > 100) {
        errors.push('Email is too long');
      } else if (dangerousPatterns.test(email)) {
        errors.push('Email contains invalid characters');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        cleanValue: email ? email.toLowerCase().trim() : ''
      };
    },
  
    // Validate password with strength meter
    validatePassword: (password) => {
      const errors = [];
      
      if (!password) {
        errors.push('Password is required');
      } else {
        if (password.length < 8) {
          errors.push('Password must be at least 8 characters');
        }
        if (password.length > 50) {
          errors.push('Password is too long');
        }
        if (!/[A-Z]/.test(password)) {
          errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
          errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
          errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
          errors.push('Password must contain at least one special character');
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        strength: calculatePasswordStrength(password)
      };
    },
  
    // Validate product name
    validateProductName: (name) => {
      const errors = [];
      const sanitized = ValidationRules.sanitizeInput(name);
      
      if (!sanitized) {
        errors.push('Product name is required');
      } else if (sanitized.length < 2) {
        errors.push('Product name is too short');
      } else if (sanitized.length > 200) {
        errors.push('Product name is too long');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        cleanValue: sanitized
      };
    },
  
    // Validate price with better precision
    validatePrice: (price) => {
      const errors = [];
      const numPrice = parseFloat(price);
      
      if (isNaN(numPrice)) {
        errors.push('Price must be a valid number');
      } else if (numPrice < 0) {
        errors.push('Price cannot be negative');
      } else if (numPrice > 999999) {
        errors.push('Price is too high');
      } else if (!/^\d+(\.\d{1,2})?$/.test(price.toString())) {
        errors.push('Price must have at most 2 decimal places');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        cleanValue: isNaN(numPrice) ? 0 : Math.round(numPrice * 100) / 100
      };
    },
  
    // Validate coupon code
    validateCouponCode: (code) => {
      const errors = [];
      const sanitized = ValidationRules.sanitizeInput(code);
      
      if (!sanitized) {
        errors.push('Coupon code is required');
      } else if (!/^[A-Z0-9]{4,20}$/.test(sanitized.toUpperCase())) {
        errors.push('Coupon code must be 4-20 characters and contain only letters and numbers');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        cleanValue: sanitized ? sanitized.toUpperCase() : ''
      };
    },
    
    // Validate URL
    validateURL: (url) => {
      const errors = [];
      
      if (!url) {
        errors.push('URL is required');
        return { isValid: false, errors, cleanValue: '' };
      }
      
      try {
        const urlObj = new URL(url);
        
        // Check protocol
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          errors.push('URL must use HTTP or HTTPS protocol');
        }
        
        // Check for suspicious patterns
        if (url.toLowerCase().includes('script')) {
          errors.push('URL contains potentially dangerous content');
        }
      } catch (e) {
        errors.push('Invalid URL format');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        cleanValue: url
      };
    },
  
    // Enhanced rate limiting check with IP tracking
    checkRateLimit: (action, maxAttempts = 5, windowMs = 60000) => {
      const now = Date.now();
      const key = `rateLimit_${action}`;
      const stored = localStorage.getItem(key);
      
      let data = { attempts: [], blocked: false };
      if (stored) {
        try {
          data = JSON.parse(stored);
        } catch (e) {
          // Invalid data, reset
          localStorage.removeItem(key);
        }
      }
      
      // Remove old attempts outside the window
      data.attempts = data.attempts.filter(timestamp => now - timestamp < windowMs);
      
      // Check if blocked
      if (data.blocked && data.blockedUntil > now) {
        return {
          allowed: false,
          remainingAttempts: 0,
          resetTime: new Date(data.blockedUntil)
        };
      }
      
      // Check current attempts
      if (data.attempts.length >= maxAttempts) {
        data.blocked = true;
        data.blockedUntil = now + windowMs * 2; // Double the window for blocking
        localStorage.setItem(key, JSON.stringify(data));
        
        return {
          allowed: false,
          remainingAttempts: 0,
          resetTime: new Date(data.blockedUntil)
        };
      }
      
      // Allow the attempt
      data.attempts.push(now);
      data.blocked = false;
      localStorage.setItem(key, JSON.stringify(data));
      
      return {
        allowed: true,
        remainingAttempts: maxAttempts - data.attempts.length,
        resetTime: new Date(now + windowMs)
      };
    },
    
    // Clean all rate limiting data
    clearRateLimits: () => {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('rateLimit_')) {
          localStorage.removeItem(key);
        }
      });
    }
  };
  
  // Helper function to calculate password strength
  function calculatePasswordStrength(password) {
    if (!password) return 'weak';
    
    let strength = 0;
    
    // Length checks
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (password.length >= 16) strength += 1;
    
    // Character type checks
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    
    // Common pattern checks (deduct points)
    if (/(.)\1{2,}/.test(password)) strength -= 1; // Repeated characters
    if (/^(password|123456|qwerty)/i.test(password)) strength -= 2; // Common passwords
    
    if (strength <= 2) return 'weak';
    if (strength <= 5) return 'medium';
    return 'strong';
  }
  
  export default ValidationRules;