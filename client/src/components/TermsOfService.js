// TermsOfService.js
import React from 'react';
import { X } from 'lucide-react';

const TermsOfService = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Terms of Service</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
          <p className="text-sm text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
            <p className="text-gray-700 mb-4">
              By accessing and using Tulip ("the App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">2. Use License & Restrictions</h3>
            <p className="text-gray-700 mb-4">
              Tulip grants you a limited, non-exclusive, non-transferable license to use the App for personal, non-commercial purposes. You may not:
            </p>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Modify, reverse engineer, or attempt to extract the source code</li>
              <li>Use the App for any unlawful purpose or in violation of any laws</li>
              <li>Attempt to gain unauthorized access to any portion of the App</li>
              <li>Remove any copyright or proprietary notations</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">3. Disclaimer of Warranties</h3>
            <p className="text-gray-700 mb-4">
              THE APP IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE EXPRESSLY DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="text-gray-700 mb-4">
              Product information, prices, and availability displayed in the App are obtained from third-party sources and may not be accurate, complete, or current. We do not guarantee the accuracy of any product information, pricing data, or barcode scanning results.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">4. Limitation of Liability</h3>
            <p className="text-gray-700 mb-4">
              IN NO EVENT SHALL TULIP, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES RESULTING FROM YOUR USE OF THE APP, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Errors in product information or pricing</li>
              <li>Inability to scan certain barcodes</li>
              <li>Loss of data or unauthorized access to your account</li>
              <li>Decisions made based on information provided by the App</li>
              <li>Any interruption or cessation of the App</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">5. Third-Party Services</h3>
            <p className="text-gray-700 mb-4">
              The App may display information from third-party retailers, manufacturers, and data providers. We are not affiliated with these third parties and do not endorse their products or services. Any transactions you make with third parties are solely between you and them.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">6. Indemnification</h3>
            <p className="text-gray-700 mb-4">
              You agree to indemnify, defend, and hold harmless Tulip and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including attorney's fees) arising out of your use of the App or violation of these Terms.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">7. Subscription Terms</h3>
            <p className="text-gray-700 mb-4">
              Paid subscriptions are billed monthly and will automatically renew unless cancelled. You may cancel your subscription at any time. No refunds will be provided for partial months. Free tier limitations may change at any time.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">8. Modifications</h3>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes. Your continued use of the App after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">9. Governing Law</h3>
            <p className="text-gray-700 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">10. Contact Information</h3>
            <p className="text-gray-700">
              If you have any questions about these Terms, please contact us at legal@tulipapp.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;