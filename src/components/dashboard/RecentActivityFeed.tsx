import React, { memo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Bot, 
  Zap, 
  Globe, 
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { ActivityItem } from '../../types';

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="animate-pulse flex items-start space-x-3 p-4">
        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="h-3 bg-gray-700 rounded w-16"></div>
      </div>
    ))}
  </div>
);

const ActivityIcon: React.FC<{ type: ActivityItem['type']; status?: ActivityItem['status'] }> = ({ 
  type, 
  status 
}) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'trade':
        if (status === 'profit') {
          return { icon: TrendingUp, color: 'text-green-400 bg-green-500/20' };
        } else if (status === 'loss') {
          return { icon: TrendingDown, color: 'text-red-400 bg-red-500/20' };
        }
        return { icon: DollarSign, color: 'text-blue-400 bg-blue-500/20' };
      case 'strategy':
        return { icon: Zap, color: 'text-purple-400 bg-purple-500/20' };
      case 'ai_recommendation':
        return { icon: Bot, color: 'text-cyan-400 bg-cyan-500/20' };
      case 'news':
        return { icon: Globe, color: 'text-orange-400 bg-orange-500/20' };
      default:
        return { icon: AlertCircle, color: 'text-gray-400 bg-gray-500/20' };
    }
  };

  const { icon: Icon, color } = getIconAndColor();

  return (
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
  );
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

const ActivityItemComponent: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
  const getAmountColor = (status?: ActivityItem['status']) => {
    switch (status) {
      case 'profit':
        return 'text-green-600';
      case 'loss':
        return 'text-red-600';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
      <ActivityIcon type={activity.type} status={activity.status} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {activity.title}
            </h4>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {activity.description}
            </p>
            {activity.symbol && (
              <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                {activity.symbol}
              </span>
            )}
          </div>
          
          <div className="flex flex-col items-end ml-4">
            {activity.amount !== undefined && (
              <span className={`text-sm font-medium ${getAmountColor(activity.status)}`}>
                {activity.status === 'profit' ? '+' : activity.status === 'loss' ? '-' : ''}
                ${Math.abs(activity.amount).toFixed(2)}
              </span>
            )}
            <div className="flex items-center text-xs text-gray-400 mt-1">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimeAgo(activity.timestamp)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities, loading = false }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Recent Activity</h3>
          <p className="text-gray-500 text-sm">Latest trades, alerts, and market updates</p>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <LoadingSkeleton />
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No recent activity</div>
            <div className="text-gray-400 text-sm">Your trading activities will appear here</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-700/30">
            {activities.map((activity) => (
              <ActivityItemComponent key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
      
      {!loading && activities.length > 0 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(RecentActivityFeed);