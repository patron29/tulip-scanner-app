import React from 'react';
import { ArrowLeft, User, Mail, Package, Star, Shield } from 'lucide-react';
import { TIER_FEATURES } from '../utils/tierConfig';

const ProfileScreen = ({ user, setCurrentScreen, savedProducts }) => {
  const tierInfo = TIER_FEATURES[user.tier];
  const joinDate = new Date(user.joinDate);
  const membershipDays = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));

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
          <h2 className="text-lg font-semibold">My Profile</h2>
          <div className="w-6" /> {/* Spacer for alignment */}
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
              <p className="text-gray-600 text-sm flex items-center justify-center gap-1 mt-1">
                <Mail size={14} />
                {user.email}
              </p>
              <div className="mt-2 flex justify-center">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  user.tier === 'premium' ? 'bg-purple-100 text-purple-700' :
                  user.tier === 'basic' ? 'bg-pink-100 text-pink-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  <Shield size={12} />
                  {tierInfo.name} Member
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                {user.scansThisMonth || 0}
              </p>
              <p className="text-xs text-gray-600">Scans This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                {savedProducts.length}
              </p>
              <p className="text-xs text-gray-600">Saved Products</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                {membershipDays}
              </p>
              <p className="text-xs text-gray-600">Days Member</p>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <User size={20} className="text-purple-600" />
            Account Information
          </h4>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-medium text-gray-800">
                {joinDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {user.authProvider && (
              <div>
                <p className="text-sm text-gray-600">Login Method</p>
                <p className="font-medium text-gray-800 capitalize">
                  {user.authProvider === 'google' ? 'Google Account' : 
                   user.authProvider === 'apple' ? 'Apple ID' : 
                   'Email & Password'}
                </p>
              </div>
            )}

            {user.subscriptionExpiry && (
              <div>
                <p className="text-sm text-gray-600">Subscription Renews</p>
                <p className="font-medium text-gray-800">
                  {new Date(user.subscriptionExpiry).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Package size={20} className="text-purple-600" />
            Usage Statistics
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monthly Scan Limit</span>
              <span className="font-medium">
                {tierInfo.scansPerMonth === 'Unlimited' ? '∞' : tierInfo.scansPerMonth}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Scans Remaining</span>
              <span className="font-medium">
                {user.scansRemaining === Infinity ? '∞' : user.scansRemaining}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Products Saved</span>
              <span className="font-medium">
                {savedProducts.length}/{tierInfo.limitations.maxSavedProducts === Infinity ? '∞' : tierInfo.limitations.maxSavedProducts}
              </span>
            </div>
          </div>

          {/* Progress Bar for Scans */}
          {user.tier !== 'premium' && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${(user.scansThisMonth / tierInfo.scansPerMonth) * 100}%` 
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                {user.scansThisMonth} of {tierInfo.scansPerMonth} scans used
              </p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Star size={20} className="text-purple-600" />
            Recent Activity
          </h4>
          
          {savedProducts.length > 0 ? (
            <div className="space-y-2">
              {savedProducts.slice(-3).reverse().map((product, idx) => (
                <div key={idx} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-current" />
                      <span className="text-sm">{product.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setCurrentScreen('home')}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium mt-2"
              >
                View All Products →
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No products scanned yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;