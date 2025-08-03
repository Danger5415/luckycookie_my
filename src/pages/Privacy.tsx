import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-yellow-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/landing" className="flex items-center text-gray-600 hover:text-gray-800 mr-6">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="LuckyCookie.io Logo" 
                className="h-8 w-8 mr-2 object-contain"
              />
              <h1 className="text-2xl font-bold text-gray-800">Privacy Policy</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-green-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-800">Privacy Policy</h2>
          </div>

          <div className="prose max-w-none">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Lock className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-green-800 text-sm">
                    <strong>Your Privacy Matters:</strong> We are committed to protecting your personal information 
                    and being transparent about how we collect, use, and share your data.
                  </p>
                </div>
              </div>
            </div>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">1. Information We Collect</h3>
              
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h4>
              <p className="text-gray-700 mb-4">
                When you create an account or make a purchase, we collect:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Email address (required for account creation)</li>
                <li>Password (encrypted and stored securely)</li>
                <li>Shipping information (for physical prize delivery)</li>
                <li>Payment information (processed securely through Paddle.com)</li>
              </ul>

              <h4 className="text-xl font-semibold text-gray-800 mb-3">Usage Information</h4>
              <p className="text-gray-700 mb-4">
                We automatically collect information about how you use our service:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Cookie crack history and timestamps</li>
                <li>Prize wins and claim information</li>
                <li>Login times and session data</li>
                <li>Device and browser information</li>
                <li>IP address and location data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">2. How We Use Your Information</h3>
              <p className="text-gray-700 mb-4">
                We use your information to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Provide and maintain the LuckyCookie.io service</li>
                <li>Process premium cookie purchases and deliver prizes</li>
                <li>Track your progress, streaks, and leaderboard position</li>
                <li>Send important service notifications and updates</li>
                <li>Prevent fraud and ensure fair play</li>
                <li>Improve our service and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">3. Information Sharing</h3>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Payment Processing:</strong> With Paddle.com for secure payment processing</li>
                <li><strong>Prize Fulfillment:</strong> With shipping partners for physical prize delivery</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Service Providers:</strong> With trusted partners who help operate our service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">4. Data Security</h3>
              <div className="flex items-start mb-4">
                <Database className="h-6 w-6 text-blue-500 mr-3 mt-1" />
                <div>
                  <p className="text-gray-700 mb-4">
                    We implement industry-standard security measures to protect your data:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                    <li>SSL encryption for all data transmission</li>
                    <li>Secure database storage with encryption at rest</li>
                    <li>Regular security audits and updates</li>
                    <li>Limited access to personal data on a need-to-know basis</li>
                    <li>Password hashing using industry-standard algorithms</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">5. Your Rights and Choices</h3>
              <p className="text-gray-700 mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p className="text-gray-700 mb-4">
                To exercise these rights, please contact us at support@luckycookie.io.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">6. Cookies and Tracking</h3>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Keep you logged in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze how you use our service</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can control cookies through your browser settings, but some features may not work properly if cookies are disabled.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">7. Data Retention</h3>
              <p className="text-gray-700 mb-4">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain accurate business records</li>
              </ul>
              <p className="text-gray-700 mb-4">
                When you delete your account, we will delete your personal information within 30 days, except where we are required to retain it by law.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">8. Children's Privacy</h3>
              <p className="text-gray-700 mb-4">
                LuckyCookie.io is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">9. International Data Transfers</h3>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and that your information receives adequate protection.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">10. Changes to This Policy</h3>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date below.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">11. Contact Us</h3>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> originaluckycookie.site@gmail.com<br />
                  <strong>Website:</strong> https://luckycookie.site<br />
                  <strong>Response Time:</strong> We aim to respond within 48 hours
                </p>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};