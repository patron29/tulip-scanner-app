import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
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

const AppContent = ({ onShowLogin }) => {
  const { user, decrementScans, upgradeTier } = useAuth();
  const { currentRoute, navigate, goBack, routeParams } = useRouter();
  const [showUpgrade, setShowUpgrade] = useState(false);
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

  // Listen for navigation events (kept for compatibility)
  useEffect(() => {
    const handleNavigate = (event) => {
      navigate(event.detail);
    };

    const handleShowUpgrade = () => {
      setShowUpgrade(true);
    };

    window.addEventListener('navigate', handleNavigate);
    window.addEventListener('showUpgrade', handleShowUpgrade);

    return () => {
      window.removeEventListener('navigate', handleNavigate);
      window.removeEventListener('showUpgrade', handleShowUpgrade);
    };
  }, [navigate]);

  // Apply dark mode
  useEffect(() => {
    if (appSettings.display.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [appSettings.display.darkMode]);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
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
      if (saved) {
        setSavedProducts(JSON.parse(saved));
      }
      
      // Clear any errors
      setError('');
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
    const userTier = user?.tier || 'free';
    const maxRetailers = TIER_FEATURES[userTier].limitations.maxRetailers;
    
    setLoadingPrices(true);
    try {
      const data = await fetchPriceComparison(productName, brand);
      
      if (maxRetailers !== Infinity) {
        data.retailers = data.retailers.slice(0, maxRetailers);
      }
      
      setPriceComparison(data);
    } catch (err) {
      console.error('Failed to fetch prices:', err);
    } finally {
      setLoadingPrices(false);
    }
  }, [user]);

  // Simulate scan with error handling
  const simulateScan = useCallback(() => {
    if (!canScan()) return;
    
    setIsScanning(true);
    setError('');
    
    setTimeout(async () => {
      try {
        const randomBarcode = REAL_BARCODES[Math.floor(Math.random() * REAL_BARCODES.length)];
        const product = await fetchProductFromAPI(randomBarcode);
        
        // Sanitize product data
        product.name = ValidationRules.sanitizeInput(product.name);
        product.brand = ValidationRules.sanitizeInput(product.brand);
        
        setScannedProduct(product);
        setIsScanning(false);
        navigate('product-detail', { productId: product.barcode });
        decrementScans();
        
        if (checkFeatureAccess(user?.tier || 'free', 'maxRetailers') > 3) {
          handleFetchPriceComparison(product.name, product.brand);
        }
      } catch (err) {
        setError('Failed to scan product. Please try again.');
        setIsScanning(false);
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
      
      setScannedProduct(product);
      navigate('product-detail', { productId: product.barcode });
      setManualBarcode('');
      decrementScans();
      
      if (checkFeatureAccess(user?.tier || 'free', 'maxRetailers') > 3) {
        handleFetchPriceComparison(product.name, product.brand);
      }
    } catch (err) {
      setError('Product not found. Please check the barcode and try again.');
    } finally {
      setIsLoading(false);
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
      setAvailableCoupons(coupons);
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
    switch (currentRoute) {
      case 'scanner':
        return (
          <ScannerScreen 
            setCurrentScreen={navigate}
            isScanning={isScanning}
            simulateScan={simulateScan}
          />
        );
        
      case 'product-detail':
        return (
          <ProductDetailScreen 
            scannedProduct={scannedProduct}
            setCurrentScreen={navigate}
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
            onBack={goBack}
          />
        );
        
      case 'profile':
        return (
          <ProfileScreen 
            user={user}
            setCurrentScreen={navigate}
            savedProducts={savedProducts}
          />
        );
        
      case 'settings':
        return (
          <SettingsScreen 
            user={user}
            setCurrentScreen={navigate}
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
            setCurrentScreen={navigate}
            onUpgrade={handleUpgrade}
          />
        );
        
      case 'home':
      default:
        return (
          <HomeScreen 
            setCurrentScreen={navigate}
            manualBarcode={manualBarcode}
            setManualBarcode={setManualBarcode}
            searchByBarcode={searchByBarcode}
            isLoading={isLoading}
            error={error}
            savedProducts={savedProducts}
            setScannedProduct={(product) => {
              setScannedProduct(product);
              navigate('product-detail', { productId: product.barcode });
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