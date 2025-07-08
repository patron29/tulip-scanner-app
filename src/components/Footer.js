// Footer.js
import React from 'react';

const Footer = ({ onTermsClick, onPrivacyClick }) => {
  return (
    <footer className="bg-gray-100 mt-8 py-6 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Tulip. All rights reserved.
          </p>
        </div>
        
        <div className="flex justify-center gap-6 text-sm">
          <button
            onClick={onTermsClick}
            className="text-gray-600 hover:text-pink-600 transition-colors"
          >
            Terms of Service
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={onPrivacyClick}
            className="text-gray-600 hover:text-pink-600 transition-colors"
          >
            Privacy Policy
          </button>
          <span className="text-gray-400">|</span>
          <a
            href="mailto:support@tulipapp.com"
            className="text-gray-600 hover:text-pink-600 transition-colors"
          >
            Contact
          </a>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>
            Product information provided for reference only. Prices and availability subject to change.
          </p>
          <p className="mt-1">
            Tulip is not affiliated with any retailers or manufacturers mentioned.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;