// PrivacyPolicy.js
import React from 'react';
import { X } from 'lucide-react';

const PrivacyPolicy = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Privacy Policy</h2>
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
            <h3 className="text-lg font-semibold mb-2">1. Information We Collect</h3>
            <p className="text-gray-700 mb-4">
              Tulip collects information you provide directly to us, such as:
            </p>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Account information (email address, password)</li>
              <li>Product scan history and saved products</li>
              <li>Usage data and app analytics</li>
              <li>Device information (type, operating system)</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">2. How We Use Your Information</h3>
            <p className="text-gray-700 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Provide and maintain the App</li>
              <li>Process your account registration</li>
              <li>Track your scan usage and saved products</li>
              <li>Send you updates and marketing communications (with your consent)</li>
              <li>Improve our services and develop new features</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">3. Information Sharing</h3>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following situations:
            </p>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist in operating our App</li>
              <li>In connection with a merger or acquisition</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">4. Data Security</h3>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">5. Data Retention</h3>
            <p className="text-gray-700 mb-4">
              We retain your personal information for as long as necessary to provide you with our services and as required by law. You may request deletion of your account and associated data at any time.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">6. Your Rights</h3>
            <p className="text-gray-700 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">7. Children's Privacy</h3>
            <p className="text-gray-700 mb-4">
              Tulip is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">8. International Data Transfers</h3>
            <p className="text-gray-700 mb-4">
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">9. California Privacy Rights</h3>
            <p className="text-gray-700 mb-4">
              California residents have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected, used, shared, or sold.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">10. Changes to This Policy</h3>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">11. Contact Us</h3>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />Email: privacy@tulipapp.com
              <br />Address: Tulip App, Privacy Department, [Your Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;