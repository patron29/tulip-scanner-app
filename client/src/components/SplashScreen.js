import React, { useEffect } from 'react';
import TulipLogo from './TulipLogo';

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-100 via-yellow-50 to-green-100 flex items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center">
        <div className="mb-4">
          <TulipLogo size="xlarge" className="animate-bounce" />
        </div>
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
          Tulip
        </h1>
        <p className="text-gray-600 mt-2 text-center">Smart Shopping, Beautiful Savings</p>
      </div>
    </div>
  );
};

export default SplashScreen;