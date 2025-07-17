// src/pages/Dashboard.jsx - Full Featured Version
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  UsersIcon, 
  PhotoIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import RecentPosts from '../components/RecentPosts';
import LoadingSpinner from '../components/LoadingSpinner';

function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: recentPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', 'recent'],
    queryFn: () => api.getPosts({ limit: 6 }),
  });

  const { data: schedulerStatus } = useQuery({
    queryKey: ['scheduler-status'],
    queryFn: api.getSchedulerStatus,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (statsLoading) {
    return <LoadingSpinner />;
  }

  const statCards = [
    {
      title: 'Active Creators',
      value: stats?.active_creators || 0,
      icon: UsersIcon,
      color: 'teal',
      description: 'Monitored profiles'
    },
    {
      title: 'Posts Today',
      value: stats?.posts_today || 0,
      icon: PhotoIcon,
      color: 'navy',
      description: 'New content discovered'
    },
    {
      title: 'This Week',
      value: stats?.posts_this_week || 0,
      icon: ChartBarIcon,
      color: 'gold',
      description: 'Total posts found'
    },
    {
      title: 'Engagement Opportunities',
      value: stats?.engagement_opportunities || 0,
      icon: CheckCircleIcon,
      color: 'engage',
      description: 'Recommended to engage'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in font-thin">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-brand-navy tracking-wide">Dashboard</h1>
          <p className="mt-2 text-gray-600 font-extralight">
            Monitor your Instagram creator network in real-time
          </p>
        </div>
        
        {/* Scheduler Status */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center px-4 py-2 rounded-full text-sm font-light ${
            schedulerStatus?.isRunning 
              ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/20' 
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              schedulerStatus?.isRunning ? 'bg-brand-teal animate-pulse' : 'bg-gray-400'
            }`}></div>
            {schedulerStatus?.isRunning ? 'Scanning Active' : 'Scheduler Idle'}
          </div>
          
          <div className="text-sm text-gray-500 font-light flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            Every 4 hours
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 100} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-soft border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-light text-brand-navy">Recent Posts</h3>
              <p className="text-sm text-gray-500 font-extralight">Latest discoveries from your creators</p>
            </div>
            <div className="p-6">
              {postsLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <RecentPosts posts={recentPosts?.posts || []} />
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Confidence Score */}
          <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-6">
            <h3 className="text-lg font-light text-brand-navy mb-4">AI Confidence</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-brand-teal"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${(stats?.avg_confidence || 0) * 100}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-light text-brand-navy">
                    {Math.round((stats?.avg_confidence || 0) * 100)}%
                  </span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 font-extralight mt-2">
              Average analysis confidence this week
            </p>
          </div>

          {/* Activity Chart */}
          <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-6">
            <h3 className="text-lg font-light text-brand-navy mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {stats?.recent_activity?.slice(0, 7).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-light">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-brand-gold h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((day.posts_count / Math.max(...(stats?.recent_activity?.map(d => d.posts_count) || [1]))) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-light text-brand-navy w-6 text-right">
                      {day.posts_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;