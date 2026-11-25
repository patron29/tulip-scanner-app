import barcodeScanner from './barcodeScanner';

jest.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: jest.fn(),
}));

import { BrowserMultiFormatReader } from '@zxing/browser';

const flush = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));

describe('barcodeScanner', () => {
  let videoElement;

  beforeEach(() => {
    videoElement = document.createElement('video');
    barcodeScanner.init(videoElement);
    jest.clearAllMocks();
  });

  afterEach(() => {
    barcodeScanner.destroy();
    delete window.BarcodeDetector;
  });

  it('uses the native BarcodeDetector fast path when available', async () => {
    const onBarcodeDetected = jest.fn();
    window.BarcodeDetector = class {
      static getSupportedFormats = jest.fn().mockResolvedValue(['qr_code']);

      detect = jest.fn().mockResolvedValue([{ rawValue: '012345678905' }]);
    };

    await barcodeScanner.startScanning(onBarcodeDetected);
    await flush();

    expect(onBarcodeDetected).toHaveBeenCalledWith('012345678905');
    expect(BrowserMultiFormatReader).not.toHaveBeenCalled();
  });

  it('falls back to ZXing when BarcodeDetector is absent and decodes via the video element', async () => {
    const onBarcodeDetected = jest.fn();
    let capturedCallback;
    let decodeMock;
    const mockControls = { stop: jest.fn() };
    BrowserMultiFormatReader.mockImplementation(() => ({
      decodeFromVideoDevice: (decodeMock = jest.fn((deviceId, videoEl, callback) => {
        capturedCallback = callback;
        return Promise.resolve(mockControls);
      })),
    }));

    await barcodeScanner.startScanning(onBarcodeDetected);
    await flush();

    expect(BrowserMultiFormatReader).toHaveBeenCalledTimes(1);
    // No device id (ZXing picks the environment camera) and the same video element.
    expect(decodeMock).toHaveBeenCalledWith(undefined, videoElement, expect.any(Function));

    // Simulate ZXing finding a barcode in a frame.
    capturedCallback({ getText: () => '049000050103' }, undefined);
    expect(onBarcodeDetected).toHaveBeenCalledWith('049000050103');
    expect(mockControls.stop).toHaveBeenCalled();
  });

  it('signals manual entry immediately when ZXing cannot start', async () => {
    const onBarcodeDetected = jest.fn();
    BrowserMultiFormatReader.mockImplementation(() => ({
      decodeFromVideoDevice: jest.fn().mockRejectedValue(new Error('camera unavailable')),
    }));

    await barcodeScanner.startScanning(onBarcodeDetected);
    await flush();

    expect(onBarcodeDetected).toHaveBeenCalledTimes(1);
    expect(onBarcodeDetected).toHaveBeenCalledWith(null);
    expect(barcodeScanner.isScanning).toBe(false);
  });

  it('ignores empty frames and keeps scanning', async () => {
    const onBarcodeDetected = jest.fn();
    let capturedCallback;
    BrowserMultiFormatReader.mockImplementation(() => ({
      decodeFromVideoDevice: jest.fn((deviceId, videoEl, callback) => {
        capturedCallback = callback;
        return Promise.resolve({ stop: jest.fn() });
      }),
    }));

    await barcodeScanner.startScanning(onBarcodeDetected);
    await flush();

    const notFound = new Error('No MultiFormat Readers were able to detect the code.');
    notFound.name = 'NotFoundException';
    capturedCallback(undefined, notFound);
    await flush(10);

    expect(onBarcodeDetected).not.toHaveBeenCalled();
    expect(barcodeScanner.isScanning).toBe(true);
  });

  it('stopScanning stops the ZXing controls and destroy clears state', async () => {
    const mockControls = { stop: jest.fn() };
    BrowserMultiFormatReader.mockImplementation(() => ({
      decodeFromVideoDevice: jest.fn().mockResolvedValue(mockControls),
    }));

    await barcodeScanner.startScanning(jest.fn());
    await flush();

    barcodeScanner.stopScanning();
    expect(mockControls.stop).toHaveBeenCalled();
    expect(barcodeScanner.isScanning).toBe(false);

    barcodeScanner.destroy();
    expect(barcodeScanner.videoElement).toBeNull();
  });
});
