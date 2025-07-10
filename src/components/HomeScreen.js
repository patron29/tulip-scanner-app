import React, { useState } from 'react';
import { Camera, Package, Loader, Crown, AlertCircle, Search } from 'lucide-react';
import { getProductEmoji } from '../utils/helpers';
import TulipLogo from './TulipLogo';

const HomeScreen = ({ 
  setCurrentScreen, 
  manualBarcode, 
  setManualBarcode, 
  searchByBarcode, 
  isLoading, 
  error, 
  savedProducts, 
  setScannedProduct,
  user,
  remainingScans,
  setShowLogin,
  compactView = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter saved products based on search query
  const filteredProducts = savedProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-green-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Logo and Title Section - Centered */}
        <div className="text-center mb-8 pt-8">
          <div className="flex justify-center mb-4">
            <TulipLogo size="xlarge" className="animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2">
            Tulip
          </h1>
          <p className="text-gray-600">Bloom into smart shopping • Compare • Save</p>
        </div>

        {/* Scan Counter Card - Centered Content */}
        {user && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 text-center">Remaining Scans</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mt-1 text-center">
                  {remainingScans === 'Unlimited' ? '∞' : remainingScans}
                </p>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {user.tier === 'premium' ? 'Unlimited scans' : `of ${user.tier === 'basic' ? '100' : '5'} this month`}
                </p>
              </div>
              <div className={`p-4 rounded-full flex-shrink-0 ${
                user.tier === 'premium' ? 'bg-purple-100' :
                user.tier === 'basic' ? 'bg-pink-100' :
                'bg-gray-100'
              }`}>
                {user.tier === 'premium' ? (
                  <Crown size={32} className="text-purple-600" />
                ) : (
                  <Camera size={32} className={
                    user.tier === 'basic' ? 'text-pink-600' : 'text-gray-600'
                  } />
                )}
              </div>
            </div>
            
            {/* Low scans warning */}
            {remainingScans !== 'Unlimited' && remainingScans <= 2 && remainingScans > 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle size={16} className="text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-800 text-center flex-1">
                  Only {remainingScans} scan{remainingScans !== 1 ? 's' : ''} left! Consider upgrading for more.
                </p>
              </div>
            )}
            
            {/* No scans left */}
            {remainingScans === 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 font-medium text-center">
                  You've used all your scans this month!
                </p>
                <p className="text-xs text-red-600 mt-1 text-center">
                  Upgrade to continue scanning products.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Guest User Message - Centered */}
        {!user && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-center mb-4">
              <TulipLogo size="large" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
              Welcome to Tulip
            </h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Create a free account to get 5 scans per month
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowLogin(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all"
              >
                Sign In / Sign Up
              </button>
            </div>
          </div>
        )}

        {/* Scan Button - Already Centered */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <button
            onClick={() => setCurrentScreen('scanner')}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full py-6 flex items-center justify-center gap-3 hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
            disabled={!user || remainingScans === 0}
          >
            <Camera size={28} />
            <span className="text-xl font-semibold">
              {!user ? 'Sign In to Scan' : remainingScans === 0 ? 'Upgrade to Scan' : 'Scan Any Product'}
            </span>
          </button>
        </div>

        {/* Manual Barcode Entry - Centered Title */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Enter Barcode Manually</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter barcode number..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-400 text-center"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchByBarcode()}
                disabled={!user || remainingScans === 0}
              />
              <button
                onClick={searchByBarcode}
                disabled={isLoading || !user || remainingScans === 0}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader className="animate-spin" size={20} /> : 'Search'}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}
            <p className="text-xs text-gray-500 mt-2 text-center">
              Try: 0885909950805 (MacBook) or 0195678901234 (Yoga Mat)
            </p>
          </div>
        </div>

        {/* Recently Scanned - Already Well Aligned */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <Package size={20} className="text-pink-600" />
            Recently Scanned ({savedProducts.length})
            {user && (
              <span className="text-xs text-gray-500 ml-2">
                {savedProducts.length}/{user.tier === 'free' ? '10' : user.tier === 'basic' ? '100' : '∞'}
              </span>
            )}
          </h2>
          
          {/* Search Bar */}
          {savedProducts.length > 3 && (
            <div className="mb-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400"
                />
              </div>
            </div>
          )}
          
          {savedProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No scanned products yet</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No products match your search</p>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setScannedProduct(product);
                    setCurrentScreen('product-detail');
                  }}
                  className={`flex items-center gap-3 ${compactView ? 'p-2' : 'p-3'} bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors`}
                >
                  <div className={compactView ? 'text-2xl' : 'text-3xl'}>{getProductEmoji(product.category)}</div>
                  <div className="flex-1">
                    <p className={`font-medium text-gray-800 ${compactView ? 'text-sm' : ''}`}>{product.name}</p>
                    <p className={`text-gray-500 ${compactView ? 'text-xs' : 'text-sm'}`}>{product.brand}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className={`font-medium ${compactView ? 'text-xs' : 'text-sm'}`}>⭐ {product.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Saved products limit warning */}
          {user && user.tier === 'free' && savedProducts.length >= 8 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800 text-center">
                You're approaching the 10 product limit for free accounts. Upgrade to save more!
              </p>
            </div>
          )}
        </div>

        {/* Tier Benefits Card - Centered */}
        {user && user.tier === 'free' && (
          <div className="mt-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white text-center">
            <h3 className="text-lg font-semibold mb-2">🌷 Bloom with Premium</h3>
            <p className="text-sm opacity-90 mb-4">
              Upgrade to get unlimited scans, access to coupons, and full price comparisons!
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setCurrentScreen('upgrade')}
                className="bg-white text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-2 rounded-full text-sm font-semibold bg-white hover:bg-gray-100 transition-colors"
              >
                View Plans
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;