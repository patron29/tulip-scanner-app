import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LogOut, ChevronDown, User, Settings, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRemainingScans } from '../utils/tierConfig';
import TulipLogo from './TulipLogo';

const AppHeader = ({ onShowLogin }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const isClickListenerActive = useRef(false);

  // Close menu when clicking outside
  useEffect(() => {
    if (showUserMenu && !isClickListenerActive.current) {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target) &&
            buttonRef.current && !buttonRef.current.contains(event.target)) {
          setShowUserMenu(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      isClickListenerActive.current = true;
      
      // Cleanup function
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        isClickListenerActive.current = false;
      };
    }
  }, [showUserMenu]);

  // Adjust menu position to prevent overflow
  useEffect(() => {
    if (showUserMenu && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Check if menu overflows viewport
      if (rect.right > viewportWidth) {
        menu.style.right = '0';
        menu.style.left = 'auto';
      }
      
      // Ensure menu doesn't go below viewport
      const viewportHeight = window.innerHeight;
      if (rect.bottom > viewportHeight) {
        menu.style.bottom = '100%';
        menu.style.top = 'auto';
        menu.style.marginBottom = '8px';
        menu.style.marginTop = '0';
      }
    }
  }, [showUserMenu]);

  const handleLogout = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      setShowUserMenu(false);
    }
  }, [logout]);

  const toggleUserMenu = useCallback(() => {
    setShowUserMenu(prev => !prev);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 max-w-md mx-auto">
      <div className="px-3 sm:px-4 py-2">
        <div className="flex items-center justify-between"  style={{ minHeight: '44px' }}>
          {/* Logo */}
          <div className="flex items-center gap-1 sm:gap-2">
            <TulipLogo size="small" />
            <span className="font-bold text-base sm:text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              Tulip
            </span>
          </div>

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* User Menu */}
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={toggleUserMenu}
                  className="flex items-center gap-1 sm:gap-2 text-sm p-1 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs hidden xs:inline-block ${
                    user.tier === 'premium' ? 'bg-purple-100 text-purple-700' :
                    user.tier === 'basic' ? 'bg-pink-100 text-pink-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.tier.toUpperCase()}
                  </span>
                  <ChevronDown 
                    size={14} 
                    className={`text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div 
                    ref={menuRef}
                    className="absolute right-0 top-full mt-2 w-64 bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden z-50"
                    style={{ 
                      maxHeight: 'calc(100vh - 100px)', 
                      overflowY: 'auto',
                      maxWidth: 'min(264px, calc(100vw - 32px))',
                      right: '0'
                    }}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Member since {user && new Date(user.joinDate).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="text-gray-600">Scans: {getRemainingScans(user)}</span>
                        {user.tier !== 'premium' && (
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              if (window.tulipShowUpgrade) {
                                window.tulipShowUpgrade();
                              }
                            }}
                            className="text-purple-600 font-medium hover:text-purple-700"
                          >
                            Upgrade
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <nav className="py-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowUserMenu(false);
                          // Direct global navigation
                          if (window.tulipNavigate) {
                            window.tulipNavigate('profile');
                          }
                        }}
                        className="w-full px-4 py-4 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3 transition-colors"
                        role="menuitem"
                      >
                        <User size={16} aria-hidden="true" />
                        <span>Profile</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowUserMenu(false);
                          // Direct global navigation
                          if (window.tulipNavigate) {
                            window.tulipNavigate('subscription');
                          }
                        }}
                        className="w-full px-4 py-4 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3 transition-colors"
                        role="menuitem"
                      >
                        <Crown size={16} aria-hidden="true" />
                        <span>Manage Subscription</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowUserMenu(false);
                          // Direct global navigation
                          if (window.tulipNavigate) {
                            window.tulipNavigate('settings');
                          }
                        }}
                        className="w-full px-4 py-4 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3 transition-colors"
                        role="menuitem"
                      >
                        <Settings size={16} aria-hidden="true" />
                        <span>Settings</span>
                      </button>
                    </nav>
                    
                    <div className="border-t border-gray-200 py-2">
                      <button
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          handleLogout(e);
                        }}
                        onClick={handleLogout}
                        className="w-full px-4 py-4 text-left text-sm text-red-600 hover:bg-red-50 active:bg-red-100 flex items-center gap-3 transition-colors"
                        role="menuitem"
                      >
                        <LogOut size={16} aria-hidden="true" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Scans Count */}
              <div className="text-xs text-gray-500 border-l pl-2 hidden sm:block">
                Scans: {getRemainingScans(user)}
              </div>

              {/* Upgrade Button */}
              {user.tier !== 'premium' && (
                <button
                  onClick={() => {
                    if (window.tulipShowUpgrade) {
                      window.tulipShowUpgrade();
                    }
                  }}
                  className="ml-2 text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1.5 rounded-full font-medium hover:shadow-lg transition-all hidden sm:block"
                  aria-label="Upgrade plan"
                >
                  Upgrade
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onShowLogin(true)}
              className="text-sm text-pink-600 font-medium hover:text-pink-700 transition-colors"
              aria-label="Sign in"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;