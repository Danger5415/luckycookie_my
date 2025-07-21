import React, { useState } from 'react';

interface CookieAnimationProps {
  onCrack: () => void;
  isDisabled?: boolean;
  countdown?: string;
}

export const CookieAnimation: React.FC<CookieAnimationProps> = ({ 
  onCrack, 
  isDisabled = false, 
  countdown 
}) => {
  const [isCracking, setIsCracking] = useState(false);

  const handleCrack = () => {
    if (isDisabled || isCracking) return;
    
    setIsCracking(true);
    
    setTimeout(() => {
      onCrack();
      setIsCracking(false);
    }, 1500);
  };

  return (
    <div className="text-center">
      <div 
        className={`relative cursor-pointer transition-transform duration-300 ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
        } ${isCracking ? 'animate-pulse' : ''}`}
        onClick={handleCrack}
      >
        <div className="text-8xl mb-4">🍪</div>
        
        {isCracking && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">✨</div>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        {isDisabled && countdown ? (
          <div className="text-center">
            <p className="text-gray-600 mb-2">Next cookie ready in:</p>
            <p className="text-2xl font-bold text-yellow-600">{countdown}</p>
          </div>
        ) : (
          <button
            onClick={handleCrack}
            disabled={isDisabled || isCracking}
            className={`px-8 py-4 rounded-full font-bold text-white transition-all duration-300 ${
              isDisabled || isCracking
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 shadow-lg hover:shadow-xl'
            }`}
          >
            {isCracking ? 'Cracking...' : 'Crack Your Cookie! 🍪'}
          </button>
        )}
      </div>
    </div>
  );
};