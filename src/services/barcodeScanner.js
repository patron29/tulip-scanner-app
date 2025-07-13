// src/services/barcodeScanner.js
// Service for handling barcode scanning functionality

class BarcodeScanner {
  constructor() {
    this.isScanning = false;
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasContext = null;
  }

  // Initialize the scanner with video element
  init(videoElement) {
    this.videoElement = videoElement;
    
    // Create an offscreen canvas for image processing
    this.canvasElement = document.createElement('canvas');
    this.canvasContext = this.canvasElement.getContext('2d');
  }

  // Check if BarcodeDetector API is available
  isBarcodeDetectorAvailable() {
    return 'BarcodeDetector' in window && window.BarcodeDetector.getSupportedFormats;
  }

  // Start scanning using native BarcodeDetector API if available
  async startScanning(onBarcodeDetected) {
    if (!this.videoElement) {
      throw new Error('Scanner not initialized');
    }

    this.isScanning = true;

    // Use native BarcodeDetector if available (Chrome on Android)
    if (this.isBarcodeDetectorAvailable()) {
      try {
        // eslint-disable-next-line no-undef
        const formats = await window.BarcodeDetector.getSupportedFormats();
        console.log('Supported barcode formats:', formats);
        
        // eslint-disable-next-line no-undef
        const barcodeDetector = new window.BarcodeDetector({
          formats: ['code_128', 'code_39', 'code_93', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code']
        });

        const detectLoop = async () => {
          if (!this.isScanning) return;

          try {
            const barcodes = await barcodeDetector.detect(this.videoElement);
            
            if (barcodes.length > 0) {
              console.log('Barcode detected:', barcodes[0]);
              this.isScanning = false;
              onBarcodeDetected(barcodes[0].rawValue);
              return;
            }
          } catch (err) {
            // Silently continue scanning
          }

          // Continue scanning with shorter delay for faster detection
          if (this.isScanning) {
            setTimeout(() => detectLoop(), 100); // Check every 100ms
          }
        };

        detectLoop();
      } catch (err) {
        console.error('BarcodeDetector error:', err);
        // Fall back to manual scanning
        this.fallbackToManualScanning(onBarcodeDetected);
      }
    } else {
      // Use fallback method for iOS and other browsers
      this.fallbackToManualScanning(onBarcodeDetected);
    }
  }

  // Fallback scanning method for browsers without BarcodeDetector
  fallbackToManualScanning(onBarcodeDetected) {
    console.log('BarcodeDetector not available, using fallback method');
    
    // For iOS and browsers without native barcode scanning,
    // we'll need to either:
    // 1. Integrate a JavaScript barcode scanning library like QuaggaJS or ZXing
    // 2. Capture frames and send to a server-side barcode detection service
    // 3. Provide a manual input option
    
    // For now, we'll show a message to use the manual input
    setTimeout(() => {
      if (this.isScanning) {
        this.isScanning = false;
        onBarcodeDetected(null); // Indicate manual input needed
      }
    }, 3000);
  }

  // Stop scanning
  stopScanning() {
    this.isScanning = false;
  }

  // Capture current frame from video
  captureFrame() {
    if (!this.videoElement || !this.canvasElement) return null;

    const { videoWidth, videoHeight } = this.videoElement;
    this.canvasElement.width = videoWidth;
    this.canvasElement.height = videoHeight;
    
    this.canvasContext.drawImage(this.videoElement, 0, 0, videoWidth, videoHeight);
    
    return this.canvasElement.toDataURL('image/jpeg');
  }

  // Clean up resources
  destroy() {
    this.stopScanning();
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasContext = null;
  }
}

const barcodeScanner = new BarcodeScanner();
export default barcodeScanner;