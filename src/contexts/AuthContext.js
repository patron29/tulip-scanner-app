import React, { createContext, useState, useContext, useEffect } from 'react';

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

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock login - in production, this would call your API
    const mockUser = {
      id: '123',
      email: email,
      name: email.split('@')[0],
      tier: 'free', // 'free', 'basic', 'premium'
      scansRemaining: 5,
      scansThisMonth: 0,
      joinDate: new Date().toISOString(),
      subscriptionExpiry: null
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const upgradeTier = (newTier) => {
    if (user) {
      const updatedUser = {
        ...user,
        tier: newTier,
        scansRemaining: newTier === 'premium' ? Infinity : newTier === 'basic' ? 100 : 5,
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const decrementScans = () => {
    if (user && user.scansRemaining > 0 && user.scansRemaining !== Infinity) {
      const updatedUser = {
        ...user,
        scansRemaining: user.scansRemaining - 1,
        scansThisMonth: user.scansThisMonth + 1
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    login,
    logout,
    upgradeTier,
    decrementScans,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};