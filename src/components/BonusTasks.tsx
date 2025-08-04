import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DatabaseService } from '../lib/database';
import { Youtube, Gift, Clock, CheckCircle, ExternalLink, Twitter } from 'lucide-react';

interface BonusTask {
  id: string;
  type: 'youtube_subscribe' | 'youtube_like_video' | 'youtube_watch_video' | 'twitter_follow' | 'twitter_like_tweet' | 'tiktok_follow' | 'tiktok_like_video';
  title: string;
  description: string;
  reward: string;
  icon: React.ReactNode;
  url: string;
  claimed: boolean;
  unlocked: boolean;
  videoId?: string;
  platform: 'youtube' | 'twitter' | 'tiktok';
}

interface BonusTasksProps {
  onBonusApplied: () => void;
}

export const BonusTasks: React.FC<BonusTasksProps> = ({ onBonusApplied }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<BonusTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingContent, setFetchingContent] = useState(true);
  const [claimingTask, setClaimingTask] = useState<string | null>(null);
  const [latestVideo, setLatestVideo] = useState<any>(null);
  const [latestTweet, setLatestTweet] = useState<any>(null);
  const [latestTikTok, setLatestTikTok] = useState<any>(null);

  // Initialize tasks with progressive unlocking logic
  const initializeTasks = (claimedBonuses: any[] = [], videoData: any = null, tweetData: any = null, tiktokData: any = null) => {
    // Create a map of claimed bonuses
    const claimedBonusMap = new Map();
    claimedBonuses.forEach(bonus => {
      if (bonus.bonus_type === 'youtube_subscribe' || bonus.bonus_type === 'twitter_follow' || bonus.bonus_type === 'tiktok_follow') {
        claimedBonusMap.set(bonus.bonus_type, true);
      } else if (bonus.video_id) {
        claimedBonusMap.set(`${bonus.bonus_type}_${bonus.video_id}`, true);
      }
    });

    // Check progressive unlocking
    const youtubeSubscribed = claimedBonusMap.has('youtube_subscribe');
    const twitterFollowed = claimedBonusMap.has('twitter_follow');
    const tiktokFollowed = claimedBonusMap.has('tiktok_follow');

    return [
      // YouTube Tasks (Always available)
      {
        id: 'youtube_subscribe',
        type: 'youtube_subscribe' as const,
        title: 'Subscribe to Our YouTube Channel',
        description: 'Subscribe to our YouTube channel and get an instant free crack!',
        reward: 'Reset cooldown completely',
        icon: <Youtube className="h-5 w-5 text-red-500" />,
        url: 'https://www.youtube.com/channel/UCWoyBgVGqAh3b6eWZDEZWfA',
        claimed: claimedBonusMap.has('youtube_subscribe'),
        unlocked: true,
        platform: 'youtube' as const
      },
      {
        id: 'youtube_like_video',
        type: 'youtube_like_video' as const,
        title: 'Like Our Latest Video',
        description: 'Like our latest YouTube video and reduce your cooldown by 50%!',
        reward: 'Reduce cooldown by 50%',
        icon: <Youtube className="h-5 w-5 text-red-500" />,
        url: videoData?.url || 'https://youtube.com/watch?v=placeholder',
        videoId: videoData?.id,
        claimed: videoData?.id ? claimedBonusMap.has(`youtube_like_video_${videoData.id}`) : false,
        unlocked: true,
        platform: 'youtube' as const
      },
      {
        id: 'youtube_watch_video',
        type: 'youtube_watch_video' as const,
        title: 'Watch Our Featured Video',
        description: 'Watch our featured video completely and get 30 minutes off your cooldown!',
        reward: 'Reduce cooldown by 30 minutes',
        icon: <Youtube className="h-5 w-5 text-red-500" />,
        url: videoData?.url || 'https://youtube.com/watch?v=placeholder2',
        videoId: videoData?.id,
        claimed: videoData?.id ? claimedBonusMap.has(`youtube_watch_video_${videoData.id}`) : false,
        unlocked: true,
        platform: 'youtube' as const
      },

      // X (Twitter) Tasks (Unlocked after YouTube subscribe)
      {
        id: 'twitter_follow',
        type: 'twitter_follow' as const,
        title: 'Follow Us on 𝕏 (Twitter)',
        description: 'Follow our X account and reduce your cooldown by 50%!',
        reward: 'Reduce cooldown by 50%',
        icon: <span className="text-black text-lg font-bold">𝕏</span>,
        url: tweetData?.profile_url || 'https://twitter.com/LuckyCook13',
        claimed: claimedBonusMap.has('twitter_follow'),
        unlocked: youtubeSubscribed,
        platform: 'twitter' as const
      },
      {
        id: 'twitter_like_tweet',
        type: 'twitter_like_tweet' as const,
        title: 'Like Our Latest Tweet',
        description: 'Like our latest tweet and get 30 minutes off your cooldown!',
        reward: 'Reduce cooldown by 30 minutes',
        icon: <span className="text-black text-lg font-bold">𝕏</span>,
        url: tweetData?.tweet?.url || 'https://twitter.com/LuckyCook13',
        videoId: tweetData?.tweet?.id,
        claimed: tweetData?.tweet?.id ? claimedBonusMap.has(`twitter_like_tweet_${tweetData.tweet.id}`) : false,
        unlocked: youtubeSubscribed,
        platform: 'twitter' as const
      },

      // TikTok Tasks (Unlocked after Twitter follow)
      {
        id: 'tiktok_follow',
        type: 'tiktok_follow' as const,
        title: 'Follow Us on TikTok',
        description: 'Follow our TikTok account and reduce your cooldown by 50%!',
        reward: 'Reduce cooldown by 50%',
        icon: <span className="text-black text-lg">🎵</span>,
        url: tiktokData?.profile_url || 'https://www.tiktok.com/@luckycookieio',
        claimed: claimedBonusMap.has('tiktok_follow'),
        unlocked: twitterFollowed,
        platform: 'tiktok' as const
      },
      {
        id: 'tiktok_like_video',
        type: 'tiktok_like_video' as const,
        title: 'Like Our Latest TikTok',
        description: 'Like our latest TikTok video and get 30 minutes off your cooldown!',
        reward: 'Reduce cooldown by 30 minutes',
        icon: <span className="text-black text-lg">🎵</span>,
        url: tiktokData?.video?.url || 'https://www.tiktok.com/@luckycookieio',
        videoId: tiktokData?.video?.id,
        claimed: tiktokData?.video?.id ? claimedBonusMap.has(`tiktok_like_video_${tiktokData.video.id}`) : false,
        unlocked: twitterFollowed,
        platform: 'tiktok' as const
      }
    ];
  };

  useEffect(() => {
    initializeComponent();
  }, [user]);

  const initializeComponent = async () => {
    if (!user) return;

    try {
      setFetchingContent(true);
      
      // Fetch all content and claimed bonuses in parallel
      const [videoData, tweetData, tiktokData, claimedBonuses] = await Promise.all([
        fetchLatestVideo(),
        fetchLatestTweet(),
        fetchLatestTikTok(),
        fetchClaimedBonuses()
      ]);

      setLatestVideo(videoData);
      setLatestTweet(tweetData);
      setLatestTikTok(tiktokData);
      setTasks(initializeTasks(claimedBonuses, videoData, tweetData, tiktokData));
    } catch (error) {
      console.error('Error initializing bonus tasks:', error);
      // Initialize with fallback data
      const claimedBonuses = await fetchClaimedBonuses();
      setTasks(initializeTasks(claimedBonuses));
    } finally {
      setFetchingContent(false);
    }
  };

  const fetchLatestVideo = async () => {
    try {
      const videoData = await DatabaseService.fetchLatestYouTubeVideo();
      console.log('📺 Fetched latest YouTube video:', videoData);
      return videoData;
    } catch (error) {
      console.error('Error fetching latest YouTube video:', error);
      return null;
    }
  };

  const fetchLatestTweet = async () => {
    try {
      const tweetData = await DatabaseService.fetchLatestTweet();
      console.log('🐦 Fetched latest tweet:', tweetData);
      return tweetData;
    } catch (error) {
      console.error('Error fetching latest tweet:', error);
      return null;
    }
  };

  const fetchLatestTikTok = async () => {
    try {
      const tiktokData = await DatabaseService.fetchLatestTikTok();
      console.log('🎵 Fetched latest TikTok:', tiktokData);
      return tiktokData;
    } catch (error) {
      console.error('Error fetching latest TikTok:', error);
      return null;
    }
  };

  const fetchClaimedBonuses = async () => {
    if (!user) return [];

    try {
      const claimedBonuses = await DatabaseService.getUserClaimedBonuses(user.id);
      return claimedBonuses;
    } catch (error) {
      console.error('Error fetching claimed bonuses:', error);
      return [];
    }
  };

  const handleTaskClick = async (task: BonusTask) => {
    if (!user || task.claimed || !task.unlocked || claimingTask === task.id) return;

    setClaimingTask(task.id);

    try {
      // Open the URL in a new tab
      window.open(task.url, '_blank');

      // Wait a moment for user to potentially complete the action
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Apply the bonus
      await DatabaseService.applyBonus(user.id, task.type, task.videoId);

      // Update the task as claimed and refresh tasks to check for newly unlocked ones
      await initializeComponent();

      // Notify parent component to refresh user data
      onBonusApplied();

      // Show success message
      alert(`🎉 Bonus applied! ${task.reward}`);

    } catch (error: any) {
      console.error('Error applying bonus:', error);
      
      if (error.message?.includes('already claimed')) {
        // Refresh tasks if bonus was already claimed
        await initializeComponent();
        alert(task.type.includes('subscribe') || task.type.includes('follow')
          ? 'You have already claimed this follow bonus!' 
          : 'You have already claimed this bonus for this content!');
      } else {
        alert('Error applying bonus. Please try again.');
      }
    } finally {
      setClaimingTask(null);
    }
  };

  const getPlatformTasks = (platform: 'youtube' | 'twitter' | 'tiktok') => {
    return tasks.filter(task => task.platform === platform);
  };

  const isPlatformUnlocked = (platform: 'youtube' | 'twitter' | 'tiktok') => {
    const platformTasks = getPlatformTasks(platform);
    return platformTasks.some(task => task.unlocked);
  };

  const getPlatformColor = (platform: 'youtube' | 'twitter' | 'tiktok') => {
    switch (platform) {
      case 'youtube':
        return 'from-red-50 to-red-100 border-red-200';
      case 'twitter':
        return 'from-blue-50 to-blue-100 border-blue-200';
      case 'tiktok':
        return 'from-pink-50 to-pink-100 border-pink-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const getPlatformIcon = (platform: 'youtube' | 'twitter' | 'tiktok') => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="h-6 w-6 text-red-500" />;
      case 'twitter':
        return <span className="text-black text-xl font-bold">𝕏</span>;
      case 'tiktok':
        return <span className="text-black text-xl">🎵</span>;
      default:
        return <Gift className="h-6 w-6 text-gray-500" />;
    }
  };

  const getPlatformName = (platform: 'youtube' | 'twitter' | 'tiktok') => {
    switch (platform) {
      case 'youtube':
        return 'YouTube';
      case 'twitter':
        return '𝕏 (Twitter)';
      case 'tiktok':
        return 'TikTok';
      default:
        return 'Platform';
    }
  };

  if (!user) return null;

  if (fetchingContent) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2 sm:mb-4">
            <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mr-2 sm:mr-3" />
            <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Progressive Bonus Tasks</h3>
          </div>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-400 border-t-transparent mb-4"></div>
          <p className="text-sm text-gray-600">Loading progressive bonus tasks...</p>
        </div>
      </div>
    );
  }

  const platforms: ('youtube' | 'twitter' | 'tiktok')[] = ['youtube', 'twitter', 'tiktok'];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-8">
      <div className="text-center mb-4 sm:mb-6">
        <div className="flex items-center justify-center mb-2 sm:mb-4">
          <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mr-2 sm:mr-3" />
          <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Progressive Bonus Tasks</h3>
        </div>
        <p className="text-xs sm:text-base text-gray-600">
          Complete tasks to unlock new platforms and reduce your cooldown! Start with YouTube, then unlock 𝕏 and TikTok.
        </p>
      </div>

      <div className="space-y-6">
        {platforms.map((platform) => {
          const platformTasks = getPlatformTasks(platform);
          const isUnlocked = isPlatformUnlocked(platform);
          const hasNewlyUnlocked = isUnlocked && platformTasks.some(task => !task.claimed);

          return (
            <div key={platform} className={`rounded-xl border-2 p-4 transition-all duration-300 ${
              isUnlocked 
                ? `bg-gradient-to-br ${getPlatformColor(platform)} hover:shadow-lg`
                : 'bg-gray-50 border-gray-200 opacity-60'
            }`}>
              {/* Platform Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getPlatformIcon(platform)}
                  <h4 className="text-lg font-bold text-gray-800 ml-3">
                    {getPlatformName(platform)} Tasks
                  </h4>
                  {hasNewlyUnlocked && platform !== 'youtube' && (
                    <span className="ml-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
                      Unlocked! 🎉
                    </span>
                  )}
                </div>
                {!isUnlocked && (
                  <span className="px-3 py-1 bg-gray-300 text-gray-600 text-sm font-medium rounded-full">
                    🔒 Locked
                  </span>
                )}
              </div>

              {/* Platform Tasks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {platformTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      !task.unlocked
                        ? 'bg-gray-100 border-gray-200 opacity-50'
                        : task.claimed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-300 hover:shadow-md hover:scale-105 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        {task.icon}
                        <span className="ml-2 text-xs font-medium text-gray-700">
                          {task.claimed ? 'Completed' : task.unlocked ? 'Available' : 'Locked'}
                        </span>
                      </div>
                      {task.claimed && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>

                    <h5 className="text-sm font-bold text-gray-800 mb-1">
                      {task.title}
                    </h5>
                    
                    <p className="text-xs text-gray-600 mb-2">
                      {task.description}
                    </p>

                    {/* Show content info for content-based tasks */}
                    {task.videoId && (
                      <div className="mb-2">
                        {platform === 'youtube' && latestVideo && (
                          <p className="text-xs text-red-600 truncate" title={latestVideo.title}>
                            📺 {latestVideo.title}
                          </p>
                        )}
                        {platform === 'twitter' && latestTweet?.tweet && (
                          <p className="text-xs text-blue-600 truncate" title={latestTweet.tweet.text}>
                            🐦 {latestTweet.tweet.text}
                          </p>
                        )}
                        {platform === 'tiktok' && latestTikTok?.video && (
                          <p className="text-xs text-pink-600 truncate" title={latestTikTok.video.title}>
                            🎵 {latestTikTok.video.title}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center mb-3">
                      <Clock className="h-3 w-3 text-orange-500 mr-1" />
                      <span className="text-xs font-medium text-orange-600">
                        {task.reward}
                      </span>
                    </div>

                    <button
                      onClick={() => handleTaskClick(task)}
                      disabled={task.claimed || !task.unlocked || claimingTask === task.id}
                      className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition-all duration-300 flex items-center justify-center ${
                        !task.unlocked
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : task.claimed
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : claimingTask === task.id
                          ? 'bg-purple-300 text-white cursor-wait'
                          : platform === 'youtube'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transform hover:scale-105'
                          : platform === 'twitter'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105'
                          : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transform hover:scale-105'
                      }`}
                    >
                      {!task.unlocked ? (
                        <>
                          🔒 Locked
                        </>
                      ) : task.claimed ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </>
                      ) : claimingTask === task.id ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Claim Bonus
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Platform unlock message */}
              {!isUnlocked && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    {platform === 'twitter' && '🔒 Complete YouTube subscribe to unlock 𝕏 tasks'}
                    {platform === 'tiktok' && '🔒 Follow us on 𝕏 to unlock TikTok tasks'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs sm:text-sm text-yellow-800">
            <strong>Progressive System:</strong> Complete tasks to unlock new platforms! 
            Each bonus can only be claimed once per account. Content tasks reset when new content is published.
          </p>
        </div>
      </div>
    </div>
  );
};