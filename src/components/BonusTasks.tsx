import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DatabaseService } from '../lib/database';
import { Youtube, Gift, Clock, CheckCircle, ExternalLink } from 'lucide-react';

interface BonusTask {
  id: string;
  type: 'youtube_subscribe' | 'youtube_like_video' | 'youtube_watch_video';
  title: string;
  description: string;
  reward: string;
  icon: React.ReactNode;
  url: string; // Will be provided later
  claimed: boolean;
}

interface BonusTasksProps {
  onBonusApplied: () => void;
}

export const BonusTasks: React.FC<BonusTasksProps> = ({ onBonusApplied }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<BonusTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [claimingTask, setClaimingTask] = useState<string | null>(null);

  // Initialize tasks (URLs will be updated when provided)
  const initializeTasks = (claimedBonuses: any[] = []) => {
    const claimedTypes = new Set(claimedBonuses.map(bonus => bonus.bonus_type));
    
    return [
      {
        id: 'youtube_subscribe',
        type: 'youtube_subscribe' as const,
        title: 'Subscribe to Our YouTube Channel',
        description: 'Subscribe to our YouTube channel and get an instant free crack!',
        reward: 'Reset cooldown completely',
        icon: <Youtube className="h-5 w-5 text-red-500" />,
        url: 'https://youtube.com/@placeholder', // Placeholder URL
        claimed: claimedTypes.has('youtube_subscribe')
      },
      {
        id: 'youtube_like_video',
        type: 'youtube_like_video' as const,
        title: 'Like Our Latest Video',
        description: 'Like our latest YouTube video and reduce your cooldown by 50%!',
        reward: 'Reduce cooldown by 50%',
        icon: <Youtube className="h-5 w-5 text-red-500" />,
        url: 'https://youtube.com/watch?v=placeholder', // Placeholder URL
        claimed: claimedTypes.has('youtube_like_video')
      },
      {
        id: 'youtube_watch_video',
        type: 'youtube_watch_video' as const,
        title: 'Watch Our Featured Video',
        description: 'Watch our featured video completely and get 30 minutes off your cooldown!',
        reward: 'Reduce cooldown by 30 minutes',
        icon: <Youtube className="h-5 w-5 text-red-500" />,
        url: 'https://youtube.com/watch?v=placeholder2', // Placeholder URL
        claimed: claimedTypes.has('youtube_watch_video')
      }
    ];
  };

  useEffect(() => {
    fetchClaimedBonuses();
  }, [user]);

  const fetchClaimedBonuses = async () => {
    if (!user) return;

    try {
      const claimedBonuses = await DatabaseService.getUserClaimedBonuses(user.id);
      setTasks(initializeTasks(claimedBonuses));
    } catch (error) {
      console.error('Error fetching claimed bonuses:', error);
      setTasks(initializeTasks());
    }
  };

  const handleTaskClick = async (task: BonusTask) => {
    if (!user || task.claimed || claimingTask === task.id) return;

    setClaimingTask(task.id);

    try {
      // Open the YouTube URL in a new tab
      window.open(task.url, '_blank');

      // Wait a moment for user to potentially complete the action
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Apply the bonus
      await DatabaseService.applyBonus(user.id, task.type);

      // Update the task as claimed
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === task.id ? { ...t, claimed: true } : t
        )
      );

      // Notify parent component to refresh user data
      onBonusApplied();

      // Show success message
      alert(`🎉 Bonus applied! ${task.reward}`);

    } catch (error: any) {
      console.error('Error applying bonus:', error);
      
      if (error.message?.includes('already claimed')) {
        // Update the task as claimed if it was already claimed
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === task.id ? { ...t, claimed: true } : t
          )
        );
        alert('You have already claimed this bonus!');
      } else {
        alert('Error applying bonus. Please try again.');
      }
    } finally {
      setClaimingTask(null);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-8">
      <div className="text-center mb-4 sm:mb-6">
        <div className="flex items-center justify-center mb-2 sm:mb-4">
          <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mr-2 sm:mr-3" />
          <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Bonus Tasks</h3>
        </div>
        <p className="text-xs sm:text-base text-gray-600">
          Complete these tasks to get bonus cookie cracks and reduce your cooldown!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 ${
              task.claimed
                ? 'bg-green-50 border-green-200 opacity-75'
                : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg hover:scale-105 cursor-pointer'
            }`}
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex items-center">
                {task.icon}
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-gray-700">
                  {task.claimed ? 'Completed' : 'Available'}
                </span>
              </div>
              {task.claimed && (
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              )}
            </div>

            <h4 className="text-sm sm:text-base font-bold text-gray-800 mb-1 sm:mb-2">
              {task.title}
            </h4>
            
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
              {task.description}
            </p>

            <div className="flex items-center mb-2 sm:mb-3">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm font-medium text-orange-600">
                {task.reward}
              </span>
            </div>

            <button
              onClick={() => handleTaskClick(task)}
              disabled={task.claimed || claimingTask === task.id}
              className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center ${
                task.claimed
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : claimingTask === task.id
                  ? 'bg-purple-300 text-white cursor-wait'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transform hover:scale-105'
              }`}
            >
              {task.claimed ? (
                <>
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Completed
                </>
              ) : claimingTask === task.id ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1 sm:mr-2" />
                  Applying...
                </>
              ) : (
                <>
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Claim Bonus
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 sm:mt-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3">
          <p className="text-xs sm:text-sm text-yellow-800">
            <strong>Note:</strong> Each bonus can only be claimed once per account. 
            Complete the task on YouTube before claiming your bonus!
          </p>
        </div>
      </div>
    </div>
  );
};