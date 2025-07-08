import React from 'react';
import { Sparkles } from 'lucide-react';

const CouponList = ({ availableCoupons, appliedCoupon, setAppliedCoupon, setAvailableCoupons }) => {
  if (availableCoupons.length === 0) return null;

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
      <h4 className="font-semibold text-lg mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Sparkles size={20} className="text-purple-600" />
          Available Coupons
        </span>
        <button
          onClick={() => {
            setAvailableCoupons([]);
            setAppliedCoupon(null);
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear
        </button>
      </h4>
      
      <div className="space-y-3">
        {availableCoupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              appliedCoupon?.id === coupon.id 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => setAppliedCoupon(coupon.id === appliedCoupon?.id ? null : coupon)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-purple-700 text-lg">{coupon.code}</span>
                  {coupon.isExclusive && (
                    <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full">EXCLUSIVE</span>
                  )}
                </div>
                <p className="text-sm text-gray-700">{coupon.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{coupon.retailer}</span>
                  <span>•</span>
                  <span>Expires in {coupon.expiresIn} days</span>
                </div>
              </div>
              <div className="text-right ml-4">
                {coupon.type === 'percentage' && (
                  <p className="text-2xl font-bold text-green-600">{coupon.value}%</p>
                )}
                {coupon.type === 'fixed' && (
                  <p className="text-2xl font-bold text-green-600">${coupon.value}</p>
                )}
                {coupon.type === 'freeship' && (
                  <p className="text-sm font-bold text-green-600">FREE SHIP</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouponList;