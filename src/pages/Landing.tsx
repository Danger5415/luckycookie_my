import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Crown, Trophy, Gift, Star, Zap, Users, Shield, Clock, ExternalLink, ArrowRight, CheckCircle } from 'lucide-react';

export const Landing: React.FC = () => {
  const features = [
    {
      icon: <Cookie className="h-8 w-8 text-yellow-500" />,
      title: "Free Fortune Cookies",
      description: "Crack a free cookie every hour and discover amazing fortunes. You might even win exciting gifts!",
      highlight: "Every Hour"
    },
    {
      icon: <Crown className="h-8 w-8 text-purple-500" />,
      title: "Premium Tiers",
      description: "5 premium tiers with guaranteed prizes ranging from $13 to $458. Every premium cookie wins!",
      highlight: "Guaranteed Wins"
    },
    {
      icon: <Trophy className="h-8 w-8 text-blue-500" />,
      title: "Leaderboard",
      description: "Compete with players worldwide. Premium crackers get top 5 spots with exclusive rewards.",
      highlight: "Global Competition"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "Secure Payments",
      description: "Safe and secure payment processing through Gumroad. Your data is always protected.",
      highlight: "100% Secure"
    }
  ];

  const premiumTiers = [
    { name: 'Bronze', price: '$13', icon: '🥉', color: 'from-amber-400 to-orange-500' },
    { name: 'Silver', price: '$33', icon: '🥈', color: 'from-gray-400 to-gray-600' },
    { name: 'Gold', price: '$65', icon: '🥇', color: 'from-yellow-400 to-yellow-600' },
    { name: 'Sapphire', price: '$196', icon: '💍', color: 'from-blue-400 to-blue-600' },
    { name: 'Diamond', price: '$458', icon: '💎', color: 'from-purple-400 to-purple-600' }
  ];

  const testimonials = [
    {
      text: "I won an airpodes from a Gold tier cookie! This site is amazing!",
      author: "Sarah M.",
      tier: "Gold Winner"
    },
    {
      text: "Love the daily free cookies. Already won 3 gift cards this week!",
      author: "Mike R.",
      tier: "Free Player"
    },
    {
      text: "Premium cookies are worth it. Guaranteed prizes every time!",
      author: "Emma L.",
      tier: "Diamond Winner"
    }
  ];

  const stats = [
    { number: "2K+", label: "Happy Players" },
    { number: "50K+", label: "Cookies Cracked" },
    { number: "$200K+", label: "Prizes Won" },
    { number: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b-2 border-yellow-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="LuckyCookie.io Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3 object-contain"
            />
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800">LuckyCookie</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link 
              to="/leaderboard"
              className="flex items-center px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Leaderboard</span>
              <span className="sm:hidden">Ranks</span>
            </Link>
            <Link 
              to="/login"
              className="px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-base bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all font-bold shadow-lg"
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 sm:py-12 md:py-20 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-4xl sm:text-6xl md:text-8xl mb-4 sm:mb-6 md:mb-8 animate-bounce">🍪</div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6 px-2">
            Crack Your Way to
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent block sm:inline"> Amazing Prizes!</span>
          </h1>
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-4 sm:mb-6 md:mb-8 max-w-4xl mx-auto px-2">
            The world's most exciting fortune cookie experience. Get free fortunes every hour or buy premium cookies with guaranteed prizes worth up to $458!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-12 px-2">
            <Link 
              to="/login"
              className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all font-bold text-sm sm:text-base md:text-lg shadow-xl transform hover:scale-105 flex items-center justify-center"
            >
              Start Cracking Free <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <Link 
              to="/leaderboard"
              className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-white text-gray-800 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm sm:text-base md:text-lg shadow-lg border-2 border-gray-200 flex items-center justify-center"
            >
              <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              View Leaderboard
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 md:gap-8 max-w-4xl mx-auto px-2">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-600 mb-1 sm:mb-2">{stat.number}</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6 px-2">
              Why Choose LuckyCookie ?
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Experience the thrill of fortune cookies with real prizes, secure payments, and a global community of players.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-4 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex justify-center mb-2 sm:mb-3 md:mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-3 md:mb-4">{feature.description}</p>
                <span className="inline-block px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm font-medium">
                  {feature.highlight}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 sm:py-12 md:py-20 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6 px-2">
              How It Works
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 px-2">
              Get started in just 3 simple steps!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl font-bold mx-auto mb-3 sm:mb-4 md:mb-6">
                1
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 px-2">Sign Up Free</h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 px-2">
                Create your account in seconds. No email verification required - start playing immediately!
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl font-bold mx-auto mb-3 sm:mb-4 md:mb-6">
                2
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 px-2">Crack Cookies</h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 px-2">
                Crack free cookies every hour or buy premium cookies with guaranteed prizes!
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl font-bold mx-auto mb-3 sm:mb-4 md:mb-6">
                3
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 px-2">Win Prizes</h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 px-2">
                Claim your prizes and climb the leaderboard. Share your wins with friends!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Tiers */}
      <section className="py-8 sm:py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6 px-2">
              Premium Cookie Tiers
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Choose your tier and get guaranteed amazing prizes! Every premium cookie is a winner.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {premiumTiers.map((tier, index) => (
              <div key={index} className="text-center p-3 sm:p-4 md:p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 md:mb-4">{tier.icon}</div>
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-800 mb-1 sm:mb-2">{tier.name}</h3>
                <div className={`text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4`}>
                  {tier.price}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Guaranteed Prize
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 sm:mt-8 md:mt-12">
            <Link 
              to="/login"
              className="inline-flex items-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-bold text-sm sm:text-base md:text-lg shadow-xl"
            >
              <Crown className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Explore Premium Tiers
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-8 sm:py-12 md:py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6 px-2">
              What Our Players Say
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 px-2">
              Join thousands of happy winners!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm sm:text-base md:text-lg mb-3 sm:mb-4 md:mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold mr-2 sm:mr-3 md:mr-4 text-sm sm:text-base">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm sm:text-base">{testimonial.author}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{testimonial.tier}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="py-8 sm:py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6 px-2">
              Safe & Secure
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 px-2">
              Your security and privacy are our top priorities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center p-4 sm:p-6 md:p-8">
              <Shield className="h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 text-green-500 mx-auto mb-2 sm:mb-3 md:mb-4" />
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Secure Payments</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">
                All payments processed through Gumroad's secure platform. Your financial data is never stored on our servers.
              </p>
            </div>

            <div className="text-center p-4 sm:p-6 md:p-8">
              <Users className="h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 text-blue-500 mx-auto mb-2 sm:mb-3 md:mb-4" />
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Privacy Protected</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">
                Your personal information is encrypted and protected. We never share your data with third parties.
              </p>
            </div>

            <div className="text-center p-4 sm:p-6 md:p-8">
              <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 text-purple-500 mx-auto mb-2 sm:mb-3 md:mb-4" />
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Fair Play</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">
                All prize selections are completely random and fair. Every player has an equal chance to win.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 md:py-20 bg-gradient-to-r from-yellow-500 to-orange-500">
        <div className="max-w-4xl mx-auto text-center px-2 sm:px-4">
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 md:mb-8">🎉</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-6 px-2">
            Ready to Start Winning?
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-yellow-100 mb-4 sm:mb-6 md:mb-8 px-2">
            Join thousands of players who are already cracking their way to amazing prizes!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 px-2">
            <Link 
              to="/login"
              className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-white text-gray-800 rounded-xl hover:bg-gray-100 transition-all font-bold text-sm sm:text-base md:text-lg shadow-xl transform hover:scale-105 flex items-center justify-center"
            >
              <Cookie className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Start Playing Free
            </Link>
            <Link 
              to="/leaderboard"
              className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white hover:text-gray-800 transition-all font-bold text-sm sm:text-base md:text-lg flex items-center justify-center"
            >
              <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div>
              <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
                <img 
                  src="/logo.png" 
                  alt="LuckyCookie.io Logo" 
                  className="h-6 w-6 sm:h-8 sm:w-8 mr-2 object-contain"
                />
                <h3 className="text-base sm:text-lg md:text-xl font-bold">LuckyCookie.io</h3>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-gray-400">
                The world's most exciting fortune cookie experience with real prizes and global competition.
              </p>
            </div>

            <div>
              <h4 className="text-sm sm:text-base md:text-lg font-bold mb-2 sm:mb-3 md:mb-4">Quick Links</h4>
              <ul className="space-y-1 sm:space-y-2">
                <li><Link to="/login" className="text-xs sm:text-sm md:text-base text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/leaderboard" className="text-xs sm:text-sm md:text-base text-gray-400 hover:text-white transition-colors">Leaderboard</Link></li>
                <li><a href="#features" className="text-xs sm:text-sm md:text-base text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#premium" className="text-xs sm:text-sm md:text-base text-gray-400 hover:text-white transition-colors">Premium Tiers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm sm:text-base md:text-lg font-bold mb-2 sm:mb-3 md:mb-4">Support</h4>
              <ul className="space-y-1 sm:space-y-2">
                <li><span className="text-xs sm:text-sm md:text-base text-gray-400">Help Center</span></li>
                <li><span className="text-xs sm:text-sm md:text-base text-gray-400">Contact Us</span></li>
                <li><span className="text-xs sm:text-sm md:text-base text-gray-400">Privacy Policy</span></li>
                <li><span className="text-xs sm:text-sm md:text-base text-gray-400">Terms of Service</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm sm:text-base md:text-lg font-bold mb-2 sm:mb-3 md:mb-4">Connect</h4>
              <p className="text-xs sm:text-sm md:text-base text-gray-400 mb-2 sm:mb-3 md:mb-4">
                Follow us for updates and special promotions!
              </p>
              <div className="flex space-x-2 sm:space-x-3 md:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <span className="text-xs sm:text-sm">📧</span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <span className="text-xs sm:text-sm">🐦</span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <span className="text-xs sm:text-sm">📘</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-6 md:pt-8 text-center">
            <p className="text-xs sm:text-sm md:text-base text-gray-400">
              © 2025 LuckyCookie. All rights reserved. Made with ❤️ for cookie lovers worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};