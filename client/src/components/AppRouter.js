// AppRouter.js - New Router Component
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';
import TulipLogo from './TulipLogo';

// Lazy load all screens
const HomeScreen = lazy(() => import('./HomeScreen'));
const ScannerScreen = lazy(() => import('./ScannerScreen'));
const ProductDetailScreen = lazy(() => import('./ProductDetailScreen'));
const ProfileScreen = lazy(() => import('./ProfileScreen'));
const SettingsScreen = lazy(() => import('./SettingsScreen'));
const SubscriptionScreen = lazy(() => import('./SubscriptionScreen'));

// Loading component
const ScreenLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
    <div className="text-center">
      <TulipLogo size="large" className="animate-pulse mx-auto mb-4" />
      <Loader className="animate-spin text-purple-600 mx-auto" size={32} />
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRouter = ({ 
  manualBarcode,
  setManualBarcode,
  searchByBarcode,
  isLoading,
  error,
  savedProducts,
  scannedProduct,
  setScannedProduct,
  onShowLogin,
  appSettings,
  simulateScan,
  isScanning,
  saveProduct,
  priceComparison,
  loadingPrices,
  handleFetchPriceComparison,
  handleFetchCoupons,
  availableCoupons,
  appliedCoupon,
  setAppliedCoupon,
  setAvailableCoupons,
  setShowUpgrade,
  updateAppSettings,
  handleUpgrade,
  setShowTerms,
  setShowPrivacy
}) => {
  const { user } = useAuth();
  
  return (
    <Suspense fallback={<ScreenLoader />}>
      <Routes>
        <Route 
          path="/" 
          element={
            <HomeScreen
              manualBarcode={manualBarcode}
              setManualBarcode={setManualBarcode}
              searchByBarcode={searchByBarcode}
              isLoading={isLoading}
              error={error}
              savedProducts={savedProducts}
              setScannedProduct={setScannedProduct}
              user={user}
              setShowLogin={onShowLogin}
              compactView={appSettings.display.compactView}
            />
          } 
        />
        
        <Route 
          path="/scan" 
          element={
            <ProtectedRoute>
              <ScannerScreen
                isScanning={isScanning}
                simulateScan={simulateScan}
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/product/:barcode" 
          element={
            <ProtectedRoute>
              <ProductDetailScreen
                scannedProduct={scannedProduct}
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
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfileScreen
                user={user}
                savedProducts={savedProducts}
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <SettingsScreen
                user={user}
                onShowTerms={setShowTerms}
                onShowPrivacy={setShowPrivacy}
                settings={appSettings}
                updateSettings={updateAppSettings}
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/subscription" 
          element={
            <ProtectedRoute>
              <SubscriptionScreen
                onUpgrade={handleUpgrade}
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;