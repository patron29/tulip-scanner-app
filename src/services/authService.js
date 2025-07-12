// Authentication Service with security improvements
import { TIER_FEATURES } from '../utils/tierConfig';

// Simulated secure token generation
const generateToken = () => {
  return 'mock_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
};

// Hash password (in production, this would be done server-side)
const hashPassword = (password) => {
  // This is a mock - in production, use bcrypt or similar on the server
  return btoa(password);
};

// Validate email format
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate password strength
const validatePassword = (password) => {
  return {
    isValid: password.length >= 8,
    errors: password.length < 8 ? ['Password must be at least 8 characters'] : []
  };
};

// Mock user database
const mockUsers = new Map();

export const authService = {
  // Register new user
  register: async (email, password, name) => {
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    if (mockUsers.has(email)) {
      throw new Error('Email already registered');
    }

    const hashedPassword = hashPassword(password);
    const token = generateToken();
    
    const newUser = {
      id: Date.now().toString(),
      email,
      name: name || email.split('@')[0],
      tier: 'free',
      scansRemaining: TIER_FEATURES.free.scansPerMonth,
      scansThisMonth: 0,
      joinDate: new Date().toISOString(),
      subscriptionExpiry: null,
      lastResetDate: new Date().toISOString(),
      token
    };

    mockUsers.set(email, { ...newUser, password: hashedPassword });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  // Login user
  login: async (email, password) => {
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    const user = mockUsers.get(email);
    if (!user || user.password !== hashPassword(password)) {
      throw new Error('Invalid email or password');
    }

    // Generate new token on login
    const token = generateToken();
    user.token = token;

    // Check if month has passed and reset scans
    const lastReset = new Date(user.lastResetDate);
    const now = new Date();
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      user.scansThisMonth = 0;
      user.scansRemaining = TIER_FEATURES[user.tier].scansPerMonth;
      user.lastResetDate = now.toISOString();
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Validate token
  validateToken: (token) => {
    if (!token || !token.startsWith('mock_')) {
      return false;
    }
    // In production, validate against server
    return true;
  },

  // Logout
  logout: () => {
    // In production, invalidate token on server
    return true;
  },

  // Update user tier
  updateUserTier: async (userId, newTier) => {
    // Find user by ID
    let userFound = null;
    for (const [, user] of mockUsers.entries()) {
      if (user.id === userId) {
        userFound = user;
        break;
      }
    }

    if (!userFound) {
      throw new Error('User not found');
    }

    userFound.tier = newTier;
    userFound.scansRemaining = TIER_FEATURES[newTier].scansPerMonth === 'Unlimited' 
      ? Infinity 
      : TIER_FEATURES[newTier].scansPerMonth;
    userFound.subscriptionExpiry = newTier === 'free' 
      ? null 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { password: _, ...userWithoutPassword } = userFound;
    return userWithoutPassword;
  },

  // Reset password
  resetPassword: async (email) => {
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    const user = mockUsers.get(email);
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // In production, send email with reset token
    console.log('Password reset requested for:', email);
    return { message: 'If the email exists, a reset link has been sent' };
  },

  // Social login mock
  socialLogin: async (provider, profileData) => {
    const email = profileData.email;
    let user = mockUsers.get(email);

    if (!user) {
      // Create new user from social login
      const newUser = {
        id: Date.now().toString(),
        email,
        name: profileData.name || email.split('@')[0],
        tier: 'free',
        scansRemaining: TIER_FEATURES.free.scansPerMonth,
        scansThisMonth: 0,
        joinDate: new Date().toISOString(),
        subscriptionExpiry: null,
        lastResetDate: new Date().toISOString(),
        authProvider: provider,
        token: generateToken()
      };

      mockUsers.set(email, newUser);
      return newUser;
    }

    // Login existing user
    const token = generateToken();
    user.token = token;
    user.authProvider = provider;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
};

export default authService;