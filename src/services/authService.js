// Authentication Service - Connects to Backend API
const API_BASE_URL = 'http://localhost:5001/api';

// Validate email format
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate password strength
const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const authService = {
  // Register new user (alias for 'signup')
  register: async (email, password, name) => {
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token and user data
      if (data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      if (data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Social login (Google/Apple)
  socialLogin: async (provider, profileData) => {
    try {
      let endpoint;
      let body;

      if (provider === 'google') {
        endpoint = `${API_BASE_URL}/auth/google`;
        body = {
          googleId: profileData.id || profileData.sub,
          email: profileData.email,
          name: profileData.name
        };
      } else if (provider === 'apple') {
        endpoint = `${API_BASE_URL}/auth/apple`;
        body = {
          appleId: profileData.id || profileData.sub,
          email: profileData.email,
          name: profileData.name
        };
      } else {
        throw new Error('Unsupported provider');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Social login failed');
      }

      // Store token and user data
      if (data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data.data;
    } catch (error) {
      console.error('Social login error:', error);
      throw error;
    }
  },

  // Get current user from backend
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // If unauthorized, clear stored data
        if (response.status === 401) {
          this.logout();
        }
        throw new Error(data.message || 'Failed to get user');
      }

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(data.data.user));

      return data.data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Update user tier (upgrade subscription)
  updateUserTier: async (newTier) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/upgrade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tier: newTier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upgrade failed');
      }

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(data.data.user));

      return data.data.user;
    } catch (error) {
      console.error('Upgrade error:', error);
      throw error;
    }
  },

  // Validate token (checks if user is authenticated)
  validateToken: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return true;
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get stored user (without API call)
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // CSRF token methods (kept for compatibility, but not used with JWT)
  getCSRFToken: () => {
    return 'not-needed-with-jwt';
  },

  validateCSRFToken: () => {
    return true;
  },

  // Reset password placeholder (implement when backend supports it)
  resetPassword: async (email) => {
    throw new Error('Password reset not yet implemented on backend');
  }
};

export default authService;