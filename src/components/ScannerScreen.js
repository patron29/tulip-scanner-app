import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, X, Loader, AlertCircle } from 'lucide-react';
import barcodeScanner from '../services/barcodeScanner';

const ScannerScreen = ({ setCurrentScreen, isScanning, simulateScan, onBarcodeDetected }) => {
  const videoRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const streamRef = useRef(null);

  // Handle barcode detection
  const handleBarcodeDetected = useCallback((barcode) => {
    if (barcode) {
      // Real barcode detected
      if (onBarcodeDetected) {
        onBarcodeDetected(barcode);
      } else {
        // Fallback to simulateScan
        simulateScan();
      }
    }
  }, [onBarcodeDetected, simulateScan]);

  useEffect(() => {
    // Request camera permission and start video stream
    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Check if mediaDevices is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API is not available in your browser');
        }

        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
          
          // Initialize barcode scanner once video is ready
          videoRef.current.onloadedmetadata = () => {
            barcodeScanner.init(videoRef.current);
            // Start scanning automatically
            setTimeout(() => {
              barcodeScanner.startScanning(handleBarcodeDetected);
            }, 500);
          };
        }
        
        setIsLoading(false);
      } catch (err) {
        setHasPermission(false);
        setIsLoading(false);
        
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please allow camera access to scan products.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on your device.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is already in use by another application.');
        } else {
          setError('Unable to access camera. Please check your browser settings.');
        }
      }
    };

    startCamera();

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      }
      barcodeScanner.destroy();
    };
  }, [handleBarcodeDetected]);

  const handleClose = () => {
    // Stop all camera tracks before closing
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
    }
    barcodeScanner.destroy();
    setCurrentScreen('home');
  };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-8 left-8 text-white bg-white bg-opacity-20 rounded-full p-3 backdrop-blur-sm z-20"
        aria-label="Close scanner"
      >
        <X size={24} />
      </button>

      {/* Camera view or error state */}
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Loader size={48} className="text-white animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Initializing camera...</p>
          </div>
        </div>
      ) : hasPermission === false || error ? (
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <div className="bg-white bg-opacity-10 rounded-3xl p-8 backdrop-blur-sm max-w-sm text-center">
            <AlertCircle size={48} className="text-yellow-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Camera Access Required</h3>
            <p className="text-white text-opacity-90 mb-6">
              {error || 'Please allow camera access to scan product barcodes.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-black px-6 py-3 rounded-full font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Video element for camera feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            // Removed the mirror transform so camera shows normal view
          />

          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Scanning frame */}
              <div className="w-64 h-64 relative">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                
                {/* Scanning line animation - always show when camera is active */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"
                       style={{
                         top: '50%',
                         animation: 'scan 2s linear infinite'
                       }}></div>
                </div>
                
                {/* Center camera icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {isScanning ? (
                    <Loader size={48} className="text-white animate-spin" />
                  ) : (
                    <Camera size={48} className="text-white opacity-50" />
                  )}
                </div>
              </div>
              
              {/* Instructions */}
              <p className="text-white text-center mt-6 text-lg">
                Position barcode within frame
              </p>
            </div>
          </div>

          {/* Add scanning animation keyframes */}
          <style jsx>{`
            @keyframes scan {
              0% { transform: translateY(-100px); }
              50% { transform: translateY(100px); }
              100% { transform: translateY(-100px); }
            }
          `}</style>

          {/* Bottom overlay with semi-transparent background */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-8">
            {!isScanning && (
              <button
                onClick={simulateScan}
                className="w-full bg-white text-black px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                Scan Product
              </button>
            )}
            
            <p className="text-white text-center text-sm mt-4 opacity-75">
              Make sure the barcode is clearly visible and well-lit
            </p>
          </div>

          {/* Top gradient for better visibility of close button */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent"></div>
        </>
      )}
    </div>
  );
};

export default ScannerScreen;