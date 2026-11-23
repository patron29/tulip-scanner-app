import { detectProductCategory, getBasePrice, getShippingInfo } from '../utils/helpers';
import { RETAILERS } from '../utils/constants';
import { couponTypes } from './mockData';

export const fetchPriceComparison = async (productName, brand) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const category = detectProductCategory(productName, brand);
  const basePrice = getBasePrice(category);
  
  const retailerData = RETAILERS.map(name => {
    const priceVariation = 0.8 + Math.random() * 0.4;
    return {
      name: name,
      price: (basePrice * priceVariation).toFixed(2),
      shipping: getShippingInfo(name, basePrice * priceVariation),
      availability: Math.random() > 0.2 ? 'In Stock' : 'Limited Stock',
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      logo: name.charAt(0)
    };
  });
  
  retailerData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  
  return {
    productName,
    brand,
    retailers: retailerData,
    lowestPrice: retailerData[0].price,
    highestPrice: retailerData[retailerData.length - 1].price,
    averagePrice: (retailerData.reduce((sum, r) => sum + parseFloat(r.price), 0) / retailerData.length).toFixed(2),
    lastUpdated: new Date().toLocaleString()
  };
};

export const fetchCoupons = async (productName, brand, retailer = null) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const randomCoupons = [];
  for (let i = 0; i < 3; i++) {
    const coupon = couponTypes[Math.floor(Math.random() * couponTypes.length)];
    randomCoupons.push({
      ...coupon,
      id: Math.random().toString(36).substr(2, 9),
      retailer: retailer || ['Amazon', 'Target', 'Best Buy'][i % 3],
      expiresIn: Math.floor(Math.random() * 30) + 1,
      successRate: Math.floor(Math.random() * 30) + 70,
      minimumPurchase: coupon.type === 'fixed' ? 100 : 0,
      isExclusive: Math.random() > 0.7
    });
  }
  
  return randomCoupons;
};