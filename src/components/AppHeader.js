import React, { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown, User, Settings, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRemainingScans } from '../utils/tierConfig';
import TulipLogo from './TulipLogo';

const AppHeader = ({ onShowLogin }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      setShowUserMenu(false);
    }
  };

  const handleMenuItemClick = (action) => {
    setShowUserMenu(false);
    if (action) action();
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 max-w-md mx-auto">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <TulipLogo size="small" />
            <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
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
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
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
                    className="absolute right-0 top-full mt-2 w-64 bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden"
                    style={{ maxHeight: '80vh', overflowY: 'auto' }}
                  >
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Member since {user && new Date(user.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <nav className="py-2">
                      <button
                        onClick={() => handleMenuItemClick(() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'profile' })))}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <User size={16} />
                        Profile
                      </button>
                      
                      <button
                        onClick={() => handleMenuItemClick(() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'subscription' })))}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <Crown size={16} />
                        Manage Subscription
                      </button>
                      
                      <button
                        onClick={() => handleMenuItemClick(() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'settings' })))}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <Settings size={16} />
                        Settings
                      </button>
                    </nav>
                    
                    <div className="border-t border-gray-200 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <LogOut size={16} />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Scans Count */}
              <div className="text-xs text-gray-500 border-l pl-2">
                Scans: {getRemainingScans(user)}
              </div>

              {/* Upgrade Button */}
              {user.tier !== 'premium' && (
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('showUpgrade'))}
                  className="ml-2 text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1.5 rounded-full font-medium hover:shadow-lg transition-all"
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