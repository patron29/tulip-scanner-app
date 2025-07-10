import React from 'react';
import { X, Star, Shield, Check, AlertCircle, Lock, Crown, Eye } from 'lucide-react';
import { getScoreColor, getProductEmoji } from '../utils/helpers';
import { checkFeatureAccess, TIER_FEATURES } from '../utils/tierConfig';
import PriceComparison from './PriceComparison';
import CouponList from './CouponList';
import PriceHistoryChart from './PriceHistoryChart';

const ProductDetailScreen = ({ 
  scannedProduct, 
  setCurrentScreen, 
  saveProduct, 
  savedProducts,
  priceComparison,
  loadingPrices,
  fetchPriceComparison,
  fetchCoupons,
  availableCoupons,
  appliedCoupon,
  setAppliedCoupon,
  setAvailableCoupons,
  userTier = 'free',
  setShowUpgrade,
  showPrices = true
}) => {
  if (!scannedProduct) return null;
  
  const isSaved = savedProducts.find(p => p.barcode === scannedProduct.barcode);
  const tierLimits = TIER_FEATURES[userTier].limitations;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="bg-white shadow-lg">
        <div className="max-w-md mx-auto p-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('home')}
            className="text-purple-600"
          >
            <X size={24} />
          </button>
          <h2 className="text-lg font-semibold">Product Analysis</h2>
          <button
            onClick={() => saveProduct(scannedProduct)}
            className={`${isSaved ? 'text-purple-600' : 'text-gray-400'}`}
          >
            <Star size={24} className={isSaved ? 'fill-current' : ''} />
          </button>
        </div>
      </div>
      
      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="text-5xl">{getProductEmoji(scannedProduct.category)}</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">{scannedProduct.name}</h3>
              <p className="text-gray-600">{scannedProduct.brand}</p>
              <p className="text-sm text-gray-500 mt-1">{scannedProduct.category}</p>
              <p className="text-xs text-gray-400 mt-2">Barcode: {scannedProduct.barcode}</p>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={20} className="text-yellow-500 fill-current" />
              <span className="font-semibold text-lg">{scannedProduct.rating}</span>
              <span className="text-gray-500 text-sm">/5</span>
            </div>
            
            {scannedProduct.isHealthProduct && scannedProduct.healthScore !== null && (
              <div className="flex items-center gap-2">
                <div className={`w-24 h-8 rounded-full ${getScoreColor(scannedProduct.healthScore)} relative overflow-hidden`}>
                  <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
                    {scannedProduct.healthScore}/100
                  </div>
                </div>
                <span className="text-sm text-gray-600">Health Score</span>
              </div>
            )}
          </div>
        </div>
        
        {scannedProduct.certifications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Shield size={20} className="text-purple-600" />
              Certifications
            </h4>
            <div className="flex flex-wrap gap-2">
              {scannedProduct.certifications.map((cert, idx) => (
                <span key={idx} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <h4 className="font-semibold text-lg mb-3">Product Details</h4>
          <p className="text-sm text-gray-600 mb-4 italic">{scannedProduct.ingredients_text}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 rounded-2xl p-4">
            <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-1">
              <Check size={18} />
              Pros
            </h5>
            <ul className="text-sm text-green-700 space-y-1">
              {scannedProduct.pros.map((pro, idx) => (
                <li key={idx}>• {pro}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-orange-50 rounded-2xl p-4">
            <h5 className="font-semibold text-orange-800 mb-2 flex items-center gap-1">
              <AlertCircle size={18} />
              Notes
            </h5>
            <ul className="text-sm text-orange-700 space-y-1">
              {scannedProduct.cons.map((con, idx) => (
                <li key={idx}>• {con}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Price History Chart - Premium Feature */}
        {checkFeatureAccess(userTier, 'hasPriceHistory') ? (
          <PriceHistoryChart productName={scannedProduct.name} />
        ) : (
          <div className="bg-gray-100 rounded-2xl p-6 mb-4 text-center">
            <Lock size={32} className="text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Price History Locked</h3>
            <p className="text-sm text-gray-600 mb-4">
              Track price trends over time with Basic or Premium plans
            </p>
            <button 
              onClick={() => setShowUpgrade && setShowUpgrade(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700"
            >
              Upgrade to View
            </button>
          </div>
        )}
        
        {/* Price Comparison - Limited for Free Users */}
        {showPrices && tierLimits.maxRetailers > 0 ? (
          <>
            {userTier === 'free' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Free users see only {tierLimits.maxRetailers} retailers. Upgrade for full comparison!
                </p>
              </div>
            )}
            <PriceComparison 
              priceComparison={priceComparison}
              loadingPrices={loadingPrices}
              fetchPriceComparison={fetchPriceComparison}
              fetchCoupons={fetchCoupons}
              appliedCoupon={appliedCoupon}
              productName={scannedProduct.name}
              productBrand={scannedProduct.brand}
            />
          </>
        ) : showPrices ? (
          <div className="bg-gray-100 rounded-2xl p-6 mb-4 text-center">
            <Lock size={32} className="text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Price Comparison Locked</h3>
            <p className="text-sm text-gray-600 mb-4">
              Compare prices across all retailers with our paid plans
            </p>
            <button 
              onClick={() => setShowUpgrade && setShowUpgrade(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700"
            >
              Upgrade Now
            </button>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-2xl p-6 mb-4 text-center">
            <Eye size={32} className="text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Price Display Disabled</h3>
            <p className="text-sm text-gray-600">
              Enable "Show Prices" in Settings to view price comparisons
            </p>
          </div>
        )}
        
        {/* Coupons - Basic & Premium Only */}
        {checkFeatureAccess(userTier, 'hasCoupons') ? (
          <CouponList 
            availableCoupons={availableCoupons}
            appliedCoupon={appliedCoupon}
            setAppliedCoupon={setAppliedCoupon}
            setAvailableCoupons={setAvailableCoupons}
          />
        ) : (
          <div className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-center border-2 border-purple-200">
            <Crown size={32} className="text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">🎟️ Unlock Exclusive Coupons</h3>
            <p className="text-sm text-gray-600 mb-4">
              Basic and Premium users get access to exclusive deals and coupons that can save you money!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500">Basic Plan</p>
                <p className="font-bold text-lg">$4.99/mo</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500">Premium Plan</p>
                <p className="font-bold text-lg">$9.99/mo</p>
              </div>
            </div>
            <button 
              onClick={() => setShowUpgrade && setShowUpgrade(true)}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-purple-700 transition-colors"
            >
              View All Plans
            </button>
          </div>
        )}
        
        {/* Export Data - Basic & Premium Only */}
        {checkFeatureAccess(userTier, 'hasExportData') && (
          <div className="mt-4 text-center">
            <button 
              onClick={() => {
                const exportData = {
                  product: scannedProduct,
                  priceComparison: priceComparison,
                  exportDate: new Date().toISOString()
                };
                const dataStr = JSON.stringify(exportData, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = `${scannedProduct.name.replace(/\s+/g, '_')}_data.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              📥 Export Product Data
            </button>
          </div>
        )}
        
        {/* Price Alerts - Premium Only */}
        {checkFeatureAccess(userTier, 'hasPriceAlerts') ? (
          <div className="mt-4 bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-sm text-purple-700 font-medium">
              🔔 Set up price alerts for this product (Premium feature)
            </p>
          </div>
        ) : userTier === 'basic' && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Upgrade to Premium for price drop alerts
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailScreen;