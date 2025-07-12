// Input validation utilities for security and data integrity

export const ValidationRules = {
    // Sanitize input to prevent XSS
    sanitizeInput: (input) => {
      if (typeof input !== 'string') return input;
      
      return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove inline event handlers
        .trim();
    },
  
    // Validate barcode format
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
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        cleanValue: barcode ? barcode.replace(/\D/g, '') : ''
      };
    },
  
    // Validate email
    validateEmail: (email) => {
      const errors = [];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!email) {
        errors.push('Email is required');
      } else if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
      } else if (email.length > 100) {
        errors.push('Email is too long');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        cleanValue: email ? email.toLowerCase().trim() : ''
      };
    },
  
    // Validate password
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
  
    // Validate price
    validatePrice: (price) => {
      const errors = [];
      const numPrice = parseFloat(price);
      
      if (isNaN(numPrice)) {
        errors.push('Price must be a valid number');
      } else if (numPrice < 0) {
        errors.push('Price cannot be negative');
      } else if (numPrice > 999999) {
        errors.push('Price is too high');
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
  
    // Rate limiting check (simple client-side implementation)
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
    }
  };
  
  // Helper function to calculate password strength
  function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }
  
  export default ValidationRules;