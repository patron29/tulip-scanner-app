import React from 'react';
import { Camera, X, Loader } from 'lucide-react';

const ScannerScreen = ({ setCurrentScreen, isScanning, simulateScan }) => {
  return (
    <div className="min-h-screen bg-black relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white bg-opacity-10 rounded-3xl p-8 backdrop-blur-sm">
          <div className="w-64 h-64 border-4 border-white rounded-2xl relative overflow-hidden">
            {isScanning && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent opacity-50 animate-pulse"></div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              {isScanning ? (
                <Loader size={48} className="text-white animate-spin" />
              ) : (
                <Camera size={48} className="text-white opacity-50" />
              )}
            </div>
          </div>
          <p className="text-white text-center mt-6 text-lg">
            {isScanning ? 'Searching product database...' : 'Point at any product barcode'}
          </p>
        </div>
      </div>
      
      <button
        onClick={() => setCurrentScreen('home')}
        className="absolute top-8 left-8 text-white bg-white bg-opacity-20 rounded-full p-3 backdrop-blur-sm"
      >
        <X size={24} />
      </button>
      
      {!isScanning && (
        <button
          onClick={simulateScan}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
        >
          Scan Random Product
        </button>
      )}
    </div>
  );
};

export default ScannerScreen;