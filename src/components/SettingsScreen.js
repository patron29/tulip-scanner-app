import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Shield, Eye, HelpCircle, FileText, Lock, ChevronRight, ToggleLeft, ToggleRight, Check } from 'lucide-react';

const SettingsScreen = ({ user, setCurrentScreen, onShowTerms, onShowPrivacy, settings, updateSettings }) => {
  // Load settings from localStorage on mount
  useEffect(() => {
    if (!settings && !updateSettings) {
      const savedSettings = localStorage.getItem('tulipSettings');
      if (savedSettings) {
        setLocalSettings(JSON.parse(savedSettings));
      }
    }
  }, [settings, updateSettings]);

  // Local settings state if not provided from parent
  const [localSettings, setLocalSettings] = useState(() => {
    const savedSettings = localStorage.getItem('tulipSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      notifications: {
        priceAlerts: user?.tier === 'premium',
        scanReminders: true,
        promotions: false,
        appUpdates: true
      },
      privacy: {
        shareAnalytics: true,
        personalizedAds: false,
        locationServices: true
      },
      display: {
        darkMode: false,
        compactView: false,
        showPrices: true
      }
    };
  });

  // Use provided settings or local state
  const activeSettings = settings || localSettings;
  const setSettings = updateSettings || setLocalSettings;
  
  // State for showing save confirmation
  const [showSaved, setShowSaved] = useState(false);

  const toggleSetting = (category, setting) => {
    // Don't allow toggling price alerts if not premium
    if (category === 'notifications' && setting === 'priceAlerts' && user?.tier !== 'premium') {
      return;
    }
    
    const newSettings = {
      ...activeSettings,
      [category]: {
        ...activeSettings[category],
        [setting]: !activeSettings[category][setting]
      }
    };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('tulipSettings', JSON.stringify(newSettings));
    
    // Show saved indicator
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const ToggleSwitch = ({ enabled, onToggle, disabled = false }) => (
    <button 
      onClick={onToggle} 
      disabled={disabled}
      className={`transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
    >
      {enabled ? (
        <ToggleRight size={28} className="text-purple-600" />
      ) : (
        <ToggleLeft size={28} className="text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto p-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('home')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-semibold">Settings</h2>
          <div className="w-6" />
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Save Confirmation */}
        {showSaved && (
          <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
            <Check size={16} />
            <span className="text-sm font-medium">Settings saved!</span>
          </div>
        )}
        {/* Notifications Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Bell size={20} className="text-purple-600" />
            Notifications
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Price Drop Alerts</p>
                <p className="text-xs text-gray-500">
                  {user?.tier === 'premium' ? 'Get notified when prices drop' : 'Premium feature only'}
                </p>
              </div>
              <ToggleSwitch 
                enabled={activeSettings.notifications.priceAlerts}
                onToggle={() => toggleSetting('notifications', 'priceAlerts')}
                disabled={user?.tier !== 'premium'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Scan Reminders</p>
                <p className="text-xs text-gray-500">Monthly reminder to use your scans</p>
              </div>
              <ToggleSwitch 
                enabled={activeSettings.notifications.scanReminders}
                onToggle={() => toggleSetting('notifications', 'scanReminders')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Promotions & Offers</p>
                <p className="text-xs text-gray-500">Special deals and discounts</p>
              </div>
              <ToggleSwitch 
                enabled={activeSettings.notifications.promotions}
                onToggle={() => toggleSetting('notifications', 'promotions')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-800">App Updates</p>
                <p className="text-xs text-gray-500">New features and improvements</p>
              </div>
              <ToggleSwitch 
                enabled={activeSettings.notifications.appUpdates}
                onToggle={() => toggleSetting('notifications', 'appUpdates')}
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Shield size={20} className="text-purple-600" />
            Privacy
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Share Analytics</p>
                <p className="text-xs text-gray-500">Help us improve the app</p>
              </div>
              <ToggleSwitch 
                enabled={activeSettings.privacy.shareAnalytics}
                onToggle={() => toggleSetting('privacy', 'shareAnalytics')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Personalized Ads</p>
                <p className="text-xs text-gray-500">Show relevant advertisements</p>
              </div>
              <ToggleSwitch 
                enabled={activeSettings.privacy.personalizedAds}
                onToggle={() => toggleSetting('privacy', 'personalizedAds')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Location Services</p>
                <p className="text-xs text-gray-500">Find deals near you</p>
              </div>
              <ToggleSwitch 
                enabled={activeSettings.privacy.locationServices}
                onToggle={() => toggleSetting('privacy', 'locationServices')}
              />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Eye size={20} className="text-purple-600" />
            Display
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Dark Mode</p>
                <p className="text-xs text-gray-500">Easier on the eyes at night</p>
              </div>
              <ToggleSwitch 
                enabled={activeSettings.display.darkMode}
                onToggle={() => toggleSetting('display', 'darkMode')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Compact View</p>
                <p className="text-xs text-gray-500">Show more items on screen</p>
              </div>
              <ToggleSwitch 
                enabled={activeSettings.display.compactView}
                onToggle={() => toggleSetting('display', 'compactView')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Show Prices</p>
                <p className="text-xs text-gray-500">Display prices in search results</p>
              </div>
              <ToggleSwitch 
                enabled={activeSettings.display.showPrices}
                onToggle={() => toggleSetting('display', 'showPrices')}
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-lg mb-4">About</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => onShowTerms && onShowTerms()}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-gray-600" />
                <span className="text-gray-800">Terms of Service</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button
              onClick={() => onShowPrivacy && onShowPrivacy()}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock size={20} className="text-gray-600" />
                <span className="text-gray-800">Privacy Policy</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button
              onClick={() => window.open('mailto:support@tulipapp.com?subject=Help%20Request', '_blank')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={20} className="text-gray-600" />
                <span className="text-gray-800">Help & Support</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">Tulip Version 1.0.0</p>
                <p className="text-xs text-gray-500 mt-1">© 2025 Tulip App</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Data */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <button 
            onClick={() => {
              if (window.confirm('This will clear all cached data and reset your settings. Are you sure?')) {
                localStorage.removeItem('tulipSettings');
                localStorage.removeItem('user');
                window.location.reload();
              }
            }}
            className="w-full text-red-600 font-medium hover:text-red-700"
          >
            Clear Cache & Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;