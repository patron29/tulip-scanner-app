/* eslint-disable no-console */
// src/services/barcodeScanner.js
// Service for handling barcode scanning functionality

class BarcodeScanner {
  constructor() {
    this.isScanning = false;
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasContext = null;
    this.zxingReader = null;
    this.zxingControls = null;
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
        // Fall back to ZXing decoding
        this.startZXingFallback(onBarcodeDetected);
      }
    } else {
      // Use ZXing fallback for iOS and other browsers without BarcodeDetector
      this.startZXingFallback(onBarcodeDetected);
    }
  }

  // ZXing fallback for browsers without BarcodeDetector (e.g. iOS Safari).
  // Decodes continuously from the same video element until a barcode is found.
  // If ZXing cannot start at all, manual entry is the last resort: signal it
  // immediately instead of after a delay.
  async startZXingFallback(onBarcodeDetected) {
    try {
      // Lazy-load ZXing so the BarcodeDetector fast path never pays for it.
      const { BrowserMultiFormatReader } = await import('@zxing/browser');

      // Scanning may have been stopped while the library was loading.
      if (!this.isScanning) return;

      this.zxingReader = new BrowserMultiFormatReader();
      this.zxingControls = await this.zxingReader.decodeFromVideoDevice(
        undefined,
        this.videoElement,
        (result, error) => {
          if (!this.isScanning) return;

          if (result) {
            console.log('Barcode detected (ZXing):', result.getText());
            this.isScanning = false;
            this.stopZXingReader();
            onBarcodeDetected(result.getText());
            return;
          }

          // NotFoundException just means "no barcode in this frame" - keep scanning.
          if (error && error.name !== 'NotFoundException') {
            console.warn('ZXing decode error:', error);
          }
        }
      );
    } catch (err) {
      console.error('ZXing fallback failed:', err);
      this.stopZXingReader();
      // Last resort: manual entry.
      if (this.isScanning) {
        this.isScanning = false;
        onBarcodeDetected(null);
      }
    }
  }

  // Stop the ZXing reader and release the camera stream it created (if any).
  // Safe to call when no ZXing scan is active.
  stopZXingReader() {
    if (this.zxingControls) {
      try {
        const stopped = this.zxingControls.stop();
        // stop() can be async when torch control is involved; don't let a
        // rejection surface as an unhandled promise rejection.
        if (stopped && typeof stopped.catch === 'function') {
          stopped.catch((err) => {
            console.warn('Failed to stop ZXing controls:', err);
          });
        }
      } catch (err) {
        console.warn('Failed to stop ZXing controls:', err);
      }
      this.zxingControls = null;
    }
    this.zxingReader = null;
  }

  // Stop scanning
  stopScanning() {
    this.isScanning = false;
    this.stopZXingReader();
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
