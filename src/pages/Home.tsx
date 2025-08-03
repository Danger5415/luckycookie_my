import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { DatabaseService } from '../lib/database';
import { CookieAnimation } from '../components/CookieAnimation';
import { CountdownTimer } from '../components/CountdownTimer';
import { ShareButton } from '../components/ShareButton';
import { FreePrizeClaimForm, type FreePrizeClaimData } from '../components/FreePrizeClaimForm';
import { BonusTasks } from '../components/BonusTasks';
import { getRandomFreePrize, type FreePrize } from '../lib/prizes';
import { User, Crown, History, Trophy } from 'lucide-react';

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
  const [isApplyingShareBonus, setIsApplyingShareBonus] = useState(false);

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

      // Send notification for free prize wins
      if (won && user) {
        console.log('🎁 About to send free prize win notification for:', prize.productName);
        await DatabaseService.notifyPrizeWin({
          type: 'free_prize_win',
          user: {
            email: user.email!,
            id: user.id,
          },
          prize: {
            name: prize.productName || 'Free Prize',
            value: prize.value,
            type: prize.type,
          },
        });
        console.log('🎁 Free prize win notification call completed');
      }
    } catch (error) {
      console.error('Error cracking cookie:', error);
    }
  };

  const handleShareBonusApplied = async (crackHistoryId: string) => {
    if (!user) return;

    console.log('🎁 Starting share bonus application for crack:', crackHistoryId);
    setIsApplyingShareBonus(true);

    try {
      // Check if bonus has already been applied
      console.log('🔍 Checking if share bonus already applied...');
      const bonusAlreadyApplied = await DatabaseService.checkShareBonusApplied(crackHistoryId);
      
      if (bonusAlreadyApplied) {
        console.log('⚠️ Share bonus already applied for this win');
        alert('Share bonus has already been applied for this win!');
        return;
      }

      // Apply the share bonus (reduce cooldown by 30 minutes)
      console.log('⏰ Applying share bonus - reducing cooldown by 30 minutes...');
      await DatabaseService.adjustLastCrackTime(user.id, 30);
      
      // Mark this win as having granted the bonus
      console.log('✅ Marking crack history as bonus applied...');
      await DatabaseService.updateCrackHistoryShareStatus(crackHistoryId);
      
      // Show success message
      console.log('🎉 Share bonus applied successfully');
      alert('🎉 Share bonus applied! Your next crack is now available 30 minutes earlier!');
      
      // Refresh user profile to update the countdown
      console.log('🔄 Refreshing user profile to update countdown...');
      await fetchUserProfile();
      console.log('✅ User profile refreshed after share bonus');
      
    } catch (error) {
      console.error('❌ Error applying share bonus:', error);
      alert('Error applying share bonus. Please try again.');
    } finally {
      console.log('🏁 Share bonus application completed - clearing loading state');
      setIsApplyingShareBonus(false);
      
      // Double-check that loading state is cleared
      setTimeout(() => {
        console.log('🔍 Final share bonus state check - isApplyingShareBonus should be false');
        setIsApplyingShareBonus(false);
      }, 100);
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
        <div className="max-w-4xl mx-auto px-4 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="LuckyCookie.io Logo" 
              className="h-6 w-6 sm:h-8 sm:w-8 mr-1 sm:mr-2 object-contain"
            />
            <h1 className="text-sm sm:text-2xl font-bold text-gray-800">LuckyCookie.io</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link 
              to="/dashboard"
              className="flex items-center px-1.5 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <User className="h-2.5 w-2.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Stats</span>
            </Link>
            <Link 
              to="/leaderboard"
              className="flex items-center px-1.5 sm:px-4 py-1 sm:py-2 text-sm sm:text-sm bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <Trophy className="h-4 w-4 sm:h-4 sm:w-4 mr-0.5 sm:mr-2" />
              <span className="hidden sm:inline">Leaderboard</span>
              <span className="sm:hidden">Ranks</span>
            </Link>
            <Link 
              to="/premium"
              className="flex items-center px-1.5 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Crown className="h-2.5 w-2.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-2" />
              <span className="hidden sm:inline">Premium</span>
              <span className="sm:hidden">Pro</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-2 sm:px-4 py-6 sm:py-12">
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-xl sm:text-5xl font-bold text-gray-800 mb-2 sm:mb-4">
            Welcome to Your Daily Fortune! 🌟
          </h2>
          <p className="text-xs sm:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Crack a lucky cookie every hour and discover amazing fortunes. 
            You might even win exciting gifts!
          </p>
        </div>

        {/* Cookie Cracking Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-12 mb-4 sm:mb-8">
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
          <div className="mt-4 sm:mt-8 grid grid-cols-2 gap-2 sm:gap-4 max-w-md mx-auto">
            <div className="text-center p-1.5 sm:p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm sm:text-2xl font-bold text-yellow-600">{userProfile?.total_cracks || 0}</p>
              <p className="text-xs sm:text-sm text-gray-600">Total Cracks</p>
            </div>
            <div className="text-center p-1.5 sm:p-4 bg-orange-50 rounded-lg">
              <p className="text-sm sm:text-2xl font-bold text-orange-600">{userProfile?.streak || 0}</p>
              <p className="text-xs sm:text-sm text-gray-600">Day Streak</p>
            </div>
          </div>
        </div>

        {/* Last Result */}
        {lastResult && (
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-8">
            <div className="text-center">
              {(() => {
                const { prize } = lastResult;
                const isGift = prize.type === 'gift';
                
                return (
                  <>
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">
                    {isGift ? '🎉' : '✨'}
              </div>
              
                    {isGift ? (
                <div>
                  <h3 className="text-base sm:text-2xl font-bold text-green-600 mb-2">
                    Congratulations! You Won! 🎊
                  </h3>
                      <div className="mb-3 sm:mb-4">
                        {prize.image && (
                          <img 
                            src={prize.image} 
                            alt={prize.productName}
                            className="w-12 h-12 sm:w-24 sm:h-24 object-cover rounded-lg mx-auto mb-2"
                          />
                        )}
                        <p className="text-sm sm:text-xl text-gray-700 font-semibold">{prize.productName}</p>
                        {prize.value && (
                          <p className="text-xs sm:text-lg text-green-600">Worth ${prize.value}</p>
                        )}
                      </div>
                      
                      {/* Claim Prize Button */}
                      <div className="mb-3 sm:mb-4">
                        <button
                          onClick={() => setShowClaimForm(true)}
                          className="px-3 sm:px-6 py-1.5 sm:py-3 text-xs sm:text-base bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-bold shadow-lg"
                        >
                          📋 Claim Your Prize
                        </button>
                      </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-base sm:text-2xl font-bold text-blue-600 mb-2 sm:mb-4">Your Fortune</h3>
                      <p className="text-sm sm:text-xl text-gray-700 italic px-2">"{prize.message}"</p>
                </div>
                    )}
                  </>
                );
              })()}

              {getShareContent() && !lastResult.prize.type === 'gift' && (
                <div className="mt-3 sm:mt-4 flex justify-center">
                  <ShareButton 
                    content={getShareContent()!}
                    variant="button"
                    size="lg"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  />
                </div>
              )}
              
              {/* Share button for gifts - show with bonus feature */}
              {lastResult.prize.type === 'gift' && (
                <>
                  <div className="mt-3 sm:mt-4 flex justify-center">
                    <ShareButton 
                      content={getShareContent()!}
                      variant="button"
                      size="lg"
                      className={`bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 ${
                        isApplyingShareBonus ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      isWin={true}
                      crackHistoryId={lastResult.crackHistoryId}
                      onShareSuccess={handleShareBonusApplied}
                    />
                  </div>
                  
                  {/* Bonus info for gift winners */}
                  {!isApplyingShareBonus ? (
                    <div className="mt-2 text-center">
                      <p className="text-xs sm:text-sm text-green-600 font-medium">
                        🎁 Share your win to get your next crack 30 minutes earlier!
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 text-center">
                      <p className="text-xs sm:text-sm text-blue-600 font-medium">
                        ⏳ Applying share bonus...
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Link 
            to="/dashboard"
            className="bg-white rounded-2xl shadow-lg p-3 sm:p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center mb-3 sm:mb-4">
              <History className="h-4 w-4 sm:h-8 sm:w-8 text-blue-500 mr-1.5 sm:mr-3" />
              <h3 className="text-base sm:text-xl font-bold text-gray-800">View History</h3>
            </div>
            <p className="text-xs sm:text-base text-gray-600">
              Check your crack history, win streak, and see all your fortunes and prizes.
            </p>
          </Link>

          <Link 
            to="/premium"
            className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-lg p-3 sm:p-6 hover:shadow-xl transition-shadow border-2 border-purple-200"
          >
            <div className="flex items-center mb-3 sm:mb-4">
              <Crown className="h-4 w-4 sm:h-8 sm:w-8 text-purple-500 mr-1.5 sm:mr-3" />
              <h3 className="text-base sm:text-xl font-bold text-gray-800">Premium Cookies</h3>
            </div>
            <p className="text-xs sm:text-base text-gray-600">
              Buy premium cookies with guaranteed prizes! Choose from 5 tiers: Bronze, Silver, Gold, Sapphire, and Diamond.
            </p>
          </Link>
        </div>

        {/* Bonus Tasks Section */}
        <BonusTasks onBonusApplied={fetchUserProfile} />
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