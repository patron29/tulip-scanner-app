import React from 'react';
import { Search, Loader, Star } from 'lucide-react';
import { applyCouponToPrice } from '../utils/helpers';

const PriceComparison = ({ 
  priceComparison, 
  loadingPrices, 
  fetchPriceComparison, 
  fetchCoupons,
  appliedCoupon,
  productName,
  productBrand 
}) => {
  return (
    <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
      <h4 className="font-semibold text-lg mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Search size={20} className="text-purple-600" />
          Price Comparison
        </span>
        {priceComparison && (
          <button
            onClick={() => fetchPriceComparison(productName, productBrand)}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            Refresh
          </button>
        )}
      </h4>
      
      {loadingPrices ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin text-purple-600" size={32} />
          <span className="ml-3 text-gray-600">Checking prices across retailers...</span>
        </div>
      ) : priceComparison ? (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Lowest</p>
              <p className="text-xl font-bold text-green-600">${priceComparison.lowestPrice}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Average</p>
              <p className="text-xl font-bold text-blue-600">${priceComparison.averagePrice}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Highest</p>
              <p className="text-xl font-bold text-orange-600">${priceComparison.highestPrice}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {priceComparison.retailers.map((retailer, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">{retailer.logo}</span>
                    <div>
                      <p className="font-medium">{retailer.name}</p>
                      <p className="text-sm text-gray-600">{retailer.shipping}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{retailer.availability}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">{retailer.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">
                      {appliedCoupon && appliedCoupon.retailer === retailer.name ? (
                        <>
                          <span className="line-through text-gray-400 text-lg">${retailer.price}</span>
                          <span className="text-green-600 ml-2">${applyCouponToPrice(retailer.price, appliedCoupon)}</span>
                        </>
                      ) : (
                        `$${retailer.price}`
                      )}
                    </p>
                    {idx === 0 && !appliedCoupon && (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">Best Price</span>
                    )}
                  </div>
                </div>
                
                <div className="border-t px-4 py-3 bg-purple-50">
                  <button
                    onClick={() => fetchCoupons(productName, productBrand, retailer.name)}
                    className="text-sm text-purple-700 font-medium hover:text-purple-800"
                  >
                    🎟️ View available coupons
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <button
          onClick={() => fetchPriceComparison(productName, productBrand)}
          className="w-full py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          Check Prices Across Retailers
        </button>
      )}
    </div>
  );
};

export default PriceComparison;