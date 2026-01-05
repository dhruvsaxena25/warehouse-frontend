import React from 'react';
import BarcodeScanner from '../components/BarcodeScanner';

const ScannerPage = () => {
  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>
        Product Barcode Scanner
      </h1>
      <p style={{ marginBottom: '20px', color: '#64748b' }}>
        Use your device camera to scan product barcodes and look up catalog information.
      </p>
      <BarcodeScanner />
    </div>
  );
};

export default ScannerPage;
