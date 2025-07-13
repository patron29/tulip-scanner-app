// Authentication Service with improved security
import { TIER_FEATURES } from '../utils/tierConfig';

// Generate UUID (with fallback for older browsers)
const generateUUID = () => {
  // Check if crypto.randomUUID is available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

// Generate cryptographically secure token (with fallback)
const generateSecureToken = () => {
  try {
    const array = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    // Fallback for older browsers
  }
  
  // Fallback: less secure but works everywhere
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += Math.floor(Math.random() * 16).toString(16);
  }
  return token;
};

// Generate CSRF token (with fallback)
const generateCSRFToken = () => {
  try {
    const array = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    // Fallback for older browsers
  }
  
  // Fallback: less secure but works everywhere
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += Math.floor(Math.random() * 16).toString(16);
  }
  return token;
};

// Hash password (with fallback for older browsers)
const hashPassword = async (password) => {
  // Try to use crypto.subtle if available
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + 'tulip_salt_2024');
      const hash = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (e) {
      // Fall through to fallback
    }
  }
  
  // Fallback: Simple hash function (less secure but works everywhere)
  let hash = 0;
  const str = password + 'tulip_salt_2024';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to hex string
  return Math.abs(hash).toString(16).padStart(16, '0');
};

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
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Session storage (in production, use secure HTTP-only cookies)
const sessionStorage = new Map();

// Mock user database (in production, this would be a real database)
const mockUsers = new Map();

export const authService = {
  // Initialize CSRF token
  getCSRFToken: () => {
    let token = sessionStorage.get('csrf_token');
    if (!token) {
      token = generateCSRFToken();
      sessionStorage.set('csrf_token', token);
    }
    return token;
  },

  // Validate CSRF token
  validateCSRFToken: (token) => {
    const storedToken = sessionStorage.get('csrf_token');
    return storedToken && storedToken === token;
  },

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

    const hashedPassword = await hashPassword(password);
    const token = generateSecureToken();
    const sessionId = generateSecureToken();
    
    const newUser = {
      id: generateUUID(),
      email,
      name: name || email.split('@')[0],
      tier: 'free',
      scansRemaining: TIER_FEATURES.free.scansPerMonth,
      scansThisMonth: 0,
      joinDate: new Date().toISOString(),
      subscriptionExpiry: null,
      lastResetDate: new Date().toISOString(),
      sessionId
    };

    // Store user with hashed password
    mockUsers.set(email, { 
      ...newUser, 
      password: hashedPassword,
      sessions: [sessionId]
    });
    
    // Store session
    sessionStorage.set(sessionId, {
      userId: newUser.id,
      token,
      createdAt: Date.now(),
      lastActivity: Date.now()
    });
    
    // Return user without sensitive data
    return { ...newUser, token };
  },

  // Login user
  login: async (email, password) => {
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    const user = mockUsers.get(email);
    if (!user || user.password !== await hashPassword(password)) {
      throw new Error('Invalid email or password');
    }

    // Generate new session
    const token = generateSecureToken();
    const sessionId = generateSecureToken();
    
    // Update user sessions
    user.sessions = user.sessions || [];
    user.sessions.push(sessionId);
    
    // Limit to 5 concurrent sessions
    if (user.sessions.length > 5) {
      const oldSessionId = user.sessions.shift();
      sessionStorage.delete(oldSessionId);
    }

    // Check if month has passed and reset scans
    const lastReset = new Date(user.lastResetDate);
    const now = new Date();
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      user.scansThisMonth = 0;
      user.scansRemaining = TIER_FEATURES[user.tier].scansPerMonth;
      user.lastResetDate = now.toISOString();
    }

    // Store session
    sessionStorage.set(sessionId, {
      userId: user.id,
      token,
      createdAt: Date.now(),
      lastActivity: Date.now()
    });

    // Return user without sensitive data
    const { password: _, sessions: __, ...userWithoutSensitive } = user;
    return { ...userWithoutSensitive, token, sessionId };
  },

  // Validate token
  validateToken: (token) => {
    if (!token) return false;
    
    // Check all sessions for this token
    for (const [sessionId, session] of sessionStorage.entries()) {
      if (session.token === token) {
        // Check if session is expired (24 hours)
        const age = Date.now() - session.createdAt;
        if (age > 24 * 60 * 60 * 1000) {
          sessionStorage.delete(sessionId);
          return false;
        }
        
        // Update last activity
        session.lastActivity = Date.now();
        return true;
      }
    }
    
    return false;
  },

  // Logout
  logout: (sessionId) => {
    if (sessionId) {
      sessionStorage.delete(sessionId);
      
      // Remove session from user's sessions list
      for (const [, user] of mockUsers.entries()) {
        if (user.sessions && user.sessions.includes(sessionId)) {
          user.sessions = user.sessions.filter(id => id !== sessionId);
          break;
        }
      }
    }
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

    const { password: _, sessions: __, ...userWithoutSensitive } = userFound;
    return userWithoutSensitive;
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
    const resetToken = generateSecureToken();
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    
    // In production, this would be sent via email
    return { message: 'If the email exists, a reset link has been sent' };
  },

  // Social login mock
  socialLogin: async (provider, profileData) => {
    const email = profileData.email;
    let user = mockUsers.get(email);

    if (!user) {
      // Create new user from social login
      const sessionId = generateSecureToken();
      const newUser = {
        id: generateUUID(),
        email,
        name: profileData.name || email.split('@')[0],
        tier: 'free',
        scansRemaining: TIER_FEATURES.free.scansPerMonth,
        scansThisMonth: 0,
        joinDate: new Date().toISOString(),
        subscriptionExpiry: null,
        lastResetDate: new Date().toISOString(),
        authProvider: provider,
        sessions: [sessionId]
      };

      mockUsers.set(email, newUser);
      user = newUser;
    }

    // Create session
    const token = generateSecureToken();
    const sessionId = generateSecureToken();
    
    user.sessions = user.sessions || [];
    user.sessions.push(sessionId);
    
    sessionStorage.set(sessionId, {
      userId: user.id,
      token,
      createdAt: Date.now(),
      lastActivity: Date.now()
    });

    const { password: _, sessions: __, ...userWithoutSensitive } = user;
    return { ...userWithoutSensitive, token, sessionId };
  }
};

export default authService;