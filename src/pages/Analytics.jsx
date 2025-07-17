// src/pages/Analytics.jsx - Full Featured Version
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChartBarIcon, 
  TrendingUpIcon,
  CalendarIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';

function Analytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  });

  const { data: scanLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['scan-logs'],
    queryFn: () => api.getScanLogs({ limit: 10 }),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const analyticsCards = [
    {
      title: 'Total Posts Discovered',
      value: stats?.total_posts || 0,
      icon: ChartBarIcon,
      color: 'teal',
      description: 'All time discoveries'
    },
    {
      title: 'Average Engagement',
      value: stats?.avg_engagement_rate ? `${(stats.avg_engagement_rate * 100).toFixed(1)}%` : '0%',
      icon: TrendingUpIcon,
      color: 'navy',
      description: 'Likes + comments ratio'
    },
    {
      title: 'Scan Frequency',
      value: `${stats?.scans_per_day || 0}/day`,
      icon: CalendarIcon,
      color: 'gold',
      description: 'Automated scans'
    },
    {
      title: 'Response Time',
      value: `${stats?.avg_response_time || 0}ms`,
      icon: ClockIcon,
      color: 'engage',
      description: 'Average API response'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in font-thin">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-brand-navy tracking-wide">Analytics</h1>
        <p className="mt-2 text-gray-600 font-extralight">
          Performance insights and monitoring statistics
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsCards.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 100} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Engagement Trends */}
        <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-6">
          <h3 className="text-lg font-light text-brand-navy mb-4">Engagement Trends</h3>
          <div className="space-y-4">
            {stats?.engagement_trends?.slice(0, 7).map((trend, index) => (
              <div key={trend.date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-light">
                  {new Date(trend.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-brand-teal h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(trend.engagement_rate * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-light text-brand-navy w-10 text-right">
                    {(trend.engagement_rate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Scan Activity */}
        <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-6">
          <h3 className="text-lg font-light text-brand-navy mb-4">Recent Scan Activity</h3>
          <div className="space-y-4">
            {logsLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              scanLogs?.logs?.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-brand-navy">@{log.creator_username}</p>
                    <p className="text-xs text-gray-500">
                      {log.posts_found} posts found
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(log.scan_date).toLocaleDateString()}
                    </p>
                    <p className={`text-xs ${
                      log.status === 'completed' 
                        ? 'text-brand-teal' 
                        : log.status === 'error' 
                        ? 'text-red-500' 
                        : 'text-yellow-500'
                    }`}>
                      {log.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-6">
        <h3 className="text-lg font-light text-brand-navy mb-6">System Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-3">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-brand-teal"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${(stats?.system_uptime || 0) * 100}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-light text-brand-navy">
                  {Math.round((stats?.system_uptime || 0) * 100)}%
                </span>
              </div>
            </div>
            <p className="text-sm font-light text-gray-600">System Uptime</p>
          </div>

          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-3">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-brand-gold"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${(stats?.api_success_rate || 0) * 100}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-light text-brand-navy">
                  {Math.round((stats?.api_success_rate || 0) * 100)}%
                </span>
              </div>
            </div>
            <p className="text-sm font-light text-gray-600">API Success Rate</p>
          </div>

          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-3">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-brand-navy"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${Math.min((stats?.data_accuracy || 0) * 100, 100)}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-light text-brand-navy">
                  {Math.round((stats?.data_accuracy || 0) * 100)}%
                </span>
              </div>
            </div>
            <p className="text-sm font-light text-gray-600">Data Accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;