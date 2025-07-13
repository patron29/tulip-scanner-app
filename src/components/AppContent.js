import React, { useState, useCallback, useEffect, lazy, Suspense, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';
import { fetchProductFromAPI } from '../services/productService';
import { fetchPriceComparison, fetchCoupons } from '../services/priceService';
import { REAL_BARCODES } from '../utils/constants';
import { checkFeatureAccess, getRemainingScans, TIER_FEATURES } from '../utils/tierConfig';
import { ValidationRules } from '../utils/validation';
import { Loader } from 'lucide-react';
import PullToRefresh from './PullToRefresh';

// Lazy load screens
const HomeScreen = lazy(() => import('./HomeScreen'));
const ScannerScreen = lazy(() => import('./ScannerScreen'));
const ProductDetailScreen = lazy(() => import('./ProductDetailScreen'));
const ProfileScreen = lazy(() => import('./ProfileScreen'));
const SettingsScreen = lazy(() => import('./SettingsScreen'));
const SubscriptionScreen = lazy(() => import('./SubscriptionScreen'));
const UpgradeModal = lazy(() => import('./UpgradeModal'));
const TermsOfService = lazy(() => import('./TermsOfService'));
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy'));

// Loading component for lazy loaded screens
const ScreenLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader className="animate-spin text-purple-600" size={32} />
  </div>
);

const AppContent = ({ onShowLogin, currentScreen, setCurrentScreen, showUpgrade, setShowUpgrade }) => {
  const { user, decrementScans, upgradeTier } = useAuth();
  
  // Remove local currentScreen state since we're getting it from props
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
  
  // Use ref to track if component is mounted
  const isMounted = useRef(true);
  
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load saved products from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tulip_saved_products');
    if (saved) {
      try {
        setSavedProducts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved products:', e);
      }
    }
  }, []);

  // Save products to localStorage when they change
  useEffect(() => {
    if (savedProducts.length > 0) {
      localStorage.setItem('tulip_saved_products', JSON.stringify(savedProducts));
    }
  }, [savedProducts]);

  // Handle navigation from route params
  useEffect(() => {
    if (routeParams.productId && currentRoute === 'product-detail') {
      // Load product from saved products
      const product = savedProducts.find(p => p.barcode === routeParams.productId);
      if (product) {
        setScannedProduct(product);
      }
    }
  }, [routeParams, currentRoute, savedProducts]);

  // Create a global navigation function that can be called from anywhere
  useEffect(() => {
    // Make navigation functions globally available
    window.tulipNavigate = (screen) => {
      setCurrentScreen(screen);
    };
    
    window.tulipShowUpgrade = () => {
      setShowUpgrade(true);
    };
    
    // Cleanup
    return () => {
      delete window.tulipNavigate;
      delete window.tulipShowUpgrade;
    };
  }, []);

  // Apply dark mode with proper cleanup
  useEffect(() => {
    const body = document.body;
    if (appSettings.display.darkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }

    // Cleanup function
    return () => {
      body.classList.remove('dark-mode');
    };
  }, [appSettings.display.darkMode]);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      // Reload user data
      if (user) {
        // In a real app, this would fetch from server
        const savedUser = localStorage.getItem('tulip_user');
        if (savedUser) {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Reload saved products
      const saved = localStorage.getItem('tulip_saved_products');
      if (saved && isMounted.current) {
        setSavedProducts(JSON.parse(saved));
      }
      
      // Clear any errors
      if (isMounted.current) {
        setError('');
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  }, [user]);

  // Check if user can scan
  const canScan = useCallback(() => {
    if (!user) {
      onShowLogin(true);
      return false;
    }
    
    // Check rate limiting
    const rateLimit = ValidationRules.checkRateLimit('scan', 10, 60000);
    if (!rateLimit.allowed) {
      setError(`Too many scan attempts. Please try again at ${rateLimit.resetTime.toLocaleTimeString()}`);
      return false;
    }
    
    const remainingScans = getRemainingScans(user);
    if (remainingScans === 0) {
      setShowUpgrade(true);
      return false;
    }
    
    return true;
  }, [user, onShowLogin]);

  // Save product with limit checking
  const saveProduct = useCallback((product) => {
    const maxSaved = TIER_FEATURES[user?.tier || 'free'].limitations.maxSavedProducts;
    if (savedProducts.length >= maxSaved) {
      alert(`You've reached the maximum of ${maxSaved} saved products for your ${user?.tier || 'free'} plan. Upgrade to save more!`);
      setShowUpgrade(true);
      return;
    }
    setSavedProducts(prev => {
      if (!prev.find(p => p.barcode === product.barcode)) {
        return [...prev, product];
      }
      return prev;
    });
  }, [user, savedProducts.length]);

  // Fetch price comparison
  const handleFetchPriceComparison = useCallback(async (productName, brand) => {
    if (!isMounted.current) return;
    
    const userTier = user?.tier || 'free';
    const maxRetailers = TIER_FEATURES[userTier].limitations.maxRetailers;
    
    setLoadingPrices(true);
    try {
      const data = await fetchPriceComparison(productName, brand);
      
      if (maxRetailers !== Infinity) {
        data.retailers = data.retailers.slice(0, maxRetailers);
      }
      
      if (isMounted.current) {
        setPriceComparison(data);
      }
    } catch (err) {
      console.error('Failed to fetch prices:', err);
    } finally {
      if (isMounted.current) {
        setLoadingPrices(false);
      }
    }
  }, [user]);

  // Simulate scan with error handling
  const simulateScan = useCallback(() => {
    if (!canScan()) return;
    
    setIsScanning(true);
    setError('');
    
    setTimeout(async () => {
      if (!isMounted.current) return;
      
      try {
        const randomBarcode = REAL_BARCODES[Math.floor(Math.random() * REAL_BARCODES.length)];
        const product = await fetchProductFromAPI(randomBarcode);
        
        // Sanitize product data
        product.name = ValidationRules.sanitizeInput(product.name);
        product.brand = ValidationRules.sanitizeInput(product.brand);
        
        if (isMounted.current) {
          setScannedProduct(product);
          setIsScanning(false);
          setCurrentScreen('product-detail');
          decrementScans();
          
          if (checkFeatureAccess(user?.tier || 'free', 'maxRetailers') > 3) {
            handleFetchPriceComparison(product.name, product.brand);
          }
        }
      } catch (err) {
        if (isMounted.current) {
          setError('Failed to scan product. Please try again.');
          setIsScanning(false);
        }
      }
    }, 2000);
  }, [canScan, user, decrementScans, handleFetchPriceComparison, navigate]);

  // Manual barcode search with validation
  const searchByBarcode = useCallback(async () => {
    if (!canScan()) return;
    
    // Validate barcode
    const validation = ValidationRules.validateBarcode(manualBarcode);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const product = await fetchProductFromAPI(validation.cleanValue);
      
      // Sanitize product data
      product.name = ValidationRules.sanitizeInput(product.name);
      product.brand = ValidationRules.sanitizeInput(product.brand);
      
      if (isMounted.current) {
        setScannedProduct(product);
        setCurrentScreen('product-detail');
        setManualBarcode('');
        decrementScans();
        
        if (checkFeatureAccess(user?.tier || 'free', 'maxRetailers') > 3) {
          handleFetchPriceComparison(product.name, product.brand);
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Product not found. Please check the barcode and try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [canScan, manualBarcode, user, decrementScans, handleFetchPriceComparison, navigate]);

  // Fetch coupons
  const handleFetchCoupons = useCallback(async (productName, brand, retailer = null) => {
    if (!checkFeatureAccess(user?.tier || 'free', 'hasCoupons')) {
      alert('Coupons are available for Basic and Premium users. Upgrade to access deals!');
      setShowUpgrade(true);
      return;
    }
    
    try {
      const coupons = await fetchCoupons(productName, brand, retailer);
      if (isMounted.current) {
        setAvailableCoupons(coupons);
      }
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    }
  }, [user]);

  // Handle upgrade
  const handleUpgrade = useCallback(async (tier) => {
    const result = await upgradeTier(tier);
    if (result.success) {
      setShowUpgrade(false);
      alert(`Successfully upgraded to ${tier} plan!`);
    } else {
      alert(`Failed to upgrade: ${result.error}`);
    }
  }, [upgradeTier]);

  // Update app settings
  const updateAppSettings = useCallback((newSettings) => {
    setAppSettings(newSettings);
    localStorage.setItem('tulipSettings', JSON.stringify(newSettings));
  }, []);

  // Close all modals helper
  const closeAllModals = useCallback(() => {
    setShowUpgrade(false);
    setShowTerms(false);
    setShowPrivacy(false);
  }, []);

  // Render content based on current route
  const renderContent = () => {
    // Use currentScreen as the source of truth
    const activeRoute = currentScreen;
    
    switch (activeRoute) {
      case 'scanner':
        return (
          <ScannerScreen 
            setCurrentScreen={setCurrentScreen}
            isScanning={isScanning}
            simulateScan={simulateScan}
          />
        );
        
      case 'product-detail':
        return (
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
            onBack={() => setCurrentScreen('home')}
          />
        );
        
      case 'profile':
        return (
          <ProfileScreen 
            user={user}
            setCurrentScreen={setCurrentScreen}
            savedProducts={savedProducts}
          />
        );
        
      case 'settings':
        return (
          <SettingsScreen 
            user={user}
            setCurrentScreen={setCurrentScreen}
            onShowTerms={() => {
              closeAllModals();
              setShowTerms(true);
            }}
            onShowPrivacy={() => {
              closeAllModals();
              setShowPrivacy(true);
            }}
            settings={appSettings}
            updateSettings={updateAppSettings}
          />
        );
        
      case 'subscription':
        return (
          <SubscriptionScreen 
            setCurrentScreen={setCurrentScreen}
            onUpgrade={handleUpgrade}
          />
        );
        
      case 'home':
      default:
        return (
          <HomeScreen 
            setCurrentScreen={setCurrentScreen}
            manualBarcode={manualBarcode}
            setManualBarcode={setManualBarcode}
            searchByBarcode={searchByBarcode}
            isLoading={isLoading}
            error={error}
            savedProducts={savedProducts}
            setScannedProduct={(product) => {
              setScannedProduct(product);
              setCurrentScreen('product-detail');
            }}
            user={user}
            remainingScans={getRemainingScans(user)}
            setShowLogin={onShowLogin}
            compactView={appSettings.display.compactView}
          />
        );
    }
  };

  return (
    <>
      {/* Main content with padding for header */}
      <div className="pt-14 h-screen">
        <PullToRefresh onRefresh={handleRefresh} threshold={80}>
          <Suspense fallback={<ScreenLoader />}>
            {renderContent()}
          </Suspense>
        </PullToRefresh>
      </div>

      {/* Modals */}
      <Suspense fallback={null}>
        {showUpgrade && (
          <UpgradeModal 
            onClose={() => setShowUpgrade(false)} 
            onUpgrade={handleUpgrade} 
          />
        )}
        
        {showTerms && (
          <TermsOfService 
            onClose={() => setShowTerms(false)} 
          />
        )}
        
        {showPrivacy && (
          <PrivacyPolicy 
            onClose={() => setShowPrivacy(false)} 
          />
        )}
      </Suspense>
    </>
  );
};

export default AppContent;