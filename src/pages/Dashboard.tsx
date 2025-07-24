import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { signOut, deleteAccount } from '../lib/auth';
import { premiumTiers } from '../lib/prizes';
import { ArrowLeft, Trophy, Calendar, Gift, LogOut, Clock, Share2, Check, Copy, Package, Trash2, AlertTriangle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [crackHistory, setCrackHistory] = useState<any[]>([]);
  const [shippingAddresses, setShippingAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shareStates, setShareStates] = useState<{ [key: string]: 'idle' | 'sharing' | 'copied' }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount();
      // User will be automatically redirected to login after account deletion
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
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
        text: `🍪 I just won ${prizeInfo} on LuckyCookie.io! 🎉\n\nDate: ${date}\n\nTry your luck too! ${baseUrl}`,
        url: baseUrl
      };
    } else {
      return {
        title: 'LuckyCookie.io - My Fortune 🔮',
        text: `🍪 My fortune from LuckyCookie.io:\n\n"${crack.fortune}"\n\nDate: ${date}\n\nGet your fortune too! ${baseUrl}`,
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
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/home" className="flex items-center text-gray-600 hover:text-gray-800 mr-6">
              <ArrowLeft className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-base">Back to Home</span>
            </Link>
            <h1 className="text-base sm:text-2xl font-bold text-gray-800">Dashboard</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center px-1.5 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-2.5 w-2.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Welcome back! 👋</h2>
              <p className="text-xs sm:text-lg text-gray-600 break-all">{user?.email}</p>
            </div>
            <div className="text-2xl sm:text-6xl">🍪</div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            <div className="text-center p-2 sm:p-4 bg-yellow-50 rounded-xl">
              <Trophy className="h-4 w-4 sm:h-8 sm:w-8 text-yellow-500 mx-auto mb-1 sm:mb-2" />
              <p className="text-sm sm:text-2xl font-bold text-yellow-600">{userProfile?.total_cracks || 0}</p>
              <p className="text-xs sm:text-sm text-gray-600">Total Cracks</p>
            </div>
            
            <div className="text-center p-2 sm:p-4 bg-orange-50 rounded-xl">
              <Calendar className="h-4 w-4 sm:h-8 sm:w-8 text-orange-500 mx-auto mb-1 sm:mb-2" />
              <p className="text-sm sm:text-2xl font-bold text-orange-600">{userProfile?.streak || 0}</p>
              <p className="text-xs sm:text-sm text-gray-600">Day Streak</p>
            </div>
            
            <div className="text-center p-2 sm:p-4 bg-green-50 rounded-xl">
              <Gift className="h-4 w-4 sm:h-8 sm:w-8 text-green-500 mx-auto mb-1 sm:mb-2" />
              <p className="text-sm sm:text-2xl font-bold text-green-600">
                {crackHistory.filter(crack => crack.won).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Gifts Won</p>
            </div>
            
            <div className="text-center p-2 sm:p-4 bg-purple-50 rounded-xl">
              <Package className="h-4 w-4 sm:h-8 sm:w-8 text-purple-500 mx-auto mb-1 sm:mb-2" />
              <p className="text-sm sm:text-2xl font-bold text-purple-600">
                {shippingAddresses.filter(addr => addr.status === 'pending' || addr.status === 'processing').length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Pending Shipments</p>
            </div>
            
            <div className="text-center p-2 sm:p-4 bg-green-50 rounded-xl">
              <Gift className="h-4 w-4 sm:h-8 sm:w-8 text-green-500 mx-auto mb-1 sm:mb-2" />
              <p className="text-sm sm:text-2xl font-bold text-green-600">
                {crackHistory.filter(crack => crack.type === 'free' && crack.won).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Free Gifts Won</p>
            </div>
            
            <div className="text-center p-2 sm:p-4 bg-blue-50 rounded-xl">
              <Clock className="h-4 w-4 sm:h-8 sm:w-8 text-blue-500 mx-auto mb-1 sm:mb-2" />
              <p className="text-xs sm:text-lg font-bold text-blue-600">{getNextCrackTime()}</p>
              <p className="text-xs sm:text-sm text-gray-600">Next Crack</p>
            </div>
          </div>

          {/* Shipping Status Section */}
          {shippingAddresses.length > 0 && (
            <div className="mt-3 sm:mt-6 bg-purple-50 border border-purple-200 rounded-xl p-2 sm:p-4">
              <h4 className="text-xs sm:text-base font-bold text-purple-800 mb-2 flex items-center">
                <Package className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                Prize Shipments
              </h4>
              <div className="space-y-2">
                {shippingAddresses.slice(0, 3).map((address) => (
                  <div key={address.id} className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-700 truncate mr-2">Prize shipment to {address.city}, {address.country}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      address.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      address.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      address.status === 'shipped' ? 'bg-green-100 text-green-800' :
                      address.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    } whitespace-nowrap`}>
                      {address.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Crack History */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-6">Recent Activity</h3>
          
          {crackHistory.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🍪</div>
              <p className="text-gray-600 text-sm sm:text-lg">No cracks yet! Go crack your first cookie!</p>
              <Link 
                to="/home"
                className="inline-block mt-3 sm:mt-4 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Crack a Cookie
              </Link>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {crackHistory.map((crack) => (
                <div 
                  key={crack.id}
                  className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                    crack.type === 'premium' 
                      ? 'bg-purple-50 border-purple-500'
                      : crack.won 
                        ? 'bg-green-50 border-green-500' 
                        : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-1 sm:mb-2">
                        <span className="text-base sm:text-2xl mr-1 sm:mr-2">
                          {crack.type === 'premium' ? '👑' : crack.won ? '🎉' : '✨'}
                        </span>
                        <span className={`text-xs sm:text-base font-bold ${
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
                          <span className="ml-1 sm:ml-2 px-1 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                            {crack.premium_tier.toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      {crack.fortune && (
                        <p className="text-xs sm:text-sm text-gray-700 italic mb-1">"{crack.fortune}"</p>
                      )}
                      
                      {(crack.won || crack.type === 'premium') && (
                        <div>
                          <p className={`text-xs sm:text-base font-semibold ${
                            crack.type === 'premium' ? 'text-purple-600' : 'text-green-600'
                          }`}>
                            🎁 {crack.gift_name}
                            {crack.gift_value && (
                              <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">(${crack.gift_value})</span>
                            )}
                          </p>
                          
                          {/* Show shipping status for premium prizes */}
                          {crack.type === 'premium' && (
                            <div className="mt-0.5 sm:mt-2">
                              {(() => {
                                const relatedShipping = shippingAddresses.find(addr => 
                                  addr.created_at.substring(0, 10) === crack.created_at.substring(0, 10)
                                );
                                
                                if (relatedShipping) {
                                  return (
                                    <div className="flex items-center text-xs sm:text-sm">
                                      <Package className="h-2.5 w-2.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 text-purple-500" />
                                      <span className="text-gray-600">Shipping: </span>
                                      <span className={`ml-0.5 sm:ml-1 px-1 sm:px-2 py-0.5 rounded text-xs ${
                                        relatedShipping.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        relatedShipping.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                        relatedShipping.status === 'shipped' ? 'bg-green-100 text-green-800' :
                                        relatedShipping.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {relatedShipping.status}
                                      </span>
                                      {relatedShipping.tracking_number && (
                                        <span className="ml-0.5 sm:ml-2 text-xs text-gray-500 truncate">
                                          Tracking: {relatedShipping.tracking_number}
                                        </span>
                                      )}
                                    </div>
                                  );
                                } else if (crack.type === 'premium') {
                                  return (
                                    <div className="flex items-center text-xs sm:text-sm text-orange-600">
                                      <Package className="h-2.5 w-2.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
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
                    
                    <div className="flex items-start gap-1 sm:gap-3 flex-shrink-0">
                      <div className="text-right text-xs sm:text-sm text-gray-500">
                        {new Date(crack.created_at).toLocaleDateString()}
                        <br />
                        <span className="hidden sm:inline">{new Date(crack.created_at).toLocaleTimeString()}</span>
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
                        <div className="scale-75 sm:scale-100">{getShareIcon(crack.id)}</div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Account Section */}
        <div className="bg-red-50 border border-red-200 rounded-2xl shadow-xl p-4 sm:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-red-800 mb-1 sm:mb-2 flex items-center">
                <Trash2 className="h-4 w-4 sm:h-6 sm:w-6 mr-1 sm:mr-2" />
                Danger Zone
              </h3>
              <p className="text-xs sm:text-base text-red-600">
                Permanently delete your account and all associated data.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-2 sm:p-4 border border-red-200">
            <div className="flex items-start mb-3 sm:mb-4">
              <AlertTriangle className="h-3 w-3 sm:h-5 sm:w-5 text-red-500 mr-1 sm:mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs sm:text-base font-semibold text-red-800 mb-1">Delete Account</h4>
                <p className="text-xs sm:text-sm text-red-600 mb-2">
                  This action cannot be undone. This will permanently delete your account, 
                  crack history, prizes, and all associated data.
                </p>
                <ul className="text-xs sm:text-sm text-red-600 list-disc list-inside space-y-1">
                  <li>All your crack history will be lost</li>
                  <li>Any pending prize claims will be cancelled</li>
                  <li>Your account cannot be recovered</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full sm:w-auto px-3 sm:px-6 py-1.5 sm:py-3 text-xs sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold flex items-center justify-center"
            >
              <Trash2 className="h-2.5 w-2.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Delete Account
            </button>
          </div>
        </div>
      </main>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-red-500 mr-1.5 sm:mr-3" />
                <h2 className="text-base sm:text-xl font-bold text-red-800">Confirm Account Deletion</h2>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-4">
                <h3 className="text-sm sm:text-base font-bold text-red-800 mb-2">⚠️ This action is irreversible!</h3>
                <p className="text-sm text-red-700 mb-3">
                  You are about to permanently delete your LuckyCookie.io account. This will:
                </p>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>Delete all your crack history ({crackHistory.length} records)</li>
                  <li>Cancel any pending prize claims</li>
                  <li>Remove all your personal data</li>
                  <li>Sign you out immediately</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Type <strong>DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Type DELETE here"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="w-full sm:w-auto px-3 sm:px-6 py-1.5 sm:py-3 text-xs sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  className="w-full sm:w-auto px-3 sm:px-6 py-1.5 sm:py-3 text-xs sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1 sm:mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-2.5 w-2.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Delete Account Forever
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};