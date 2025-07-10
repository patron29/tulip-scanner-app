import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import TulipLogo from './components/TulipLogo';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import UpgradeModal from './components/UpgradeModal';
import HomeScreen from './components/HomeScreen';
import ScannerScreen from './components/ScannerScreen';
import ProductDetailScreen from './components/ProductDetailScreen';
import ProfileScreen from './components/ProfileScreen';
import SettingsScreen from './components/SettingsScreen';
import SubscriptionScreen from './components/SubscriptionScreen';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import { fetchProductFromAPI, saveProductToFavorites } from './services/productService';
import { fetchPriceComparison, fetchCoupons } from './services/priceService';
import { REAL_BARCODES } from './utils/constants';
import { checkFeatureAccess, getRemainingScans, TIER_FEATURES } from './utils/tierConfig';
import { LogOut, ChevronDown, User, Settings, Crown } from 'lucide-react';

function AppContent() {
  const { user, decrementScans, upgradeTier, logout } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [showLogin, setShowLogin] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [savedProducts, setSavedProducts] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [priceComparison, setPriceComparison] = useState(null);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  
  // Load settings from localStorage
  const [appSettings, setAppSettings] = useState(() => {
    const savedSettings = localStorage.getItem('tulipSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      notifications: {
        priceAlerts: false,
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

  // Show splash screen on first load
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      setShowUserMenu(false);
      setCurrentScreen('home');
      setSavedProducts([]);
      setScannedProduct(null);
    }
  };

  // Check if user can scan
  const canScan = () => {
    if (!user) {
      setShowLogin(true);
      return false;
    }
    
    const remainingScans = getRemainingScans(user);
    if (remainingScans === 0) {
      setShowUpgrade(true);
      return false;
    }
    
    return true;
  };

  // Modified simulate scan
  const simulateScan = () => {
    if (!canScan()) return;
    
    setIsScanning(true);
    setError('');
    
    setTimeout(async () => {
      const randomBarcode = REAL_BARCODES[Math.floor(Math.random() * REAL_BARCODES.length)];
      const product = await fetchProductFromAPI(randomBarcode);
      setScannedProduct(product);
      setIsScanning(false);
      setCurrentScreen('product-detail');
      decrementScans();
      
      if (checkFeatureAccess(user?.tier || 'free', 'maxRetailers') > 3) {
        handleFetchPriceComparison(product.name, product.brand);
      }
    }, 2000);
  };

  // Modified manual barcode search
  const searchByBarcode = async () => {
    if (!canScan()) return;
    
    if (manualBarcode.length < 8) {
      setError('Please enter a valid barcode');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const product = await fetchProductFromAPI(manualBarcode);
      setScannedProduct(product);
      setCurrentScreen('product-detail');
      setManualBarcode('');
      decrementScans();
      
      if (checkFeatureAccess(user?.tier || 'free', 'maxRetailers') > 3) {
        handleFetchPriceComparison(product.name, product.brand);
      }
    } catch (err) {
      setError('Product not found');
    } finally {
      setIsLoading(false);
    }
  };

  // Modified save product
  const saveProduct = (product) => {
    const maxSaved = TIER_FEATURES[user?.tier || 'free'].limitations.maxSavedProducts;
    if (savedProducts.length >= maxSaved) {
      alert(`You've reached the maximum of ${maxSaved} saved products for your ${user?.tier || 'free'} plan. Upgrade to save more!`);
      setShowUpgrade(true);
      return;
    }
    setSavedProducts(prev => saveProductToFavorites(prev, product));
  };

  // Modified fetch price comparison
  const handleFetchPriceComparison = async (productName, brand) => {
    const userTier = user?.tier || 'free';
    const maxRetailers = TIER_FEATURES[userTier].limitations.maxRetailers;
    
    setLoadingPrices(true);
    const data = await fetchPriceComparison(productName, brand);
    
    if (maxRetailers !== Infinity) {
      data.retailers = data.retailers.slice(0, maxRetailers);
    }
    
    setPriceComparison(data);
    setLoadingPrices(false);
  };

  // Modified fetch coupons
  const handleFetchCoupons = async (productName, brand, retailer = null) => {
    if (!checkFeatureAccess(user?.tier || 'free', 'hasCoupons')) {
      alert('Coupons are available for Basic and Premium users. Upgrade to access deals!');
      setShowUpgrade(true);
      return;
    }
    
    const coupons = await fetchCoupons(productName, brand, retailer);
    setAvailableCoupons(coupons);
  };

  const handleUpgrade = (tier) => {
    upgradeTier(tier);
    setShowUpgrade(false);
    alert(`Successfully upgraded to ${tier} plan!`);
  };

  // Update app settings and save to localStorage
  const updateAppSettings = (newSettings) => {
    setAppSettings(newSettings);
    localStorage.setItem('tulipSettings', JSON.stringify(newSettings));
  };

  return (
    <>
      {/* Global Dark Mode Styles */}
      {appSettings.display.darkMode && (
        <style>{`
          body {
            background-color: #1a1a1a !important;
            color: #ffffff !important;
          }
          .bg-white {
            background-color: #2a2a2a !important;
            color: #ffffff !important;
          }
          .bg-gray-50 {
            background-color: #3a3a3a !important;
          }
          .bg-gray-100 {
            background-color: #4a4a4a !important;
          }
          .text-gray-900 {
            color: #f0f0f0 !important;
          }
          .text-gray-800 {
            color: #e0e0e0 !important;
          }
          .text-gray-700 {
            color: #d0d0d0 !important;
          }
          .text-gray-600 {
            color: #b0b0b0 !important;
          }
          .text-gray-500 {
            color: #a0a0a0 !important;
          }
          .text-gray-400 {
            color: #909090 !important;
          }
          .border-gray-200 {
            border-color: #4a4a4a !important;
          }
          .bg-gradient-to-br {
            background: #2a2a2a !important;
          }
          input {
            background-color: #3a3a3a !important;
            color: #ffffff !important;
            border-color: #5a5a5a !important;
          }
          .hover\\:bg-gray-50:hover {
            background-color: #4a4a4a !important;
          }
          .hover\\:bg-gray-100:hover {
            background-color: #5a5a5a !important;
          }
          .bg-green-50 {
            background-color: #1a3a1a !important;
          }
          .bg-yellow-50 {
            background-color: #3a3a1a !important;
          }
          .bg-red-50 {
            background-color: #3a1a1a !important;
          }
          .bg-purple-50 {
            background-color: #2a1a3a !important;
          }
          .bg-pink-50 {
            background-color: #3a1a2a !important;
          }
          .bg-orange-50 {
            background-color: #3a2a1a !important;
          }
          .bg-blue-50 {
            background-color: #1a2a3a !important;
          }
          .bg-indigo-50 {
            background-color: #1a1a3a !important;
          }
          .shadow-lg {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
          }
          .shadow-xl {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5) !important;
          }
          /* Better contrast for colored text */
          .text-green-600, .text-green-700 {
            color: #86efac !important;
          }
          .text-yellow-600, .text-yellow-700 {
            color: #fde047 !important;
          }
          .text-red-600 {
            color: #fca5a5 !important;
          }
          .text-purple-600, .text-purple-700 {
            color: #c084fc !important;
          }
          .text-pink-600 {
            color: #f9a8d4 !important;
          }
          .text-indigo-600 {
            color: #a5b4fc !important;
          }
          /* Modal overlay */
          .fixed.inset-0.bg-black {
            background-color: rgba(0, 0, 0, 0.8) !important;
          }
        `}</style>
      )}
      
      <div className="App max-w-md mx-auto bg-white min-h-screen relative">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 max-w-md mx-auto">
          <div className="px-4 py-2">
            <div className="flex items-center justify-between">
              {/* Left side - Logo */}
              <div className="flex items-center gap-2">
                <TulipLogo size="small" />
                <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  Tulip
                </span>
              </div>

              {/* Right side - User section */}
              {user ? (
                <div className="flex items-center gap-2">
                  {/* User button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 text-sm"
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
                      <ChevronDown size={14} className={`text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu - Positioned absolute */}
                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden z-50">
                        <div className="p-4 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                          <p className="text-xs text-gray-500 mt-1">Member since {user && new Date(user.joinDate).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="py-2">
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              setCurrentScreen('profile');
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                          >
                            <User size={16} />
                            Profile
                          </button>
                          
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              setCurrentScreen('subscription');
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                          >
                            <Crown size={16} />
                            Manage Subscription
                          </button>
                          
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              setCurrentScreen('settings');
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                          >
                            <Settings size={16} />
                            Settings
                          </button>
                        </div>
                        
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

                  {/* Scans count */}
                  <div className="text-xs text-gray-500 border-l pl-2">
                    Scans: {getRemainingScans(user)}
                  </div>

                  {/* Upgrade button */}
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="ml-2 text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1.5 rounded-full font-medium"
                  >
                    Upgrade
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-sm text-pink-600 font-medium"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Overlay to close menu when clicking outside */}
        {showUserMenu && (
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setShowUserMenu(false)}
          />
        )}

        {/* Main content with padding for header */}
        <div className="pt-14">
          {currentScreen === 'home' && (
            <HomeScreen 
              setCurrentScreen={setCurrentScreen}
              manualBarcode={manualBarcode}
              setManualBarcode={setManualBarcode}
              searchByBarcode={searchByBarcode}
              isLoading={isLoading}
              error={error}
              savedProducts={savedProducts}
              setScannedProduct={setScannedProduct}
              user={user}
              remainingScans={getRemainingScans(user)}
              setShowLogin={setShowLogin}
              compactView={appSettings.display.compactView}
            />
          )}
          {currentScreen === 'scanner' && (
            <ScannerScreen 
              setCurrentScreen={setCurrentScreen}
              isScanning={isScanning}
              simulateScan={simulateScan}
            />
          )}
          {currentScreen === 'product-detail' && (
            <ProductDetailScreen 
              scannedProduct={scannedProduct}
              setCurrentScreen={setCurrentScreen}
              saveProduct={saveProduct}
              savedProducts={savedProducts}
              priceComparison={priceComparison}
              loadingPrices={loadingPrices}
              fetchPriceComparison={handleFetchPriceComparison}
              fetchCoupons={handleFetchCoupons}
              availableCoupons={availableCoupons}
              appliedCoupon={appliedCoupon}
              setAppliedCoupon={setAppliedCoupon}
              setAvailableCoupons={setAvailableCoupons}
              userTier={user?.tier || 'free'}
              setShowUpgrade={setShowUpgrade}
              showPrices={appSettings.display.showPrices}
            />
          )}
          {currentScreen === 'profile' && (
            <ProfileScreen 
              user={user}
              setCurrentScreen={setCurrentScreen}
              savedProducts={savedProducts}
            />
          )}
          {currentScreen === 'settings' && (
            <SettingsScreen 
              user={user}
              setCurrentScreen={setCurrentScreen}
              onShowTerms={() => setShowTerms(true)}
              onShowPrivacy={() => setShowPrivacy(true)}
              settings={appSettings}
              updateSettings={updateAppSettings}
            />
          )}
          {currentScreen === 'subscription' && (
            <SubscriptionScreen 
              setCurrentScreen={setCurrentScreen}
              onUpgrade={handleUpgrade}
            />
          )}
        </div>

        {/* Modals */}
        {showLogin && <LoginScreen onClose={() => setShowLogin(false)} />}
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} onUpgrade={handleUpgrade} />}
        {showTerms && <TermsOfService onClose={() => setShowTerms(false)} />}
        {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;