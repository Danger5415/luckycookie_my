import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { CookieAnimation } from '../components/CookieAnimation';
import { CountdownTimer } from '../components/CountdownTimer';
import { ShareButton } from '../components/ShareButton';
import { FreePrizeClaimForm, type FreePrizeClaimData } from '../components/FreePrizeClaimForm';
import { getRandomFreePrize, type FreePrize } from '../lib/prizes';
import { User, Crown, History } from 'lucide-react';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [canCrack, setCanCrack] = useState(true);
  const [lastResult, setLastResult] = useState<{
    prize: FreePrize;
    timestamp: string;
    crackHistoryId?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showClaimForm, setShowClaimForm] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setUserProfile(data);
      
      // Check if user can crack (1 hour cooldown)
      if (data?.last_crack_time) {
        const lastCrack = new Date(data.last_crack_time);
        const now = new Date();
        const hoursSince = (now.getTime() - lastCrack.getTime()) / (1000 * 60 * 60);
        setCanCrack(hoursSince >= 1);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrack = async () => {
    if (!user || !canCrack) return;

    try {
      const prize = await getRandomFreePrize();
      const won = prize.type === 'gift';

      // Insert crack history
      const { data: historyData, error: historyError } = await supabase
        .from('crack_history')
        .insert({
          user_id: user.id,
          type: 'free',
          prize_data: JSON.stringify(prize),
          won,
          gift_name: won ? prize.productName : null,
          gift_value: won ? prize.value : null,
          fortune: !won ? prize.message : '',
        })
        .select()
        .single();

      if (historyError) throw historyError;

      // Update user profile
      const now = new Date().toISOString();
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          last_crack_time: now,
          total_cracks: (userProfile?.total_cracks || 0) + 1,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setLastResult({ 
        prize, 
        timestamp: new Date().toISOString(),
        crackHistoryId: historyData?.id
      });
      setCanCrack(false);
      await fetchUserProfile();
    } catch (error) {
      console.error('Error cracking cookie:', error);
    }
  };

  const handleClaimSubmit = async (claimData: FreePrizeClaimData) => {
    try {
      setShowClaimForm(false);
      alert('Claim submitted successfully! Our team will process your request within 24-48 hours and contact you via email.');
    } catch (error) {
      console.error('Error handling claim submission:', error);
      alert('Error submitting claim. Please try again.');
    }
  };

  const getNextCrackTime = () => {
    if (!userProfile?.last_crack_time) return null;
    const lastCrack = new Date(userProfile.last_crack_time);
    return new Date(lastCrack.getTime() + 60 * 60 * 1000); // Add 1 hour
  };

  const getShareContent = () => {
    if (!lastResult) return null;
    
    const baseUrl = window.location.origin;
    const { prize } = lastResult;
    
    if (prize.type === 'gift') {
      return {
        title: 'LuckyCookie.io - I Won a Prize! 🎉',
        text: `🍪 I just won ${prize.productName} on LuckyCookie.io! 🎉\n\nTry your luck too! ${baseUrl}`,
        url: baseUrl
      };
    } else {
      return {
        title: 'LuckyCookie.io - My Fortune 🔮',
        text: `🍪 My fortune from LuckyCookie.io:\n\n"${prize.message}"\n\nGet your fortune too! ${baseUrl}`,
        url: baseUrl
      };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍪</div>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-400 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const nextCrackTime = getNextCrackTime();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-yellow-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🍪</span>
            <h1 className="text-2xl font-bold text-gray-800">LuckyCookie.io</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard"
              className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <User className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
            <Link 
              to="/premium"
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Crown className="h-4 w-4 mr-2" />
              Premium
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to Your Daily Fortune! 🌟
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Crack a lucky cookie every hour and discover amazing fortunes. 
            You might even win exciting gifts!
          </p>
        </div>

        {/* Cookie Cracking Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8">
          <CookieAnimation 
            onCrack={handleCrack}
            isDisabled={!canCrack}
            countdown={nextCrackTime && !canCrack ? 
              <CountdownTimer 
                targetTime={nextCrackTime} 
                onComplete={() => setCanCrack(true)} 
              /> : undefined
            }
          />

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{userProfile?.total_cracks || 0}</p>
              <p className="text-sm text-gray-600">Total Cracks</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{userProfile?.streak || 0}</p>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
          </div>
        </div>

        {/* Last Result */}
        {lastResult && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center">
              {(() => {
                const { prize } = lastResult;
                const isGift = prize.type === 'gift';
                
                return (
                  <>
              <div className="text-4xl mb-4">
                    {isGift ? '🎉' : '✨'}
              </div>
              
                    {isGift ? (
                <div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">
                    Congratulations! You Won! 🎊
                  </h3>
                      <div className="mb-4">
                        {prize.image && (
                          <img 
                            src={prize.image} 
                            alt={prize.productName}
                            className="w-24 h-24 object-cover rounded-lg mx-auto mb-2"
                          />
                        )}
                        <p className="text-xl text-gray-700 font-semibold">{prize.productName}</p>
                        {prize.value && (
                          <p className="text-lg text-green-600">Worth ${prize.value}</p>
                        )}
                      </div>
                      
                      {/* Claim Prize Button */}
                      <div className="mb-4">
                        <button
                          onClick={() => setShowClaimForm(true)}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-bold shadow-lg"
                        >
                          📋 Claim Your Prize
                        </button>
                      </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl font-bold text-blue-600 mb-4">Your Fortune</h3>
                      <p className="text-xl text-gray-700 italic">"{prize.message}"</p>
                </div>
                    )}
                  </>
                );
              })()}

              {getShareContent() && !lastResult.prize.type === 'gift' && (
                <div className="mt-4 flex justify-center">
                  <ShareButton 
                    content={getShareContent()!}
                    variant="button"
                    size="lg"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  />
                </div>
              )}
              
              {/* Share button for gifts - show after claiming */}
              {lastResult.prize.type === 'gift' && !showClaimForm && (
                <div className="mt-4 flex justify-center">
                  <ShareButton 
                    content={getShareContent()!}
                    variant="button"
                    size="lg"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link 
            to="/dashboard"
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center mb-4">
              <History className="h-8 w-8 text-blue-500 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">View History</h3>
            </div>
            <p className="text-gray-600">
              Check your crack history, win streak, and see all your fortunes and prizes.
            </p>
          </Link>

          <Link 
            to="/premium"
            className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-purple-200"
          >
            <div className="flex items-center mb-4">
              <Crown className="h-8 w-8 text-purple-500 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">Premium Cookies</h3>
            </div>
            <p className="text-gray-600">
              Buy premium cookies with guaranteed prizes! Choose from 5 tiers: Bronze, Silver, Gold, Sapphire, and Diamond.
            </p>
          </Link>
        </div>
      </main>
      
      {/* Free Prize Claim Form Modal */}
      {showClaimForm && lastResult && lastResult.prize.type === 'gift' && lastResult.crackHistoryId && (
        <FreePrizeClaimForm
          crackHistoryId={lastResult.crackHistoryId}
          prizeName={lastResult.prize.productName || 'Free Prize'}
          prizeValue={lastResult.prize.value || 0}
          onClose={() => setShowClaimForm(false)}
          onSubmit={handleClaimSubmit}
        />
      )}
    </div>
  );
};