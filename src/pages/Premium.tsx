import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { gumroadAPI } from '../lib/gumroad';
import { premiumTiers, getDynamicPremiumPrizesByTier, formatPriceRange, type PremiumTier, type PremiumPrize } from '../lib/prizes';
import { ArrowLeft, Crown, Star, Zap, ExternalLink } from 'lucide-react';

export const Premium: React.FC = () => {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<PremiumTier | null>(null);
  const [tierPrizes, setTierPrizes] = useState<PremiumPrize[]>([]);
  const [loadingPrizes, setLoadingPrizes] = useState(false);

  // Fetch prizes when tier is selected
  useEffect(() => {
    if (selectedTier) {
      fetchTierPrizes(selectedTier.tier);
    }
  }, [selectedTier]);

  const fetchTierPrizes = async (tier: string) => {
    setLoadingPrizes(true);
    try {
      const prizes = await getDynamicPremiumPrizesByTier(tier);
      setTierPrizes(prizes);
    } catch (error) {
      console.error('Error fetching tier prizes:', error);
      setTierPrizes([]);
    } finally {
      setLoadingPrizes(false);
    }
  };

  const handlePurchase = (tier: PremiumTier) => {
    // Create return URL with tier information
    const returnUrl = `${window.location.origin}/premium/crack?tier=${tier.tier}&source=gumroad`;
    
    // Get purchase URL from Gumroad API
    const purchaseUrl = gumroadAPI.getPurchaseUrl(tier.tier, user?.email, returnUrl);
    
    // Open in same window to maintain session
    window.location.href = purchaseUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-purple-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center min-w-0">
          <div className="flex items-center">
            <Link to="/home" className="flex items-center text-gray-600 hover:text-gray-800 mr-2 sm:mr-6">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-purple-500 mr-2" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Premium Cookies</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-6">🍪✨</div>
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            Premium Fortune Cookies
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose your premium cookie tier and get guaranteed amazing prizes! 
            Each tier offers 5 different prizes - you'll randomly receive one when you crack your cookie.
          </p>
          
          <div className="flex justify-center space-x-8 mb-8">
            <div className="flex items-center">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              <span className="text-gray-700">Guaranteed Prize</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-6 w-6 text-blue-500 mr-2" />
              <span className="text-gray-700">Instant Crack</span>
            </div>
            <div className="flex items-center">
              <Crown className="h-6 w-6 text-purple-500 mr-2" />
              <span className="text-gray-700">5 Tier Options</span>
            </div>
          </div>
        </div>

        {/* Premium Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          {premiumTiers.filter(tier => tier.tier !== 'free').map((tier) => (
            <div 
              key={tier.tier}
              className={`bg-white rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${tier.borderColor} min-h-[280px] flex flex-col justify-between`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{tier.icon}</div>
                <h3 className={`text-2xl font-bold mb-2 ${tier.color}`}>{tier.name}</h3>
                <p className="text-lg font-semibold text-gray-700 mb-4">
                  {formatPriceRange(tier)}
                </p>
                
                <button
                  onClick={() => setSelectedTier(selectedTier?.tier === tier.tier ? null : tier)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-4 ${
                    selectedTier?.tier === tier.tier
                      ? `${tier.bgColor} ${tier.color} border ${tier.borderColor}`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedTier?.tier === tier.tier ? 'Hide Prizes' : 'View Prizes'}
                </button>
                
                <button
                  onClick={() => handlePurchase(tier)}
                  className={`w-full py-4 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center ${
                    tier.tier === 'bronze' ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' :
                    tier.tier === 'silver' ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700' :
                    tier.tier === 'gold' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700' :
                    tier.tier === 'sapphire' ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' :
                    'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                  }`}
                >
                  Buy Now
                  <ExternalLink className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Tier Prizes */}
        {selectedTier && (
          <div className={`bg-white rounded-3xl shadow-2xl p-8 mb-12 border-2 ${selectedTier.borderColor}`}>
            <h3 className={`text-3xl font-bold mb-8 text-center ${selectedTier.color}`}>
              {selectedTier.icon} {selectedTier.name} Tier Prizes
            </h3>
            
            {loadingPrizes ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-400 border-t-transparent mb-4"></div>
                <p className="text-gray-600">Loading available prizes...</p>
              </div>
            ) : tierPrizes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {tierPrizes.slice(0, 5).map((prize) => (
                  <div 
                    key={prize.id}
                    className={`${selectedTier.bgColor} rounded-xl p-4 border ${selectedTier.borderColor}`}
                  >
                    <div className="aspect-square mb-3 rounded-lg overflow-hidden">
                      <img 
                        src={prize.image} 
                        alt={prize.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-gray-600 mb-4">No prizes available for this tier yet.</p>
                <p className="text-sm text-gray-500">Our team is working to add more amazing prizes!</p>
              </div>
            )}
            
            <div className="text-center mt-6">
              <p className="text-gray-600 mb-4">
                You'll randomly receive <strong>one</strong> of these {tierPrizes.length} prizes when you crack your {selectedTier.name} cookie!
              </p>
              <button
                onClick={() => handlePurchase(selectedTier)}
                className={`px-8 py-3 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto ${
                  selectedTier.tier === 'bronze' ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' :
                  selectedTier.tier === 'silver' ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700' :
                  selectedTier.tier === 'gold' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700' :
                  selectedTier.tier === 'sapphire' ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' :
                  'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                }`}
              >
                Buy {selectedTier.name} Cookie ({formatPriceRange(selectedTier)})
                <ExternalLink className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">How Premium Cookies Work</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">💳</div>
              <h4 className="font-bold text-gray-800 mb-2">1. Purchase</h4>
              <p className="text-gray-600">
                Choose your tier and buy securely through Gumroad. Prices range from $13 to $458
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🍪</div>
              <h4 className="font-bold text-gray-800 mb-2">2. Crack</h4>
              <p className="text-gray-600">
                Return to crack your premium cookie and reveal your guaranteed prize
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🎁</div>
              <h4 className="font-bold text-gray-800 mb-2">3. Claim</h4>
              <p className="text-gray-600">
                Follow instructions to claim your amazing prize and share your win!
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 inline-block">
              <p className="text-sm text-gray-700">
                <strong>💡 Payment Integration Note:</strong> Gumroad integration will be implemented for secure payment processing. 
                Each tier will have its own product page with automatic redirect back to the cracking page.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};