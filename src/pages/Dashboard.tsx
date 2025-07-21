import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { signOut } from '../lib/auth';
import { premiumTiers } from '../lib/prizes';
import { ArrowLeft, Trophy, Calendar, Gift, LogOut, Clock, Share2, Check, Copy, Package } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [crackHistory, setCrackHistory] = useState<any[]>([]);
  const [shippingAddresses, setShippingAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shareStates, setShareStates] = useState<{ [key: string]: 'idle' | 'sharing' | 'copied' }>({});

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profile);

      // Fetch crack history
      const { data: history, error: historyError } = await supabase
        .from('crack_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (historyError) throw historyError;
      setCrackHistory(history);

      // Fetch shipping addresses for premium prizes
      const { data: addresses, error: addressError } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (addressError) throw addressError;
      setShippingAddresses(addresses || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getNextCrackTime = () => {
    if (!userProfile?.last_crack_time) return null;
    const lastCrack = new Date(userProfile.last_crack_time);
    const nextCrack = new Date(lastCrack.getTime() + 60 * 60 * 1000);
    const now = new Date();
    
    if (nextCrack <= now) return 'Ready now!';
    
    const diff = nextCrack.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const handleShare = async (crack: any) => {
    const crackId = crack.id;
    setShareStates(prev => ({ ...prev, [crackId]: 'sharing' }));

    try {
      const shareData = generateShareContent(crack);
      
      // Try native sharing first (mobile devices)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShareStates(prev => ({ ...prev, [crackId]: 'idle' }));
        return;
      }
      
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareData.text);
      setShareStates(prev => ({ ...prev, [crackId]: 'copied' }));
      
      // Reset state after 2 seconds
      setTimeout(() => {
        setShareStates(prev => ({ ...prev, [crackId]: 'idle' }));
      }, 2000);
      
    } catch (error) {
      console.error('Error sharing:', error);
      setShareStates(prev => ({ ...prev, [crackId]: 'idle' }));
    }
  };

  const generateShareContent = (crack: any) => {
    const baseUrl = window.location.origin;
    const date = new Date(crack.created_at).toLocaleDateString();
    
    if (crack.type === 'premium' || crack.won) {
      const prizeInfo = crack.type === 'premium' 
        ? `${crack.gift_name} (${crack.premium_tier?.toUpperCase()} tier)` 
        : crack.gift_name;
        
      return {
        title: 'LuckyCookie.io - I Won a Prize! 🎉',
        text: `🍪 I just won ${prizeInfo} on LuckyCookie.io! 🎉\n\nDate: ${date}\n\nCrack free fortune cookies every hour and win amazing prizes! Try your luck too! ${baseUrl}`,
        url: baseUrl
      };
    } else {
      return {
        title: 'LuckyCookie.io - My Fortune 🔮',
        text: `🍪 My fortune from LuckyCookie.io:\n\n"${crack.fortune}"\n\nDate: ${date}\n\nCrack free fortune cookies every hour and discover amazing fortunes! Get your fortune too! ${baseUrl}`,
        url: baseUrl
      };
    }
  };

  const getShareIcon = (crackId: string) => {
    const state = shareStates[crackId] || 'idle';
    
    switch (state) {
      case 'sharing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'copied':
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Share2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getShareButtonClass = (crackId: string) => {
    const state = shareStates[crackId] || 'idle';
    const baseClass = "p-2 rounded-lg transition-all duration-200 flex items-center justify-center";
    
    switch (state) {
      case 'sharing':
        return `${baseClass} bg-blue-50 cursor-wait`;
      case 'copied':
        return `${baseClass} bg-green-50`;
      default:
        return `${baseClass} hover:bg-gray-100 active:bg-gray-200`;
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center min-w-0">
          <div className="flex items-center">
            <Link to="/home" className="flex items-center text-gray-600 hover:text-gray-800 mr-2 sm:mr-6">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center px-2 sm:px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm sm:text-base flex-shrink-0"
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back! 👋</h2>
              <p className="text-gray-600 text-lg">{user?.email}</p>
            </div>
            <div className="text-6xl">🍪</div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{userProfile?.total_cracks || 0}</p>
              <p className="text-sm text-gray-600">Total Cracks</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <Calendar className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">{userProfile?.streak || 0}</p>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <Gift className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {crackHistory.filter(crack => crack.won).length}
              </p>
              <p className="text-sm text-gray-600">Gifts Won</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <Package className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">
                {shippingAddresses.filter(addr => addr.status === 'pending' || addr.status === 'processing').length}
              </p>
              <p className="text-sm text-gray-600">Pending Shipments</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <Gift className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {crackHistory.filter(crack => crack.type === 'free' && crack.won).length}
              </p>
              <p className="text-sm text-gray-600">Free Gifts Won</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-blue-600">{getNextCrackTime()}</p>
              <p className="text-sm text-gray-600">Next Crack</p>
            </div>
          </div>

          {/* Shipping Status Section */}
          {shippingAddresses.length > 0 && (
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h4 className="font-bold text-purple-800 mb-2 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Prize Shipments
              </h4>
              <div className="space-y-2">
                {shippingAddresses.slice(0, 3).map((address) => (
                  <div key={address.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Prize shipment to {address.city}, {address.country}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      address.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      address.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      address.status === 'shipped' ? 'bg-green-100 text-green-800' :
                      address.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {address.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Crack History */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h3>
          
          {crackHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍪</div>
              <p className="text-gray-600 text-lg">No cracks yet! Go crack your first cookie!</p>
              <Link 
                to="/home"
                className="inline-block mt-4 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Crack a Cookie
              </Link>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {crackHistory.map((crack) => (
                <div 
                  key={crack.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    crack.type === 'premium' 
                      ? 'bg-purple-50 border-purple-500'
                      : crack.won 
                        ? 'bg-green-50 border-green-500' 
                        : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">
                          {crack.type === 'premium' ? '👑' : crack.won ? '🎉' : '✨'}
                        </span>
                        <span className={`font-bold ${
                          crack.type === 'premium' 
                            ? 'text-purple-600'
                            : crack.won 
                              ? 'text-green-600' 
                              : 'text-blue-600'
                        }`}>
                          {crack.type === 'premium' 
                            ? 'Premium Prize Won!' 
                            : crack.won 
                              ? 'Free Gift Won!' 
                              : 'Fortune Received'}
                        </span>
                        
                        {crack.type === 'premium' && crack.premium_tier && (
                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                            {crack.premium_tier.toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      {crack.fortune && (
                        <p className="text-gray-700 italic mb-1">"{crack.fortune}"</p>
                      )}
                      
                      {(crack.won || crack.type === 'premium') && (
                        <div>
                          <p className={`font-semibold ${
                            crack.type === 'premium' ? 'text-purple-600' : 'text-green-600'
                          }`}>
                            🎁 {crack.gift_name}
                            {crack.gift_value && (
                              <span className="text-gray-500 ml-2">(${crack.gift_value})</span>
                            )}
                          </p>
                          
                          {/* Show shipping status for premium prizes */}
                          {crack.type === 'premium' && (
                            <div className="mt-2">
                              {(() => {
                                const relatedShipping = shippingAddresses.find(addr => 
                                  addr.created_at.substring(0, 10) === crack.created_at.substring(0, 10)
                                );
                                
                                if (relatedShipping) {
                                  return (
                                    <div className="flex items-center text-sm">
                                      <Package className="h-4 w-4 mr-1 text-purple-500" />
                                      <span className="text-gray-600">Shipping: </span>
                                      <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                                        relatedShipping.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        relatedShipping.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                        relatedShipping.status === 'shipped' ? 'bg-green-100 text-green-800' :
                                        relatedShipping.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {relatedShipping.status}
                                      </span>
                                      {relatedShipping.tracking_number && (
                                        <span className="ml-2 text-xs text-gray-500">
                                          Tracking: {relatedShipping.tracking_number}
                                        </span>
                                      )}
                                    </div>
                                  );
                                } else if (crack.type === 'premium') {
                                  return (
                                    <div className="flex items-center text-sm text-orange-600">
                                      <Package className="h-4 w-4 mr-1" />
                                      <span>Shipping info needed</span>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="text-right text-sm text-gray-500">
                        {new Date(crack.created_at).toLocaleDateString()}
                        <br />
                        {new Date(crack.created_at).toLocaleTimeString()}
                      </div>
                      
                      <button
                        onClick={() => handleShare(crack)}
                        className={getShareButtonClass(crack.id)}
                        title={
                          shareStates[crack.id] === 'copied' 
                            ? 'Copied to clipboard!' 
                            : (crack.won || crack.type === 'premium')
                              ? 'Share your win!' 
                              : 'Share your fortune!'
                        }
                        disabled={shareStates[crack.id] === 'sharing'}
                      >
                        {getShareIcon(crack.id)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};