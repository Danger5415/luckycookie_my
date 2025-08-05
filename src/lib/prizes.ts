// Prize data and logic for both free and premium cookies

import { DatabaseService } from './database';

export interface FreePrize {
  id: string;
  type: 'fortune' | 'gift';
  message?: string;
  productName?: string;
  image?: string;
  value?: number;
}

export interface PremiumPrize {
  id: string;
  tier: 'bronze' | 'silver' | 'gold' | 'sapphire' | 'diamond';
  productName: string;
  image: string;
  description?: string;
  value: number;
}

export interface PremiumTier {
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'sapphire' | 'diamond';
  priceRange: {
    min: number;
    max: number;
  };
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  gumroadLink: string;
}

// Free prizes pool (10% chance to win gift, 90% chance to get fortune)
export const freePrizes: FreePrize[] = [
  // Fortunes (90% of the pool)
  {
    id: 'f1',
    type: 'fortune',
    message: "Your kindness will be repaid tenfold today! 🌟"
  },
  {
    id: 'f2',
    type: 'fortune',
    message: "A beautiful surprise awaits you this week! ✨"
  },
  {
    id: 'f3',
    type: 'fortune',
    message: "Your creativity will lead to amazing opportunities! 🎨"
  },
  {
    id: 'f4',
    type: 'fortune',
    message: "Someone special is thinking of you right now! 💝"
  },
  {
    id: 'f5',
    type: 'fortune',
    message: "Your positive energy is contagious - keep shining! ☀️"
  },
  {
    id: 'f6',
    type: 'fortune',
    message: "An unexpected gift will brighten your day! 🎁"
  },
  {
    id: 'f7',
    type: 'fortune',
    message: "Your hard work will soon pay off magnificently! 💪"
  },
  {
    id: 'f8',
    type: 'fortune',
    message: "A door to new adventures is about to open! 🚪"
  },
  {
    id: 'f9',
    type: 'fortune',
    message: "Your smile will light up someone's world today! 😊"
  },
  {
    id: 'f10',
    type: 'fortune',
    message: "Good fortune follows you wherever you go! 🍀"
  },
  {
    id: 'f11',
    type: 'fortune',
    message: "Your dreams are closer than you think! 🌙"
  },
  {
    id: 'f12',
    type: 'fortune',
    message: "A special friendship will blossom soon! 🌸"
  },
  {
    id: 'f13',
    type: 'fortune',
    message: "Your wisdom will guide someone to success! 🦉"
  },
  {
    id: 'f14',
    type: 'fortune',
    message: "An amazing opportunity is heading your way! 🎯"
  },
  {
    id: 'f15',
    type: 'fortune',
    message: "Your generosity will return to you multiplied! 💖"
  },
  {
    id: 'f16',
    type: 'fortune',
    message: "A joyful reunion is in your near future! 🤗"
  },
  {
    id: 'f17',
    type: 'fortune',
    message: "Your talents will be recognized and celebrated! 🏆"
  },
  {
    id: 'f18',
    type: 'fortune',
    message: "A stroke of good luck will change everything! ⚡"
  },
  // Gifts (10% of the pool)
  {
    id: 'g1',
    type: 'gift',
    productName: '$1 Amazon Gift Card',
    image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=400',
    value: 1
  },
  {
    id: 'g2',
    type: 'gift',
    productName: '$2 Starbucks Gift Card',
    image: 'https://images.pexels.com/photos/4350057/pexels-photo-4350057.jpeg?auto=compress&cs=tinysrgb&w=400',
    value: 2
  },
  {
    id: 'g3',
    type: 'gift',
    productName: '$3 iTunes Gift Card',
    image: 'https://images.pexels.com/photos/5632371/pexels-photo-5632371.jpeg?auto=compress&cs=tinysrgb&w=400',
    value: 3
  },
  {
    id: 'g4',
    type: 'gift',
    productName: '$1.50 Google Play Credit',
    image: 'https://images.pexels.com/photos/4350057/pexels-photo-4350057.jpeg?auto=compress&cs=tinysrgb&w=400',
    value: 1.5
  }
];

// Premium prize tiers configuration
export const premiumTiers: PremiumTier[] = [
  {
    name: 'Free',
    tier: 'free',
    priceRange: { min: 0.65, max: 3.27 },
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: '🎁',
    gumroadLink: ''
  },
  {
    name: 'Bronze',
    tier: 'bronze',
    priceRange: { min: 13.00, max: 13.00 },
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: '🥉',
    gumroadLink: 'https://653415968405.gumroad.com/l/amvjh'
  },
  {
    name: 'Silver',
    tier: 'silver',
    priceRange: { min: 33.00, max: 33.00 },
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: '🥈',
    gumroadLink: 'https://653415968405.gumroad.com/l/samzj'
  },
  {
    name: 'Gold',
    tier: 'gold',
    priceRange: { min: 65.00, max: 65.00 },
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: '🥇',
    gumroadLink: 'https://653415968405.gumroad.com/l/pjaep'
  },
  {
    name: 'Sapphire',
    tier: 'sapphire',
    priceRange: { min: 196.00, max: 196.00 },
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: '💎',
    gumroadLink: 'https://653415968405.gumroad.com/l/ncbkj'
  },
  {
    name: 'Diamond',
    tier: 'diamond',
    priceRange: { min: 458.00, max: 458.00 },
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: '💍',
    gumroadLink: 'https://653415968405.gumroad.com/l/sfrvaq'
  }
];

// Premium prizes pool
export const premiumPrizes: PremiumPrize[] = [
  // Bronze Tier ($6.53 - $13.07)
  {
    id: 'b1',
    tier: 'bronze',
    productName: '$10 Amazon Gift Card',
    image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Perfect for your next online purchase',
    value: 10
  },
  {
    id: 'b2',
    tier: 'bronze',
    productName: 'Wireless Phone Charger',
    image: 'https://images.pexels.com/photos/4792728/pexels-photo-4792728.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Convenient wireless charging pad',
    value: 12
  },
  {
    id: 'b3',
    tier: 'bronze',
    productName: 'Bluetooth Earbuds',
    image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'High-quality wireless earbuds',
    value: 13
  },
  {
    id: 'b4',
    tier: 'bronze',
    productName: 'Phone Ring Holder',
    image: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Stylish and functional phone accessory',
    value: 8
  },
  {
    id: 'b5',
    tier: 'bronze',
    productName: 'USB Cable Set',
    image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Multi-port charging cable set',
    value: 9
  },

  // Silver Tier ($19.60 - $32.67)
  {
    id: 's1',
    tier: 'silver',
    productName: 'Wireless Mouse',
    image: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Ergonomic wireless computer mouse',
    value: 25
  },
  {
    id: 's2',
    tier: 'silver',
    productName: 'Portable Speaker',
    image: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Compact Bluetooth speaker',
    value: 30
  },
  {
    id: 's3',
    tier: 'silver',
    productName: 'Phone Case with Wallet',
    image: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Premium leather phone case',
    value: 22
  },
  {
    id: 's4',
    tier: 'silver',
    productName: 'LED Desk Lamp',
    image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Adjustable LED desk lamp',
    value: 28
  },
  {
    id: 's5',
    tier: 'silver',
    productName: 'Power Bank 10000mAh',
    image: 'https://images.pexels.com/photos/4792728/pexels-photo-4792728.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'High-capacity portable charger',
    value: 32
  },

  // Gold Tier ($45.74 - $65.35)
  {
    id: 'g1',
    tier: 'gold',
    productName: 'Mechanical Keyboard',
    image: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'RGB mechanical gaming keyboard',
    value: 55
  },
  {
    id: 'g2',
    tier: 'gold',
    productName: 'Wireless Headphones',
    image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Noise-cancelling wireless headphones',
    value: 60
  },
  {
    id: 'g3',
    tier: 'gold',
    productName: 'Smart Watch',
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Fitness tracking smartwatch',
    value: 65
  },
  {
    id: 'g4',
    tier: 'gold',
    productName: 'Webcam HD 1080p',
    image: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Professional HD webcam',
    value: 50
  },
  {
    id: 'g5',
    tier: 'gold',
    productName: 'Gaming Mouse Pad',
    image: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Large RGB gaming mouse pad',
    value: 45
  },

  // Sapphire Tier ($98.02 - $196.04)
  {
    id: 'sp1',
    tier: 'sapphire',
    productName: 'Gaming Headset',
    image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Professional gaming headset with mic',
    value: 120
  },
  {
    id: 'sp2',
    tier: 'sapphire',
    productName: 'Tablet 10-inch',
    image: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'High-resolution Android tablet',
    value: 150
  },
  {
    id: 'sp3',
    tier: 'sapphire',
    productName: 'Wireless Charging Station',
    image: 'https://images.pexels.com/photos/4792728/pexels-photo-4792728.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Multi-device wireless charging hub',
    value: 100
  },
  {
    id: 'sp4',
    tier: 'sapphire',
    productName: 'Bluetooth Speaker Pro',
    image: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Premium waterproof Bluetooth speaker',
    value: 180
  },
  {
    id: 'sp5',
    tier: 'sapphire',
    productName: 'Smart Home Hub',
    image: 'https://images.pexels.com/photos/4792728/pexels-photo-4792728.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Voice-controlled smart home device',
    value: 190
  },

  // Diamond Tier ($326.74 - $457.43)
  {
    id: 'd1',
    tier: 'diamond',
    productName: 'Gaming Console',
    image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Latest generation gaming console',
    value: 400
  },
  {
    id: 'd2',
    tier: 'diamond',
    productName: 'High-End Smartphone',
    image: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Premium flagship smartphone',
    value: 450
  },
  {
    id: 'd3',
    tier: 'diamond',
    productName: 'Professional Monitor',
    image: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: '27-inch 4K professional monitor',
    value: 380
  },
  {
    id: 'd4',
    tier: 'diamond',
    productName: 'Laptop Ultrabook',
    image: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'High-performance ultrabook laptop',
    value: 420
  },
  {
    id: 'd5',
    tier: 'diamond',
    productName: 'VR Headset',
    image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Premium virtual reality headset',
    value: 350
  }
];

// Helper functions
export const getRandomFreePrize = async (): Promise<FreePrize> => {
  const random = Math.random();
  
  // 10% chance to win a gift from Amazon
  if (random < 0.2) {
    try {
      // Try to get a dynamic prize from database (price range $0.67 - $3.27)
      const dynamicPrize = await DatabaseService.getRandomFreePrizeByPriceRange(0.67, 3.27);
      
      if (dynamicPrize) {
        return {
          id: dynamicPrize.id,
          type: 'gift',
          productName: dynamicPrize.name,
          image: dynamicPrize.image_url,
          value: Number(dynamicPrize.price_usd)
        };
      }
    } catch (error) {
      console.error('Error fetching dynamic free prize from database:', error);
    }
    
    // Fallback to static gifts if database prizes not available
    const gifts = freePrizes.filter(prize => prize.type === 'gift');
    return gifts[Math.floor(Math.random() * gifts.length)];
  }
  
  // 90% chance to get a fortune
  const fortunes = freePrizes.filter(prize => prize.type === 'fortune');
  return fortunes[Math.floor(Math.random() * fortunes.length)];
};

export const getPremiumPrizesByTier = (tier: string): PremiumPrize[] => {
  return premiumPrizes.filter(prize => prize.tier === tier);
};

export const getRandomPremiumPrize = async (tier: string): Promise<PremiumPrize> => {
  try {
    // Try to get a manual prize from the database
    const dynamicPrize = await DatabaseService.getRandomPrizeByTier(tier);
    
    if (dynamicPrize) {
      return {
        id: dynamicPrize.id,
        tier: dynamicPrize.tier as any,
        productName: dynamicPrize.name,
        image: dynamicPrize.image_url,
        description: dynamicPrize.description || `Premium ${tier} tier prize`,
        value: Number(dynamicPrize.price_usd)
      };
    }
  } catch (error) {
    console.error('Error fetching premium prize from database:', error);
  }
  
  // Fallback to static prizes if database prizes not available
  const tierPrizes = getPremiumPrizesByTier(tier);
  return tierPrizes[Math.floor(Math.random() * tierPrizes.length)];
};

// Get manual prizes for tier display
export const getDynamicPremiumPrizesByTier = async (tier: string): Promise<PremiumPrize[]> => {
  try {
    const manualPrizes = await DatabaseService.getPrizesForTierDisplay(tier);
    
    if (manualPrizes && manualPrizes.length > 0) {
      return manualPrizes.map(prize => ({
        id: prize.id,
        tier: prize.tier as any,
        productName: prize.name,
        image: prize.image_url,
        description: prize.description || `Premium ${tier} tier prize`,
        value: Number(prize.price_usd)
      }));
    }
  } catch (error) {
    console.error('Error fetching manual prizes for tier:', error);
  }
  
  // Fallback to static prizes
  return getPremiumPrizesByTier(tier);
};

export const getTierByName = (tierName: string): PremiumTier | undefined => {
  return premiumTiers.find(tier => tier.name.toLowerCase() === tierName.toLowerCase());
};

export const formatPriceRange = (tier: PremiumTier): string => {
  return `$${tier.priceRange.min.toFixed(2)}`;
};
