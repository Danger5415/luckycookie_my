import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Crown, Star, Zap, Gift, Check, ExternalLink } from 'lucide-react';

export const Pricing: React.FC = () => {
  const pricingTiers = [
    {
      name: 'Free',
      price: 'Free',
      icon: '🎁',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      features: [
        'Crack a cookie every hour',
        'Beautiful fortune messages',
        'Chance to win gift cards ($1-$3)',
        'Track your streak and progress',
        'Access to leaderboard',
        'Bonus tasks for extra cracks'
      ],
      cta: 'Start Playing Free',
      ctaLink: '/login',
      popular: false
    },
    {
      name: 'Bronze',
      price: '$13',
      icon: '🥉',
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      features: [
        'Guaranteed prize worth $10-$13',
        'Instant crack (no waiting)',
        'Premium prize selection',
        'Priority support',
        'Leaderboard ranking boost',
        'Exclusive bronze tier rewards'
      ],
      cta: 'Buy Bronze Cookie',
      ctaLink: 'https://653415968405.gumroad.com/l/amvjh',
      popular: false
    },
    {
      name: 'Silver',
      price: '$33',
      icon: '🥈',
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      features: [
        'Guaranteed prize worth $20-$33',
        'Instant crack (no waiting)',
        'Premium prize selection',
        'Priority support',
        'Higher leaderboard ranking',
        'Exclusive silver tier rewards'
      ],
      cta: 'Buy Silver Cookie',
      ctaLink: 'https://653415968405.gumroad.com/l/samzj',
      popular: false
    },
    {
      name: 'Gold',
      price: '$65',
      icon: '🥇',
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      features: [
        'Guaranteed prize worth $46-$65',
        'Instant crack (no waiting)',
        'Premium prize selection',
        'Priority support',
        'Top leaderboard ranking',
        'Exclusive gold tier rewards'
      ],
      cta: 'Buy Gold Cookie',
      ctaLink: 'https://653415968405.gumroad.com/l/pjaep',
      popular: true
    },
    {
      name: 'Sapphire',
      price: '$196',
      icon: '💎',
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        'Guaranteed prize worth $98-$196',
        'Instant crack (no waiting)',
        'Premium prize selection',
        'VIP support',
        'Elite leaderboard status',
        'Exclusive sapphire tier rewards'
      ],
      cta: 'Buy Sapphire Cookie',
      ctaLink: 'https://653415968405.gumroad.com/l/ncbkj',
      popular: false
    },
    {
      name: 'Diamond',
      price: '$458',
      icon: '💍',
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: [
        'Guaranteed prize worth $327-$458',
        'Instant crack (no waiting)',
        'Premium prize selection',
        'VIP support',
        'Ultimate leaderboard status',
        'Exclusive diamond tier rewards'
      ],
      cta: 'Buy Diamond Cookie',
      ctaLink: 'https://653415968405.gumroad.com/l/sfrvaq',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
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
              <h1 className="text-2xl font-bold text-gray-800">Pricing</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🍪✨</div>
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            Choose Your Fortune Cookie Experience
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            From free daily fortunes to guaranteed premium prizes worth hundreds of dollars. 
            Every premium cookie guarantees a prize - no luck required!
          </p>
          
          <div className="flex justify-center space-x-8 mb-8">
            <div className="flex items-center">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              <span className="text-gray-700">Guaranteed Prizes</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-6 w-6 text-blue-500 mr-2" />
              <span className="text-gray-700">Instant Results</span>
            </div>
            <div className="flex items-center">
              <Crown className="h-6 w-6 text-purple-500 mr-2" />
              <span className="text-gray-700">Premium Experience</span>
            </div>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {pricingTiers.map((tier, index) => (
            <div 
              key={tier.name}
              className={`relative bg-white rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                tier.popular ? 'border-yellow-400 ring-4 ring-yellow-100' : tier.borderColor
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">{tier.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{tier.name}</h3>
                <div className={`text-4xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-4`}>
                  {tier.price}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center">
                {tier.name === 'Free' ? (
                  <Link
                    to={tier.ctaLink}
                    className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r ${tier.color}`}
                  >
                    <Gift className="h-5 w-5 mr-2" />
                    {tier.cta}
                  </Link>
                ) : (
                  <a
                    href={tier.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r ${tier.color}`}
                  >
                    {tier.cta}
                    <ExternalLink className="h-5 w-5 ml-2" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-12">
          <h3 className="text-3xl font-bold text-gray-800 text-center mb-8">How It Works</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Choose Your Tier</h4>
              <p className="text-gray-600">
                Select from our free option or premium tiers. Each premium tier guarantees a prize within that value range.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Crack Your Cookie</h4>
              <p className="text-gray-600">
                Click to crack your fortune cookie and reveal your prize. Premium cookies guarantee a win every time!
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Claim Your Prize</h4>
              <p className="text-gray-600">
                Follow the simple instructions to claim your prize. Digital prizes are delivered instantly, physical prizes ship within 7-14 days.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-12 mb-12">
          <h3 className="text-3xl font-bold text-gray-800 text-center mb-8">Frequently Asked Questions</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Are premium prizes really guaranteed?</h4>
              <p className="text-gray-700 mb-4">
                Yes! Every premium cookie purchase guarantees you'll receive a prize worth at least the minimum value of your chosen tier. There's no luck involved - you always win.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">How quickly do I receive my prize?</h4>
              <p className="text-gray-700 mb-4">
                Digital prizes (gift cards, credits) are delivered within 24-48 hours. Physical prizes are shipped within 7-14 business days with tracking information.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Can I get a refund if I'm not satisfied?</h4>
              <p className="text-gray-700 mb-4">
                Absolutely! We offer a 30-day money-back guarantee on all purchases. If you're not completely satisfied, we'll provide a full refund.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">How does the free tier work?</h4>
              <p className="text-gray-700 mb-4">
                Free users can crack one cookie per hour and have a chance to win gift cards worth $1-$3, or receive inspiring fortune messages. No purchase required!
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Are payments secure?</h4>
              <p className="text-gray-700 mb-4">
                Yes! All payments are processed securely through Paddle.com, our trusted payment partner. We never store your payment information.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Can I buy multiple cookies?</h4>
              <p className="text-gray-700 mb-4">
                Yes! You can purchase as many premium cookies as you'd like. Each purchase guarantees a separate prize from your chosen tier.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-12 text-white">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-3xl font-bold mb-4">Ready to Start Your Fortune Cookie Journey?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of players who are already winning amazing prizes!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/login"
              className="px-8 py-4 bg-white text-gray-800 rounded-xl hover:bg-gray-100 transition-all font-bold text-lg shadow-xl transform hover:scale-105 flex items-center"
            >
              <Gift className="h-5 w-5 mr-2" />
              Start Playing Free
            </Link>
            <a 
              href="https://653415968405.gumroad.com/l/pjaep"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white hover:text-gray-800 transition-all font-bold text-lg flex items-center"
            >
              <Crown className="h-5 w-5 mr-2" />
              Try Gold Tier
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};