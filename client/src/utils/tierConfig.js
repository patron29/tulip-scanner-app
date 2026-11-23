export const TIER_FEATURES = {
    free: {
      name: 'Free',
      price: 0,
      scansPerMonth: 5,
      features: [
        'Basic barcode scanning',
        'View product details',
        'Limited price comparison (3 retailers)',
        'Basic product info',
        'Save up to 10 products'
      ],
      limitations: {
        maxScans: 5,
        maxSavedProducts: 10,
        maxRetailers: 3,
        hasCoupons: false,
        hasPriceHistory: false,
        hasExportData: false,
        hasAdvancedFilters: false,
        hasPriceAlerts: false
      }
    },
    basic: {
      name: 'Basic',
      price: 4.99,
      scansPerMonth: 100,
      features: [
        'Everything in Free',
        '100 scans per month',
        'Full price comparison (all retailers)',
        'Access to coupons & deals',
        'Save up to 100 products',
        'Price history charts',
        'Export scan history'
      ],
      limitations: {
        maxScans: 100,
        maxSavedProducts: 100,
        maxRetailers: Infinity,
        hasCoupons: true,
        hasPriceHistory: true,
        hasExportData: true,
        hasAdvancedFilters: false,
        hasPriceAlerts: false
      }
    },
    premium: {
      name: 'Premium',
      price: 9.99,
      scansPerMonth: 'Unlimited',
      features: [
        'Everything in Basic',
        'Unlimited scans',
        'Price drop alerts',
        'Advanced product filters',
        'Priority customer support',
        'API access',
        'Bulk scanning',
        'Custom shopping lists',
        'Family sharing (up to 5 users)'
      ],
      limitations: {
        maxScans: Infinity,
        maxSavedProducts: Infinity,
        maxRetailers: Infinity,
        hasCoupons: true,
        hasPriceHistory: true,
        hasExportData: true,
        hasAdvancedFilters: true,
        hasPriceAlerts: true
      }
    }
  };
  
  export const checkFeatureAccess = (userTier, feature) => {
    if (!userTier || !TIER_FEATURES[userTier]) return false;
    return TIER_FEATURES[userTier].limitations[feature];
  };
  
  export const getRemainingScans = (user) => {
    if (!user) return 0;
    if (user.tier === 'premium') return 'Unlimited';
    return user.scansRemaining;
  };