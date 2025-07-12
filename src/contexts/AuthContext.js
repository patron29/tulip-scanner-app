import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { TIER_FEATURES } from '../utils/tierConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for saved user session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedUser = localStorage.getItem('tulip_user');
        const savedToken = localStorage.getItem('tulip_token');
        
        if (savedUser && savedToken) {
          const userData = JSON.parse(savedUser);
          
          // Validate token
          if (authService.validateToken(savedToken)) {
            // Check if month has passed and reset scans
            const lastReset = new Date(userData.lastResetDate || userData.joinDate);
            const now = new Date();
            
            if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
              userData.scansThisMonth = 0;
              userData.scansRemaining = userData.tier === 'premium' 
                ? Infinity 
                : TIER_FEATURES[userData.tier].scansPerMonth;
              userData.lastResetDate = now.toISOString();
              
              // Update localStorage
              localStorage.setItem('tulip_user', JSON.stringify(userData));
            }
            
            setUser(userData);
          } else {
            // Invalid token, clear session
            localStorage.removeItem('tulip_user');
            localStorage.removeItem('tulip_token');
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
        // Clear potentially corrupted data
        localStorage.removeItem('tulip_user');
        localStorage.removeItem('tulip_token');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Register new user
  const register = useCallback(async (email, password, name) => {
    setError(null);
    setLoading(true);
    
    try {
      const newUser = await authService.register(email, password, name);
      setUser(newUser);
      localStorage.setItem('tulip_user', JSON.stringify(newUser));
      localStorage.setItem('tulip_token', newUser.token);
      return { success: true, user: newUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Login user
  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      localStorage.setItem('tulip_user', JSON.stringify(userData));
      localStorage.setItem('tulip_token', userData.token);
      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Social login
  const socialLogin = useCallback(async (provider) => {
    setError(null);
    setLoading(true);
    
    try {
      // Mock social login data
      const profileData = {
        email: provider === 'google' ? 'user@gmail.com' : 'user@icloud.com',
        name: provider === 'google' ? 'Google User' : 'Apple User'
      };
      
      const userData = await authService.socialLogin(provider, profileData);
      setUser(userData);
      localStorage.setItem('tulip_user', JSON.stringify(userData));
      localStorage.setItem('tulip_token', userData.token);
      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout user
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
    localStorage.removeItem('tulip_user');
    localStorage.removeItem('tulip_token');
    // Clear all app data
    localStorage.removeItem('tulipSettings');
    // Clear rate limiting data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('rateLimit_')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  // Upgrade user tier
  const upgradeTier = useCallback(async (newTier) => {
    if (!user) return { success: false, error: 'User not logged in' };
    
    setError(null);
    setLoading(true);
    
    try {
      const updatedUser = await authService.updateUserTier(user.id, newTier);
      setUser(updatedUser);
      localStorage.setItem('tulip_user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Decrement scans
  const decrementScans = useCallback(() => {
    if (!user) return;
    
    if (user.scansRemaining > 0 && user.scansRemaining !== Infinity) {
      const updatedUser = {
        ...user,
        scansRemaining: user.scansRemaining - 1,
        scansThisMonth: user.scansThisMonth + 1
      };
      setUser(updatedUser);
      localStorage.setItem('tulip_user', JSON.stringify(updatedUser));
    }
  }, [user]);

  // Reset password
  const resetPassword = useCallback(async (email) => {
    setError(null);
    setLoading(true);
    
    try {
      const result = await authService.resetPassword(email);
      return { success: true, message: result.message };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    socialLogin,
    logout,
    upgradeTier,
    decrementScans,
    resetPassword,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};