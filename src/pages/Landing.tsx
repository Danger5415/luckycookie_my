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
    { name: 'Sapphire', price: '$196', icon: '💎', color: 'from-blue-400 to-blue-600' },
    { name: 'Diamond', price: '$458', icon: '💍', color: 'from-purple-400 to-purple-600' }
  ];

  const testimonials = [
    {
      text: "I won an iPhone 15 Pro from a Gold tier cookie! This site is amazing!",
      author: "Sarah M.",
      tier: "Gold Winner"
    },
    {
      text: "Love the daily free cookies. Already won 3 gift cards this month!",
      author: "Mike R.",
      tier: "Free Player"
    },
    {
      text: "Premium cookies are worth it. Guaranteed prizes every time!",
      author: "Emma L.",
      tier: "Diamond Member"
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Players" },
    { number: "100K+", label: "Cookies Cracked" },
    { number: "$2M+", label: "Prizes Won" },
    { number: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b-2 border-yellow-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="LuckyCookie.io Logo" 
              className="h-10 w-10 mr-3 object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-800">LuckyCookie.io</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/leaderboard"
              className="flex items-center px-4 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </Link>
            <Link 
              to="/login"
              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all font-bold shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-8xl mb-8 animate-bounce">🍪</div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
            Crack Your Way to
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent"> Amazing Prizes!</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
            The world's most exciting fortune cookie experience. Get free fortunes every hour or buy premium cookies with guaranteed prizes worth up to $458!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
            <Link 
              to="/login"
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all font-bold text-lg shadow-xl transform hover:scale-105 flex items-center"
            >
              Start Cracking Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              to="/leaderboard"
              className="px-8 py-4 bg-white text-gray-800 rounded-xl hover:bg-gray-50 transition-all font-bold text-lg shadow-lg border-2 border-gray-200 flex items-center"
            >
              <Trophy className="mr-2 h-5 w-5" />
              View Leaderboard
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Why Choose LuckyCookie.io?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the thrill of fortune cookies with real prizes, secure payments, and a global community of players.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {feature.highlight}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just 3 simple steps!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Sign Up Free</h3>
              <p className="text-gray-600 text-lg">
                Create your account in seconds. No email verification required - start playing immediately!
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Crack Cookies</h3>
              <p className="text-gray-600 text-lg">
                Crack free cookies every hour or buy premium cookies with guaranteed prizes!
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Win Prizes</h3>
              <p className="text-gray-600 text-lg">
                Claim your prizes and climb the leaderboard. Share your wins with friends!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Tiers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Premium Cookie Tiers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose your tier and get guaranteed amazing prizes! Every premium cookie is a winner.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {premiumTiers.map((tier, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">{tier.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{tier.name}</h3>
                <div className={`text-2xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-4`}>
                  {tier.price}
                </div>
                <div className="text-sm text-gray-600">
                  Guaranteed Prize
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-bold text-lg shadow-xl"
            >
              <Crown className="mr-2 h-5 w-5" />
              Explore Premium Tiers
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              What Our Players Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of happy winners!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.tier}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Safe & Secure
            </h2>
            <p className="text-xl text-gray-600">
              Your security and privacy are our top priorities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-3">Secure Payments</h3>
              <p className="text-gray-600">
                All payments processed through Gumroad's secure platform. Your financial data is never stored on our servers.
              </p>
            </div>

            <div className="text-center p-8">
              <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-3">Privacy Protected</h3>
              <p className="text-gray-600">
                Your personal information is encrypted and protected. We never share your data with third parties.
              </p>
            </div>

            <div className="text-center p-8">
              <CheckCircle className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-3">Fair Play</h3>
              <p className="text-gray-600">
                All prize selections are completely random and fair. Every player has an equal chance to win.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-500 to-orange-500">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="text-6xl mb-8">🎉</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Winning?
          </h2>
          <p className="text-xl text-yellow-100 mb-8">
            Join thousands of players who are already cracking their way to amazing prizes!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/login"
              className="px-8 py-4 bg-white text-gray-800 rounded-xl hover:bg-gray-100 transition-all font-bold text-lg shadow-xl transform hover:scale-105 flex items-center"
            >
              <Cookie className="mr-2 h-5 w-5" />
              Start Playing Free
            </Link>
            <Link 
              to="/leaderboard"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white hover:text-gray-800 transition-all font-bold text-lg flex items-center"
            >
              <Trophy className="mr-2 h-5 w-5" />
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="/logo.png" 
                  alt="LuckyCookie.io Logo" 
                  className="h-8 w-8 mr-2 object-contain"
                />
                <h3 className="text-xl font-bold">LuckyCookie.io</h3>
              </div>
              <p className="text-gray-400">
                The world's most exciting fortune cookie experience with real prizes and global competition.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</Link></li>
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#premium" className="text-gray-400 hover:text-white transition-colors">Premium Tiers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-400">Help Center</span></li>
                <li><span className="text-gray-400">Contact Us</span></li>
                <li><span className="text-gray-400">Privacy Policy</span></li>
                <li><span className="text-gray-400">Terms of Service</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Connect</h4>
              <p className="text-gray-400 mb-4">
                Follow us for updates and special promotions!
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <span className="text-sm">📧</span>
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <span className="text-sm">🐦</span>
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <span className="text-sm">📘</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 LuckyCookie. All rights reserved. Made with ❤️ for cookie lovers worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};