import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { DatabaseService } from '../lib/database';
import { withTimeout } from '../utils/timeout';
import { gumroadAPI } from '../lib/gumroad';
import { CookieAnimation } from '../components/CookieAnimation';
import { ShippingForm, type ShippingData } from '../components/ShippingForm';
import { getRandomPremiumPrize, premiumTiers, type PremiumPrize } from '../lib/prizes';
import { ArrowLeft, Share2, Crown } from 'lucide-react';

export const PremiumCrack: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [prize, setPrize] = useState<PremiumPrize | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [purchaseVerified, setPurchaseVerified] = useState(false);
  const [verifyingPurchase, setVerifyingPurchase] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingSubmitted, setShippingSubmitted] = useState(false);
  
  // Get tier from URL params (from Gumroad return)
  const tierFromUrl = searchParams.get('tier') || 'gold';
  const saleId = searchParams.get('sale_id');
  const source = searchParams.get('source');
  
  React.useEffect(() => {
    // If we have a sale_id from Gumroad, verify the purchase
    if (saleId && user && !purchaseVerified) {
      verifyGumroadPurchase();
    }
  }, [saleId, user]);
  
  const verifyGumroadPurchase = async () => {
    if (!saleId || !user) return;
    
    setVerifyingPurchase(true);
    setError('');
    try {
      // Verify purchase with Gumroad
      const isValid = await withTimeout(
        gumroadAPI.verifyPurchase(saleId, user.email!),
        15000,
        'Purchase verification timed out'
      );
      
      if (isValid) {
        // Store purchase in database
        const { error } = await withTimeout(
          supabase
            .from('gumroad_purchases')
            .insert({
              user_id: user.id,
              sale_id: saleId,
              product_id: `luckycookie-${tierFromUrl}`,
              product_name: `LuckyCookie ${tierFromUrl.charAt(0).toUpperCase() + tierFromUrl.slice(1)} Tier`,
              tier: tierFromUrl,
              price_usd: premiumTiers.find(t => t.tier === tierFromUrl)?.priceRange.min || 0,
              email: user.email!,
              status: 'verified'
            }),
          10000,
          'Failed to save purchase: Request timed out'
        );
          
        if (error) throw error;
        setPurchaseVerified(true);
      } else {
        setError('Could not verify your purchase. Please contact support.');
      }
    } catch (error: any) {
      console.error('Purchase verification error:', error);
      setError('Error verifying purchase. Please try again or contact support.');
    } finally {
      setVerifyingPurchase(false);
    }
  };

  const handleCrack = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      // Use tier from URL or verified purchase
      const selectedPrize = await getRandomPremiumPrize(tierFromUrl);

      // Record the premium crack in history
      const { data: historyData, error: historyError } = await withTimeout(
        supabase
          .from('crack_history')
          .insert({
            user_id: user.id,
            type: 'premium',
            prize_data: JSON.stringify(selectedPrize),
            won: true, // Premium always wins
            gift_name: selectedPrize.productName,
            gift_value: selectedPrize.value,
            fortune: '', // Premium cracks don't have fortunes, but column is NOT NULL
            premium_tier: selectedPrize.tier,
          })
          .select()
          .single(),
        10000,
        'Failed to save premium crack: Request timed out'
      );
      
      // Update purchase status to cracked
      if (saleId) {
        await withTimeout(
          supabase
            .from('gumroad_purchases')
            .update({ status: 'cracked' })
            .eq('sale_id', saleId),
          8000,
          'Failed to update purchase status: Request timed out'
        );
      }

      setPrize(selectedPrize);

      // Send notification for premium prize wins
      if (user) {
        console.log('👑 About to send premium prize win notification for:', selectedPrize.productName);
        await DatabaseService.notifyPrizeWin({
          type: 'premium_prize_win',
          user: {
            email: user.email!,
            id: user.id,
          },
          prize: {
            name: selectedPrize.productName,
            value: selectedPrize.value,
            tier: selectedPrize.tier,
          },
        });
        console.log('👑 Premium prize win notification call completed');
      }
    } catch (error: any) {
      console.error('Error cracking premium cookie:', error);
      setError(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShippingSubmit = async (shippingData: ShippingData) => {
    try {
      // The ShippingForm component already handles saving to the database
      setShippingSubmitted(true);
      setShowShippingForm(false);
      
      // Show success message
      alert('Shipping information saved successfully! We will contact you within 24 hours with shipping details.');
    } catch (error) {
      console.error('Error handling shipping submission:', error);
      alert('Error saving shipping information. Please try again.');
    }
  };

  const shareWin = () => {
    if (!prize) return;
    
    const tierInfo = premiumTiers.find(t => t.tier === prize.tier);
    const text = `I just won a ${prize.productName} worth $${prize.value} from a ${tierInfo?.name} cookie on LuckyCookie.io! 🍪👑✨`;
    
    if (navigator.share) {
      navigator.share({
        text,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.origin}`);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-purple-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/premium" className="flex items-center text-gray-600 hover:text-gray-800 mr-6">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Premium
            </Link>
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-purple-500 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">Premium Crack</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            Your Premium Fortune Awaits! 👑
          </h2>
          
          {saleId && source === 'gumroad' ? (
            <div className="max-w-2xl mx-auto">
              <p className="text-xl text-gray-600 mb-4">
                Thank you for your purchase! 
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-green-800">
                  ✅ Purchase verified! You can now crack your {tierFromUrl.charAt(0).toUpperCase() + tierFromUrl.slice(1)} tier cookie.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <p className="text-xl text-gray-600 mb-4">
                Demo mode - Select a tier to simulate premium cookie cracking
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <p className="text-yellow-800">
                  🚧 This is demo mode. In production, users will be redirected here after Gumroad purchase.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {verifyingPurchase && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center mb-8">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-blue-600 mb-4">Verifying Your Purchase</h3>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
            <div className="mt-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-400 border-t-transparent"></div>
            </div>
          </div>
        )}

        {!saleId && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto mb-8">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Demo Mode:</strong> Select tier to simulate
            </p>
            <select 
              value={tierFromUrl} 
              onChange={(e) => window.history.replaceState({}, '', `?tier=${e.target.value}`)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              {premiumTiers.map(tier => (
                <option key={tier.tier} value={tier.tier}>
                  {tier.name} (${tier.priceRange.min.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
        )}

        {!prize && !error && !verifyingPurchase && (
          <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8">
            <CookieAnimation 
              onCrack={handleCrack}
              isDisabled={isLoading || (saleId && !purchaseVerified)}
            />
            {isLoading && (
              <p className="text-center text-gray-600 mt-4">
                Selecting your premium prize...
              </p>
            )}
            {saleId && !purchaseVerified && !verifyingPurchase && (
              <p className="text-center text-red-600 mt-4">
                Please verify your purchase first
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-4xl mb-4">😔</div>
            <h3 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setError('');
                handleCrack();
              }}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {prize && (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-4xl font-bold text-purple-600 mb-4">
              Congratulations! 🎊
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              You've won an amazing premium prize!
            </p>

            <div className="max-w-md mx-auto mb-8">
              <div className="aspect-square mb-4 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={prize.image} 
                  alt={prize.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h4 className="text-2xl font-bold text-gray-800 mb-2">{prize.productName}</h4>
              <p className="text-3xl font-bold text-purple-600 mb-4">
                Worth ${prize.value.toFixed(2)}
              </p>
              
              {prize.description && (
                <p className="text-gray-600 mb-4">{prize.description}</p>
              )}
              
              <div className="flex items-center justify-center mb-4">
                {(() => {
                  const tierInfo = premiumTiers.find(t => t.tier === prize.tier);
                  return tierInfo ? (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${tierInfo.bgColor} ${tierInfo.color} border ${tierInfo.borderColor}`}>
                      {tierInfo.icon} {tierInfo.name} Tier
                    </span>
                  ) : null;
                })()}
              </div>
            </div>

            {!shippingSubmitted ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                <h4 className="font-bold text-gray-800 mb-2">📦 Claim Your Prize</h4>
                <p className="text-gray-600 mb-4">
                  To receive your prize, we need your shipping information. Click the button below to provide your delivery details.
                </p>
                <button
                  onClick={() => setShowShippingForm(true)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-bold"
                >
                  📋 Provide Shipping Details
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                <h4 className="font-bold text-gray-800 mb-2">✅ Shipping Information Received</h4>
                <p className="text-gray-600">
                  Thank you! We have received your shipping information. Our team will contact you within 24 hours with shipping details and tracking information.
                </p>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={shareWin}
                className="flex items-center px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-bold"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Share Your Win!
              </button>
              
              <Link
                to="/dashboard"
                className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-bold"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Shipping Form Modal */}
        {showShippingForm && prize && (
          <ShippingForm
            prizeId={prize.id}
            prizeName={prize.productName}
            onClose={() => setShowShippingForm(false)}
            onSubmit={handleShippingSubmit}
          />
        )}
      </main>
    </div>
  );
};