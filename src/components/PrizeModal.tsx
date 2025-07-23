import React from 'react';
import { X } from 'lucide-react';
import { type PremiumTier, type PremiumPrize, formatPriceRange } from '../lib/prizes';

interface PrizeModalProps {
  selectedTier: PremiumTier;
  tierPrizes: PremiumPrize[];
  loadingPrizes: boolean;
  onClose: () => void;
  onPurchase: (tier: PremiumTier) => void;
}

export const PrizeModal: React.FC<PrizeModalProps> = ({
  selectedTier,
  tierPrizes,
  loadingPrizes,
  onClose,
  onPurchase
}) => {
  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`sticky top-0 bg-white rounded-t-3xl border-b-2 ${selectedTier.borderColor} p-6 z-10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-4xl mr-3">{selectedTier.icon}</span>
              <div>
                <h2 className={`text-3xl font-bold ${selectedTier.color}`}>
                  {selectedTier.name} Tier Prizes
                </h2>
                <p className="text-gray-600 mt-1">
                  You'll randomly receive one of these prizes when you crack your {selectedTier.name} cookie!
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loadingPrizes ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent mb-4"></div>
              <p className="text-gray-600 text-lg">Loading available prizes...</p>
            </div>
          ) : tierPrizes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                {tierPrizes.slice(0, 10).map((prize) => (
                  <div 
                    key={prize.id}
                    className={`${selectedTier.bgColor} rounded-xl p-4 border ${selectedTier.borderColor} hover:shadow-lg transition-shadow`}
                  >
                    <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-white">
                      <img 
                        src={prize.image} 
                        alt={prize.productName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
                      {prize.productName}
                    </h4>
                    {prize.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {prize.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Prize Count Info */}
              <div className={`${selectedTier.bgColor} border ${selectedTier.borderColor} rounded-xl p-4 mb-6`}>
                <div className="flex items-center justify-center">
                  <span className="text-2xl mr-2">🎲</span>
                  <p className="text-gray-700 text-center">
                    <strong>{tierPrizes.length}</strong> amazing prizes available in this tier. 
                    You'll randomly receive <strong>one</strong> when you crack your cookie!
                  </p>
                </div>
              </div>

              {/* Purchase Button */}
              <div className="text-center">
                <button
                  onClick={() => onPurchase(selectedTier)}
                  className={`px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg text-lg ${
                    selectedTier.tier === 'bronze' ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' :
                    selectedTier.tier === 'silver' ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700' :
                    selectedTier.tier === 'gold' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700' :
                    selectedTier.tier === 'sapphire' ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' :
                    'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                  }`}
                >
                  Buy {selectedTier.name} Cookie ({formatPriceRange(selectedTier)})
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Prizes Available</h3>
              <p className="text-gray-600 mb-4">
                No prizes are currently available for the {selectedTier.name} tier.
              </p>
              <p className="text-sm text-gray-500">
                Our team is working to add more amazing prizes! Check back soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};