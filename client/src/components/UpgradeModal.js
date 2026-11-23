import React, { useEffect } from 'react';
import { Crown, Check, X } from 'lucide-react';
import { TIER_FEATURES } from '../utils/tierConfig';
import { useAuth } from '../contexts/AuthContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

const UpgradeModal = ({ onClose, onUpgrade }) => {
  const { user } = useAuth();
  const currentTier = user?.tier || 'free';
  const focusTrapRef = useFocusTrap(true);

  // Handle escape key
  useEffect(() => {
    const handleEscape = () => {
      onClose();
    };

    const container = focusTrapRef.current;
    if (container) {
      container.addEventListener('modal-escape', handleEscape);
      return () => {
        container.removeEventListener('modal-escape', handleEscape);
      };
    }
  }, [onClose, focusTrapRef]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <div 
        ref={focusTrapRef}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 id="upgrade-modal-title" className="text-2xl font-bold text-gray-800">
              Upgrade Your Plan
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 -m-2 rounded-lg hover:bg-gray-100"
              aria-label="Close upgrade modal"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-gray-600 mt-2 text-center">Choose the plan that works best for you</p>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {Object.entries(TIER_FEATURES).map(([tierKey, tier]) => {
              const isCurrentPlan = currentTier === tierKey;
              const isPremium = tierKey === 'premium';
              
              return (
                <div
                  key={tierKey}
                  className={`relative rounded-xl p-6 ${
                    isPremium
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white transform scale-105'
                      : 'bg-white border-2 border-gray-200'
                  } ${isCurrentPlan ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  {isPremium && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Crown size={16} />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className={`text-2xl font-bold mb-4 ${isPremium ? 'text-white' : 'text-gray-800'}`}>
                      {tier.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`text-4xl font-bold ${isPremium ? 'text-white' : 'text-gray-800'}`}>
                        ${tier.price}
                      </span>
                      {tier.price > 0 && (
                        <span className={`text-sm ${isPremium ? 'text-white/80' : 'text-gray-600'}`}>
                          /month
                        </span>
                      )}
                    </div>
                    <p className={`mt-2 text-sm ${isPremium ? 'text-white/90' : 'text-gray-600'}`}>
                      {typeof tier.scansPerMonth === 'string' ? tier.scansPerMonth : `${tier.scansPerMonth} scans`}
                      {tier.price > 0 && '/month'}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">{tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check 
                          size={20} 
                          className={`mt-0.5 flex-shrink-0 ${isPremium ? 'text-white' : 'text-green-500'}`}
                          aria-hidden="true" 
                        />
                        <span className={`text-sm ${isPremium ? 'text-white/90' : 'text-gray-700'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    {isCurrentPlan ? (
                      <button
                        disabled
                        className={`w-full py-3 rounded-lg font-semibold ${
                          isPremium
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-400'
                        } cursor-not-allowed`}
                        aria-label={`Current plan: ${tier.name}`}
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpgrade(tierKey)}
                        className={`w-full py-3 rounded-lg font-semibold transition-all ${
                          isPremium
                            ? 'bg-white text-indigo-600 hover:bg-gray-100'
                            : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg'
                        }`}
                        aria-label={`${tier.price === 0 ? 'Downgrade' : 'Upgrade'} to ${tier.name} plan`}
                      >
                        {tier.price === 0 ? 'Downgrade' : 'Upgrade Now'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;