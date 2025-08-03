import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export const Refund: React.FC = () => {
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
              <h1 className="text-2xl font-bold text-gray-800">Refund Policy</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <RefreshCw className="h-8 w-8 text-blue-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-800">Refund Policy</h2>
          </div>

          <div className="prose max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-blue-800 text-sm">
                    <strong>30-Day Money-Back Guarantee:</strong> We offer a full 30-day money-back guarantee 
                    on all premium cookie purchases. Your satisfaction is our priority.
                  </p>
                </div>
              </div>
            </div>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">1. Our Refund Commitment</h3>
              <p className="text-gray-700 mb-4">
                At LuckyCookie.io, we stand behind our service with a comprehensive 30-day money-back guarantee. 
                If you're not completely satisfied with your premium cookie purchase, we'll provide a full refund 
                within 30 days of your purchase date.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">2. Eligible Refund Scenarios</h3>
              <div className="flex items-start mb-4">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1" />
                <div>
                  <p className="text-gray-700 mb-4">
                    You are eligible for a full refund in the following situations:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                    <li>Technical issues prevented you from receiving your prize</li>
                    <li>You were charged incorrectly or multiple times</li>
                    <li>The service did not function as described</li>
                    <li>You experienced any form of service disruption</li>
                    <li>You're not satisfied with your experience for any reason</li>
                    <li>Prize delivery failed due to our error</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">3. Refund Process</h3>
              <p className="text-gray-700 mb-4">
                To request a refund, please follow these simple steps:
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Contact Our Support Team</h4>
                    <p className="text-gray-700">Email us at support@luckycookie.io with your refund request</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Provide Purchase Details</h4>
                    <p className="text-gray-700">Include your email address, purchase date, and transaction ID if available</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Reason for Refund</h4>
                    <p className="text-gray-700">Briefly explain why you're requesting a refund (optional but helpful)</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Receive Confirmation</h4>
                    <p className="text-gray-700">We'll respond within 24 hours with refund confirmation</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">4. Refund Timeline</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-green-800 mb-2">Processing Times:</h4>
                <ul className="list-disc list-inside text-green-700 space-y-1">
                  <li><strong>Response Time:</strong> Within 24 hours of your request</li>
                  <li><strong>Approval Time:</strong> Same day for eligible requests</li>
                  <li><strong>Refund Processing:</strong> 3-5 business days via Paddle.com</li>
                  <li><strong>Bank/Card Reflection:</strong> 5-10 business days depending on your bank</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">5. Prize Return Policy</h3>
              <p className="text-gray-700 mb-4">
                Different prize types have different return requirements:
              </p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-800">Digital Prizes</h4>
                  <p className="text-gray-700">Gift cards and digital credits can be refunded if unused. Once redeemed, refunds may not be possible.</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-800">Physical Prizes</h4>
                  <p className="text-gray-700">Unopened physical prizes can be returned. Return shipping is covered by us for our errors, or by you for change of mind.</p>
                </div>
                
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-gray-800">Undelivered Prizes</h4>
                  <p className="text-gray-700">If you haven't received your prize within the expected timeframe, we'll provide a full refund or replacement.</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">6. Special Circumstances</h3>
              <div className="flex items-start mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Extended Refund Periods</h4>
                  <p className="text-gray-700 mb-4">
                    In certain situations, we may extend the 30-day refund period:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                    <li>Technical issues that prevented normal service use</li>
                    <li>Delayed prize delivery due to shipping complications</li>
                    <li>Service outages or maintenance periods</li>
                    <li>Disputed transactions or payment issues</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">7. Dispute Resolution</h3>
              <p className="text-gray-700 mb-4">
                If you're not satisfied with our refund decision, we offer a complaint resolution process:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Internal Review:</strong> Request a review by our senior support team</li>
                <li><strong>Escalation:</strong> Cases can be escalated to management within 48 hours</li>
                <li><strong>External Mediation:</strong> We work with appropriate trade ombudsman services</li>
                <li><strong>Response Time:</strong> All complaints are resolved within 7 business days</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">8. Chargeback Prevention</h3>
              <p className="text-gray-700 mb-4">
                Before initiating a chargeback with your bank, please contact us directly. We can often resolve 
                issues faster and more efficiently than the chargeback process, which can take weeks or months.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Important:</strong> Chargebacks incur additional fees and may delay resolution. 
                  Our direct refund process is typically faster and more convenient for everyone.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">9. Contact Information</h3>
              <p className="text-gray-700 mb-4">
                For all refund requests and questions, please contact our support team:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> support@luckycookie.io<br />
                  <strong>Subject Line:</strong> "Refund Request - [Your Email]"<br />
                  <strong>Response Time:</strong> Within 24 hours<br />
                  <strong>Business Hours:</strong> Monday-Friday, 9 AM - 6 PM EST
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">10. Policy Updates</h3>
              <p className="text-gray-700 mb-4">
                We may update this refund policy from time to time. Any changes will be posted on this page 
                with an updated revision date. Continued use of our service after changes constitutes acceptance 
                of the new policy.
              </p>
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