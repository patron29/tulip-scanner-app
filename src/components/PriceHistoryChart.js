import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

const PriceHistoryChart = ({ productName }) => {
  // Generate mock price history data
  const generatePriceHistory = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const basePrice = 50 + Math.random() * 150;
    
    return months.map((month, index) => {
      // Create some realistic price fluctuation
      const variation = (Math.random() - 0.5) * 20;
      const price = Math.max(10, basePrice + variation + (index * 2));
      return {
        month,
        price: price.toFixed(2)
      };
    });
  };

  const priceData = generatePriceHistory();
  const maxPrice = Math.max(...priceData.map(d => parseFloat(d.price)));
  const minPrice = Math.min(...priceData.map(d => parseFloat(d.price)));
  const currentPrice = parseFloat(priceData[priceData.length - 1].price);
  const firstPrice = parseFloat(priceData[0].price);
  const priceChange = ((currentPrice - firstPrice) / firstPrice * 100).toFixed(1);
  const isIncreasing = currentPrice > firstPrice;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          📈 Price History
        </h4>
        <div className={`flex items-center gap-1 text-sm ${isIncreasing ? 'text-red-600' : 'text-green-600'}`}>
          {isIncreasing ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="font-medium">{priceChange}%</span>
        </div>
      </div>
      
      {/* Price Range */}
      <div className="flex justify-between text-sm text-gray-600 mb-4">
        <span>Low: ${minPrice.toFixed(2)}</span>
        <span className="font-medium text-gray-800">Current: ${currentPrice.toFixed(2)}</span>
        <span>High: ${maxPrice.toFixed(2)}</span>
      </div>
      
      {/* Simple Bar Chart */}
      <div className="h-32 flex items-end justify-between gap-2">
        {priceData.map((data, index) => {
          const height = ((parseFloat(data.price) - minPrice) / (maxPrice - minPrice)) * 100;
          const isCurrentMonth = index === priceData.length - 1;
          
          return (
            <div key={data.month} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center">
                <span className="text-xs text-gray-600 mb-1">${data.price}</span>
                <div 
                  className={`w-full ${isCurrentMonth ? 'bg-purple-500' : 'bg-purple-300'} rounded-t transition-all hover:opacity-80`}
                  style={{ height: `${height}px`, minHeight: '10px' }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">{data.month}</span>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600 text-center">
        Price tracking for the last 6 months
      </div>
    </div>
  );
};

export default PriceHistoryChart;