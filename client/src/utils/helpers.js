export const getScoreColor = (score) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const getSafetyColor = (safety) => {
  const colors = {
    excellent: 'text-green-600',
    good: 'text-blue-600',
    moderate: 'text-yellow-600',
    caution: 'text-orange-600',
    avoid: 'text-red-600'
  };
  return colors[safety] || 'text-gray-600';
};

export const getProductEmoji = (category) => {
  if (!category) return '📦';
  const cat = category.toLowerCase();
  if (cat.includes('electronic') || cat.includes('laptop')) return '💻';
  if (cat.includes('audio') || cat.includes('headphone')) return '🎧';
  if (cat.includes('apparel') || cat.includes('clothing') || cat.includes('shirt')) return '👕';
  if (cat.includes('shoe') || cat.includes('footwear')) return '👟';
  if (cat.includes('home') || cat.includes('kitchen')) return '🏠';
  if (cat.includes('sport') || cat.includes('fitness')) return '⚽';
  if (cat.includes('food') || cat.includes('supplement')) return '🥤';
  if (cat.includes('beauty')) return '💄';
  return '📦';
};

export const detectProductCategory = (productName, brand) => {
  const name = productName.toLowerCase();
  const brandLower = brand.toLowerCase();
  
  if (name.includes('laptop') || name.includes('macbook') || brandLower.includes('apple')) return 'electronics';
  if (name.includes('shirt') || name.includes('shoe') || brandLower.includes('nike')) return 'clothing';
  if (name.includes('pot') || name.includes('vacuum')) return 'home';
  if (name.includes('yoga') || name.includes('resistance')) return 'sports';
  return 'general';
};

export const getBasePrice = (category) => {
  const prices = {
    electronics: 500 + Math.random() * 1500,
    clothing: 20 + Math.random() * 180,
    home: 50 + Math.random() * 450,
    sports: 15 + Math.random() * 185,
    general: 10 + Math.random() * 490
  };
  return prices[category] || prices.general;
};

export const getShippingInfo = (retailerName, price) => {
  if (price > 35 || retailerName === 'Amazon') return 'Free Shipping';
  
  // Fix floating-point arithmetic
  const shippingCost = 5 + Math.random() * 10;
  return `$${shippingCost.toFixed(2)} shipping`;
};

// Fixed function with proper floating-point handling
export const applyCouponToPrice = (price, coupon) => {
  // Convert string price to number and handle edge cases
  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum < 0) {
    return price;
  }
  
  let finalPrice = priceNum;
  
  if (coupon.type === 'percentage') {
    // Handle percentage discount with proper rounding
    const discount = priceNum * (coupon.value / 100);
    finalPrice = priceNum - discount;
  } else if (coupon.type === 'fixed') {
    // Handle fixed discount
    finalPrice = priceNum - coupon.value;
  }
  
  // Ensure price doesn't go negative and round to 2 decimal places
  finalPrice = Math.max(0, finalPrice);
  
  // Use proper rounding to avoid floating-point issues
  return (Math.round(finalPrice * 100) / 100).toFixed(2);
};

// New helper function for safe price calculations
export const calculateTotalWithTax = (price, taxRate = 0.08) => {
  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum < 0) {
    return '0.00';
  }
  
  const tax = priceNum * taxRate;
  const total = priceNum + tax;
  
  // Round to 2 decimal places properly
  return (Math.round(total * 100) / 100).toFixed(2);
};

// Helper to format currency consistently
export const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};