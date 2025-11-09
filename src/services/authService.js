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

// Validate and normalize user data
const validateUserData = (user) => {
  if (!user) {
    console.error('No user data received from backend');
    return null;
  }

  // Ensure tier is valid
  const validTiers = ['free', 'basic', 'premium'];
  if (!user.tier || !validTiers.includes(user.tier)) {
    console.warn('Invalid or missing tier, defaulting to free:', user.tier);
    user.tier = 'free';
  }

  // Ensure scansRemaining exists
  if (user.scansRemaining === undefined || user.scansRemaining === null) {
    console.warn('Missing scansRemaining, setting default');
    user.scansRemaining = user.tier === 'premium' ? 'unlimited' : 5;
  }

  // Ensure all required fields exist
  if (!user.id && !user._id) {
    console.error('User missing ID field');
  }
  if (!user.email) {
    console.error('User missing email field');
  }
  if (!user.name) {
    console.warn('User missing name field');
    user.name = 'User';
  }

  return user;
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
      console.log('Sending signup request to backend...');
      
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      console.log('Backend signup response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Validate and normalize user data
      const validatedUser = validateUserData(data.data.user);
      
      if (!validatedUser) {
        throw new Error('Invalid user data received from backend');
      }

      // Store token and user data
      if (data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(validatedUser));
        console.log('User data stored successfully:', validatedUser);
      } else {
        throw new Error('No token received from backend');
      }

      return { token: data.data.token, user: validatedUser };
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
      console.log('Sending login request to backend...');
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Backend login response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Validate and normalize user data
      const validatedUser = validateUserData(data.data.user);
      
      if (!validatedUser) {
        throw new Error('Invalid user data received from backend');
      }

      // Store token and user data
      if (data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(validatedUser));
        console.log('User data stored successfully:', validatedUser);
      } else {
        throw new Error('No token received from backend');
      }

      return { token: data.data.token, user: validatedUser };
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

      console.log(`Sending ${provider} login request to backend...`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log(`Backend ${provider} login response:`, data);

      if (!response.ok) {
        throw new Error(data.message || 'Social login failed');
      }

      // Validate and normalize user data
      const validatedUser = validateUserData(data.data.user);
      
      if (!validatedUser) {
        throw new Error('Invalid user data received from backend');
      }

      // Store token and user data
      if (data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(validatedUser));
        console.log('User data stored successfully:', validatedUser);
      } else {
        throw new Error('No token received from backend');
      }

      return { token: data.data.token, user: validatedUser };
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

      // Validate and normalize user data
      const validatedUser = validateUserData(data.data.user);
      
      if (!validatedUser) {
        throw new Error('Invalid user data received from backend');
      }

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(validatedUser));

      return validatedUser;
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

      // Validate and normalize user data
      const validatedUser = validateUserData(data.data.user);
      
      if (!validatedUser) {
        throw new Error('Invalid user data received from backend');
      }

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(validatedUser));

      return validatedUser;
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
    console.log('User logged out, cleared localStorage');
    return true;
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get stored user (without API call)
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    if (!user) return null;
    
    try {
      const parsedUser = JSON.parse(user);
      return validateUserData(parsedUser);
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
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