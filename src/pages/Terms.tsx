import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, AlertCircle } from 'lucide-react';

export const Terms: React.FC = () => {
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
              <h1 className="text-2xl font-bold text-gray-800">Terms & Conditions</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <FileText className="h-8 w-8 text-blue-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-800">Terms & Conditions</h2>
          </div>

          <div className="prose max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-blue-800 text-sm">
                    <strong>Important:</strong> Our order process is conducted by our online reseller Paddle.com. 
                    Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service 
                    inquiries and handles returns.
                  </p>
                </div>
              </div>
            </div>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h3>
              <p className="text-gray-700 mb-4">
                By accessing and using LuckyCookie.io ("the Service"), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">2. Service Description</h3>
              <p className="text-gray-700 mb-4">
                LuckyCookie.io is an online fortune cookie experience platform that offers:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Free fortune cookies with hourly availability</li>
                <li>Premium fortune cookies with guaranteed prizes</li>
                <li>Five premium tiers: Bronze ($13), Silver ($33), Gold ($65), Sapphire ($196), and Diamond ($458)</li>
                <li>Digital and physical prize fulfillment</li>
                <li>User dashboard and leaderboard features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">3. User Accounts</h3>
              <p className="text-gray-700 mb-4">
                To access certain features of the Service, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">4. Premium Purchases</h3>
              <p className="text-gray-700 mb-4">
                Premium cookie purchases are processed through Paddle.com. By making a purchase, you agree that:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>All sales are final unless otherwise specified in our refund policy</li>
                <li>Prices are clearly displayed before purchase confirmation</li>
                <li>You will receive a guaranteed prize from your selected tier</li>
                <li>Physical prizes require accurate shipping information</li>
                <li>Digital prizes are delivered via email</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">5. Prize Fulfillment</h3>
              <p className="text-gray-700 mb-4">
                We are committed to fair prize distribution:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>All prize selections are completely random within each tier</li>
                <li>Premium cookies guarantee a prize from the purchased tier</li>
                <li>Free cookies have a chance to win gifts or receive fortunes</li>
                <li>Physical prizes are shipped within 7-14 business days</li>
                <li>Digital prizes are delivered within 24-48 hours</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">6. User Conduct</h3>
              <p className="text-gray-700 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to manipulate or exploit the prize system</li>
                <li>Create multiple accounts to circumvent limitations</li>
                <li>Interfere with the Service's operation or security</li>
                <li>Share account credentials with others</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">7. Intellectual Property</h3>
              <p className="text-gray-700 mb-4">
                The Service and its original content, features, and functionality are owned by LuckyCookie.io and are 
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">8. Limitation of Liability</h3>
              <p className="text-gray-700 mb-4">
                In no event shall LuckyCookie.io be liable for any indirect, incidental, special, consequential, or 
                punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible 
                losses, resulting from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">9. Termination</h3>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice 
                or liability, under our sole discretion, for any reason whatsoever, including without limitation if you 
                breach the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">10. Changes to Terms</h3>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will 
                provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">11. Contact Information</h3>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> originaluckycookie.site@gmail.com<br />
                  <strong>Website:</strong> https://luckycookie.site
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