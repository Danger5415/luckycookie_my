import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Crown, Cookie, Gift, Users, Clock, Star } from 'lucide-react';

interface PremiumCracker {
  user_id: string;
  email: string;
  premium_cracks: number;
  rank: number;
}

interface FreeCracker {
  user_id: string;
  email: string;
  total_cracks: number;
  total_wins: number;
  rank: number;
}

interface LeaderboardData {
  premium_crackers: PremiumCracker[];
  free_crackers: FreeCracker[];
  total_users: number;
  last_updated: string;
}

export const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/leaderboard-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard data: ${response.status}`);
      }

      const data = await response.json();
      setLeaderboardData(data);
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      setError(error.message || 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const formatEmail = (email: string) => {
    // Show first 3 characters + *** + domain for privacy
    const [username, domain] = email.split('@');
    if (username.length <= 3) {
      return `${username}***@${domain}`;
    }
    return `${username.substring(0, 3)}***@${domain}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-2xl">🥇</span>;
      case 2:
        return <span className="text-2xl">🥈</span>;
      case 3:
        return <span className="text-2xl">🥉</span>;
      case 4:
        return <Crown className="h-6 w-6 text-purple-500" />;
      case 5:
        return <Star className="h-6 w-6 text-blue-500" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchLeaderboardData}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/home"
              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="LuckyCookie.io Logo" 
                className="h-12 w-12 mr-3 object-contain"
              />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">LuckyCookie</h1>
            </div>
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Leaderboard</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              See who's cracking the most cookies and winning the biggest prizes! 
              Premium crackers get the top spots with exclusive rewards.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{leaderboardData?.total_users || 0}</p>
            <p className="text-gray-600">Total Players</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <Crown className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{leaderboardData?.premium_crackers.length || 0}</p>
            <p className="text-gray-600">Premium Champions</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-600">
              {leaderboardData?.last_updated ? 
                new Date(leaderboardData.last_updated).toLocaleString() : 
                'Never'
              }
            </p>
            <p className="text-gray-600">Last Updated</p>
          </div>
        </div>

        {/* Premium Crackers - Top 5 */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Crown className="h-10 w-10 text-purple-500 mr-3" />
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Premium Champions</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              The elite crackers who've purchased premium cookies and won exclusive prizes
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {Array.from({ length: 5 }, (_, index) => {
              const rank = index + 1;
              const cracker = leaderboardData?.premium_crackers.find(p => p.rank === rank);
              
              return (
                <div
                  key={rank}
                  className={`p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl border-2 text-center transition-all duration-300 ${
                    cracker
                      ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="mb-2 sm:mb-3 md:mb-4">
                    {getRankIcon(rank)}
                  </div>
                  
                  {cracker ? (
                    <>
                      <h4 className="font-bold text-gray-800 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base break-all">
                        {formatEmail(cracker.email)}
                      </h4>
                      <div className="flex items-center justify-center mb-1 sm:mb-2">
                        <Cookie className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 mr-1" />
                        <span className="text-xs sm:text-sm md:text-base font-bold text-purple-600">
                          {cracker.premium_cracks}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Premium Cracks</p>
                    </>
                  ) : (
                    <>
                      <h4 className="font-bold text-gray-500 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">
                        Awaiting Champion
                      </h4>
                      <div className="flex items-center justify-center mb-1 sm:mb-2">
                        <Cookie className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-1" />
                        <span className="text-xs sm:text-sm md:text-base font-bold text-gray-400">0</span>
                      </div>
                      <p className="text-xs text-gray-500">Premium Cracks</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Free Crackers - Starting from Rank 6 */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Cookie className="h-10 w-10 text-orange-500 mr-3" />
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Free Cookie Masters</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              Skilled players climbing the ranks with free cookies and lucky wins
            </p>
          </div>

          {leaderboardData?.free_crackers && leaderboardData.free_crackers.length > 0 ? (
            <div className="space-y-4">
              {leaderboardData.free_crackers.slice(0, 20).map((cracker) => (
                <div
                  key={cracker.user_id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 md:mr-4">
                      <span className="text-xs sm:text-sm md:text-base font-bold text-orange-600">#{cracker.rank}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1 text-xs sm:text-sm md:text-base break-all">
                        {formatEmail(cracker.email)}
                      </h4>
                      <p className="text-xs text-gray-600">Cookie Master</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1 flex-col sm:flex-row">
                        <Cookie className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 mr-0 sm:mr-1 mb-1 sm:mb-0" />
                        <span className="text-xs sm:text-sm md:text-base font-bold text-orange-600">
                          {cracker.total_cracks}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 hidden sm:block">Cracks</p>
                      <p className="text-xs text-gray-600 sm:hidden">Cracks</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1 flex-col sm:flex-row">
                        <Gift className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-0 sm:mr-1 mb-1 sm:mb-0" />
                        <span className="text-xs sm:text-sm md:text-base font-bold text-green-600">
                          {cracker.total_wins}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Wins</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍪</div>
              <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4">No Free Crackers Yet</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Be the first to crack some free cookies and claim your spot on the leaderboard!
              </p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-4 sm:p-6 md:p-8 text-center border-2 border-purple-200">
          <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 md:mb-4">💡</div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">
            Want to Join the Premium Champions?
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-gray-700 mb-4 sm:mb-5 md:mb-6 max-w-2xl mx-auto">
            Crack premium cookies to secure your spot in the top 5 and win amazing extra gifts! 
            Premium crackers get exclusive prizes and guaranteed rewards.
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
            <div className="flex items-center bg-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg shadow-sm">
              <Crown className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-500 mr-1 sm:mr-2" />
              <span className="text-xs font-medium text-gray-700">Guaranteed Prizes</span>
            </div>
            <div className="flex items-center bg-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg shadow-sm">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-yellow-500 mr-1 sm:mr-2" />
              <span className="text-xs font-medium text-gray-700">Top 5 Ranking</span>
            </div>
            <div className="flex items-center bg-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg shadow-sm">
              <Gift className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-500 mr-1 sm:mr-2" />
              <span className="text-xs font-medium text-gray-700">Exclusive Rewards</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-yellow-200 py-4 sm:py-6 md:py-8 mt-8 sm:mt-10 md:mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
            <img 
              src="/logo.png" 
              alt="LuckyCookie.io Logo" 
              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mr-1 sm:mr-2 object-contain"
            />
            <span className="text-base sm:text-lg md:text-xl font-bold text-gray-800">LuckyCookie</span>
          </div>
          <p className="text-gray-600 text-xs">
            Crack cookies, win prizes, and climb the leaderboard! 
            Updated in real-time as players crack their way to victory.
          </p>
        </div>
      </footer>
    </div>
  );
};