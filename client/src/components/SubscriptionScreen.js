import React, { useState } from 'react';
import { ArrowLeft, Crown, Check, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import { TIER_FEATURES } from '../utils/tierConfig';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionScreen = ({ setCurrentScreen, onUpgrade }) => {
  const { user } = useAuth();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [planToUpgrade, setPlanToUpgrade] = useState(null);

  const currentTier = user?.tier || 'free';
  const currentTierInfo = TIER_FEATURES[currentTier];

  const handlePlanChange = (tierKey) => {
    if (tierKey === currentTier) return;
    setPlanToUpgrade(tierKey);
    setShowConfirmModal(true);
  };

  const confirmUpgrade = () => {
    if (planToUpgrade) {
      onUpgrade(planToUpgrade);
      setShowConfirmModal(false);
      alert(`Successfully ${currentTierInfo.price > TIER_FEATURES[planToUpgrade].price ? 'downgraded' : 'upgraded'} to ${TIER_FEATURES[planToUpgrade].name} plan!`);
    }
  };

  // Calculate savings for annual plans
  const calculateAnnualSavings = (monthlyPrice) => {
    const yearlyPrice = monthlyPrice * 10; // 2 months free
    const savings = (monthlyPrice * 12) - yearlyPrice;
    return { yearlyPrice: yearlyPrice.toFixed(2), savings: savings.toFixed(2) };
  };

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
          <h2 className="text-lg font-semibold">Manage Subscription</h2>
          <div className="w-6" />
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Current Plan Summary */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-pink-200">
          <h3 className="font-semibold text-lg mb-4 text-center text-gray-800">Current Plan</h3>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  {currentTierInfo.name}
                </p>
                <span className="text-sm text-gray-700">Plan</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-gray-800">${currentTierInfo.price}</span>
                <span className="text-gray-700">/month</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">
                {typeof currentTierInfo.scansPerMonth === 'string' 
                  ? currentTierInfo.scansPerMonth 
                  : `${currentTierInfo.scansPerMonth} scans per month`}
              </p>
            </div>
            <div className={`p-4 rounded-full shadow-md ${
              currentTier === 'premium' ? 'bg-gradient-to-br from-purple-100 to-purple-200' :
              currentTier === 'basic' ? 'bg-gradient-to-br from-pink-100 to-pink-200' :
              'bg-gradient-to-br from-gray-100 to-gray-200'
            }`}>
              <Crown size={36} className={
                currentTier === 'premium' ? 'text-purple-600' :
                currentTier === 'basic' ? 'text-pink-600' :
                'text-gray-600'
              } />
            </div>
          </div>

          {user?.subscriptionExpiry && (
            <div className="mt-4 bg-white bg-opacity-60 rounded-lg p-3 flex items-center gap-2">
              <Calendar size={16} className="text-gray-700" />
              <p className="text-sm text-gray-800">
                {currentTier === 'free' ? 'Free forever' : `Renews on ${new Date(user.subscriptionExpiry).toLocaleDateString()}`}
              </p>
            </div>
          )}
        </div>

        {/* Usage Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-600" />
            This Month's Usage
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-700">
                {user?.scansThisMonth || 0}
              </p>
              <p className="text-xs text-gray-600">Scans Used</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-pink-700">
                {user?.scansRemaining === Infinity ? '∞' : user?.scansRemaining || 0}
              </p>
              <p className="text-xs text-gray-600">Scans Left</p>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg px-2 text-center">Available Plans</h3>
          
          {Object.entries(TIER_FEATURES).map(([tierKey, tier]) => {
            const isCurrentPlan = currentTier === tierKey;
            const isPremium = tierKey === 'premium';
            const isDowngrade = currentTierInfo.price > tier.price;
            
            return (
              <div
                key={tierKey}
                className={`bg-white rounded-2xl shadow-lg p-6 relative ${
                  isCurrentPlan ? 'ring-2 ring-purple-500' : ''
                } ${!isCurrentPlan ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''}`}
                onClick={() => !isCurrentPlan && handlePlanChange(tierKey)}
              >
                {isPremium && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      BEST VALUE
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h4 className="text-xl font-bold text-gray-800">{tier.name}</h4>
                  <div className="flex items-baseline gap-1 mt-1 justify-center">
                    <span className="text-3xl font-bold">${tier.price}</span>
                    {tier.price > 0 && <span className="text-gray-600">/month</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {typeof tier.scansPerMonth === 'string' ? tier.scansPerMonth : `${tier.scansPerMonth} scans/month`}
                  </p>
                  
                  {isCurrentPlan && (
                    <div className="mt-3">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        Current
                      </span>
                    </div>
                  )}
                  {!isCurrentPlan && isDowngrade && (
                    <div className="mt-3">
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                        Downgrade
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-center mb-4">
                  <ul className="space-y-2 text-left">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {!isCurrentPlan && (
                  <button className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    isDowngrade 
                      ? 'bg-orange-500 text-white hover:bg-orange-600' 
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg'
                  }`}>
                    {isDowngrade ? 'Downgrade Plan' : 'Upgrade Now'}
                  </button>
                )}

                {/* Annual pricing option */}
                {tier.price > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Pay Annually</p>
                        <p className="text-xs text-gray-600">
                          ${calculateAnnualSavings(tier.price).yearlyPrice}/year
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                        Save ${calculateAnnualSavings(tier.price).savings}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Payment Methods */}
        {currentTier !== 'free' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-purple-600" />
              Payment Method
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-xs text-gray-600">Expires 12/25</p>
                </div>
              </div>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                Change
              </button>
            </div>
          </div>
        )}

        {/* Cancel Subscription */}
        {currentTier !== 'free' && (
          <div className="text-center">
            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
              Cancel Subscription
            </button>
            <p className="text-xs text-gray-500 mt-1">
              You'll keep access until the end of your billing period
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && planToUpgrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Confirm Plan Change</h3>
            <p className="text-gray-600 mb-6">
              {currentTierInfo.price > TIER_FEATURES[planToUpgrade].price
                ? `Are you sure you want to downgrade from ${currentTierInfo.name} to ${TIER_FEATURES[planToUpgrade].name}? You'll lose access to some features.`
                : `Upgrade to ${TIER_FEATURES[planToUpgrade].name} for $${TIER_FEATURES[planToUpgrade].price}/month?`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpgrade}
                className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionScreen;