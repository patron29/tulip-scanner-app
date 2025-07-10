import React, { useState } from 'react';
import { ArrowLeft, Crown, Check, X, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TIER_FEATURES } from '../utils/tierConfig';

const ManageSubscriptionScreen = ({ setCurrentScreen }) => {
  const { user, upgradeTier } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(user?.tier || 'free');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const currentTier = user?.tier || 'free';
  const hasActiveSubscription = currentTier !== 'free';
  
  const handlePlanChange = (newPlan) => {
    if (newPlan === currentTier) return;
    
    if (newPlan === 'free') {
      setShowCancelModal(true);
    } else {
      setSelectedPlan(newPlan);
      setShowPaymentModal(true);
    }
  };
  
  const handleConfirmUpgrade = () => {
    upgradeTier(selectedPlan);
    setShowPaymentModal(false);
    alert(`Successfully upgraded to ${selectedPlan} plan!`);
  };
  
  const handleCancelSubscription = () => {
    upgradeTier('free');
    setShowCancelModal(false);
    alert('Your subscription has been cancelled. You will retain access until the end of your billing period.');
  };
  
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-30">
        <div className="max-w-md mx-auto p-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('home')}
            className="text-purple-600"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-semibold">Manage Subscription</h2>
          <div className="w-6" />
        </div>
      </div>
      
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Current Plan Status */}
        {hasActiveSubscription && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Current Subscription</h3>
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xl font-bold">{TIER_FEATURES[currentTier].name} Plan</p>
                  <p className="text-gray-600">${TIER_FEATURES[currentTier].price}/month</p>
                </div>
                <Crown size={32} className="text-purple-600" />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Next billing date</span>
                  <span className="font-medium">{nextBillingDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment method</span>
                  <span className="font-medium flex items-center gap-1">
                    <CreditCard size={16} />
                    •••• 4242
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowCancelModal(true)}
              className="mt-4 text-red-600 text-sm font-medium hover:text-red-700"
            >
              Cancel Subscription
            </button>
          </div>
        )}
        
        {/* Available Plans */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Choose Your Plan</h3>
          
          <div className="space-y-4">
            {Object.entries(TIER_FEATURES).map(([tierKey, tier]) => {
              const isCurrentPlan = currentTier === tierKey;
              const isPremium = tierKey === 'premium';
              
              return (
                <div
                  key={tierKey}
                  onClick={() => !isCurrentPlan && handlePlanChange(tierKey)}
                  className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    isCurrentPlan
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  {isPremium && !isCurrentPlan && (
                    <div className="absolute -top-3 left-4">
                      <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-semibold">
                        RECOMMENDED
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold">{tier.name}</h4>
                        {isCurrentPlan && (
                          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                            CURRENT
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 mb-3">
                        <span className="text-2xl font-bold">
                          {tier.price === 0 ? 'Free' : `$${tier.price}`}
                        </span>
                        {tier.price > 0 && <span className="text-gray-600">/month</span>}
                      </div>
                      
                      <ul className="space-y-2">
                        {tier.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {tier.features.length > 3 && (
                        <p className="text-xs text-gray-500 mt-2">
                          +{tier.features.length - 3} more features
                        </p>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isCurrentPlan
                          ? 'bg-purple-600 border-purple-600'
                          : 'border-gray-300'
                      }`}>
                        {isCurrentPlan && <Check size={14} className="text-white" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Billing History */}
        {hasActiveSubscription && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-purple-600" />
              Billing History
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Basic Plan</p>
                  <p className="text-sm text-gray-500">January 9, 2025</p>
                </div>
                <span className="font-semibold">$4.99</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Basic Plan</p>
                  <p className="text-sm text-gray-500">December 9, 2024</p>
                </div>
                <span className="font-semibold">$4.99</span>
              </div>
            </div>
            
            <button className="mt-4 text-purple-600 text-sm font-medium">
              Download All Invoices
            </button>
          </div>
        )}
        
        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-800">Can I change plans anytime?</p>
              <p className="text-sm text-gray-600 mt-1">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-800">What happens to my scans if I downgrade?</p>
              <p className="text-sm text-gray-600 mt-1">
                Your scan history and saved products remain accessible, but you'll be limited by your new plan's monthly scan limit.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-800">Do unused scans roll over?</p>
              <p className="text-sm text-gray-600 mt-1">
                No, unused scans do not roll over to the next month. Your scan count resets at the beginning of each billing cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Confirm Plan Change</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">Upgrading to:</p>
              <p className="text-xl font-bold">{TIER_FEATURES[selectedPlan].name} Plan</p>
              <p className="text-lg text-purple-600">${TIER_FEATURES[selectedPlan].price}/month</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <CreditCard size={20} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Card number"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                  defaultValue="•••• •••• •••• 4242"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="px-3 py-2 border border-gray-200 rounded-lg"
                  defaultValue="12/25"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  className="px-3 py-2 border border-gray-200 rounded-lg"
                  defaultValue="•••"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpgrade}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Cancel Subscription?</h3>
            </div>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to cancel your subscription? You'll lose access to:
            </p>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <X size={16} className="text-red-500" />
                Unlimited scans (Premium) or 100 scans (Basic)
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <X size={16} className="text-red-500" />
                Access to exclusive coupons
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <X size={16} className="text-red-500" />
                Price history and alerts
              </li>
            </ul>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubscriptionScreen;