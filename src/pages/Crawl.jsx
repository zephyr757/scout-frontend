// src/pages/Crawl.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon,
  LinkIcon,
  UserIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  ClockIcon,
  ChatBubbleLeftEllipsisIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  ChartBarIcon,
  HeartIcon,
  FaceSmileIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { api } from '../services/api';
import { Button, LoadingSpinner } from '../components';

function Crawl() {
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'users'
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ type: 'post', url: '', username: '', description: '' });
  const [selectedItem, setSelectedItem] = useState(null); // For detail view
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const queryClient = useQueryClient();

  // Get crawl items from API
  const { data: crawlPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['crawl-posts'],
    queryFn: async () => {
      const response = await api.getCrawlItems('post');
      return response.items || [];
    },
    enabled: activeTab === 'posts'
  });

  const { data: crawlUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['crawl-users'],
    queryFn: async () => {
      const response = await api.getCrawlItems('user');
      return response.items || [];
    },
    enabled: activeTab === 'users'
  });

  const openDetailView = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const closeDetailView = () => {
    setSelectedItem(null);
    setShowDetailModal(false);
  };

  const exportItemData = (item) => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (item.type === 'post') {
      // Export post tracking data
      const comments = item.tracking_data?.comments || [];
      const stats = item.tracking_data?.engagement_stats || {};
      
      const csvData = [
        ['Comment ID', 'Username', 'Comment Text', 'Timestamp', 'Detected Emojis'],
        ...comments.map(comment => [
          comment.id,
          comment.username,
          comment.text.replace(/"/g, '""'),
          comment.timestamp,
          comment.reactions?.join(', ') || ''
        ])
      ];
      
      // Add summary stats
      csvData.push([]);
      csvData.push(['SUMMARY STATISTICS']);
      csvData.push(['Total Comments', item.comments_found]);
      csvData.push(['Total Reactions', item.reactions_found]);
      csvData.push(['Unique Users', item.unique_users]);
      csvData.push(['Top Emojis', Object.entries(stats.emoji_breakdown || {}).map(([emoji, count]) => `${emoji}: ${count}`).join(', ')]);
      
      const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crawl-post-${item.id}-${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Export user tracking data
      const posts = item.tracking_data?.posts || [];
      const stats = item.tracking_data?.activity_stats || {};
      
      const csvData = [
        ['Post ID', 'Caption', 'Engagement', 'Posted At'],
        ...posts.map(post => [
          post.id,
          post.caption.replace(/"/g, '""'),
          post.engagement,
          post.posted_at
        ])
      ];
      
      // Add summary stats
      csvData.push([]);
      csvData.push(['USER STATISTICS']);
      csvData.push(['Username', item.username]);
      csvData.push(['Total Posts', item.posts_found]);
      csvData.push(['Total Interactions', item.interactions]);
      csvData.push(['Average Engagement', stats.avg_engagement || 0]);
      csvData.push(['Posting Frequency', stats.posting_frequency || 'unknown']);
      csvData.push(['Common Hashtags', stats.hashtag_usage?.join(', ') || '']);
      
      const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crawl-user-${item.username}-${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleAddItem = async () => {
    if (activeTab === 'posts' && !newItem.url.trim()) return;
    if (activeTab === 'users' && !newItem.username.trim()) return;
    
    try {
      const itemData = {
        type: activeTab === 'posts' ? 'post' : 'user',
        url: activeTab === 'posts' ? newItem.url : null,
        username: activeTab === 'users' ? newItem.username : null,
        description: newItem.description || null
      };

      await api.addCrawlItem(itemData);
      
      // Reset form and refresh data
      setNewItem({ type: activeTab === 'posts' ? 'post' : 'user', url: '', username: '', description: '' });
      setShowAddForm(false);
      queryClient.invalidateQueries([`crawl-${activeTab}`]);
    } catch (error) {
      console.error('Error adding crawl item:', error);
      // You might want to show a toast notification here
    }
  };

  const toggleItemStatus = async (itemId) => {
    try {
      await api.toggleCrawlItemStatus(itemId);
      queryClient.invalidateQueries([`crawl-${activeTab}`]);
    } catch (error) {
      console.error('Error toggling item status:', error);
    }
  };

  const removeItem = async (itemId) => {
    if (confirm('Remove this item from crawl tracking?')) {
      try {
        await api.removeCrawlItem(itemId);
        queryClient.invalidateQueries([`crawl-${activeTab}`]);
      } catch (error) {
        console.error('Error removing item:', error);
      }
    }
  };

  return (
    <div style={{ 
      padding: '50px', 
      fontFamily: 'Poppins', 
      minHeight: 'calc(100vh - 100px)',
      background: 'transparent'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ 
            color: '#daaf1b', 
            fontSize: '36px', 
            fontWeight: '600',
            margin: 0,
            marginBottom: '8px',
            textTransform: 'lowercase',
            letterSpacing: '-0.5px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '28px', marginRight: '12px' }}>🕸️</span>
            crawl
          </h1>
          <p style={{ 
            color: 'rgba(229, 231, 235, 0.9)', 
            fontSize: '18px', 
            fontWeight: '400',
            margin: 0
          }}>
            track specific posts and users for events, giveaways, and detailed monitoring
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            background: '#66d1ba',
            color: '#234071',
            borderRadius: '12px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '300',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'lowercase'
          }}
          onMouseEnter={(e) => e.target.style.background = '#5bc4a8'}
          onMouseLeave={(e) => e.target.style.background = '#66d1ba'}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add {activeTab === 'posts' ? 'Post' : 'User'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(20px)',
        marginTop: '40px'
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={() => setActiveTab('posts')}
            style={{
              flex: 1,
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: activeTab === 'posts' ? 'rgba(102, 209, 186, 0.15)' : 'transparent',
              color: activeTab === 'posts' ? '#66d1ba' : '#e5e7eb',
              border: 'none',
              borderBottom: activeTab === 'posts' ? '2px solid #66d1ba' : '2px solid transparent',
              cursor: 'pointer',
              textTransform: 'lowercase'
            }}
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            post tracking
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              flex: 1,
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: activeTab === 'users' ? 'rgba(102, 209, 186, 0.15)' : 'transparent',
              color: activeTab === 'users' ? '#66d1ba' : '#e5e7eb',
              border: 'none',
              borderBottom: activeTab === 'users' ? '2px solid #66d1ba' : '2px solid transparent',
              cursor: 'pointer',
              textTransform: 'lowercase'
            }}
          >
            <UserIcon className="w-4 h-4 mr-2" />
            user tracking
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-medium mb-4 text-brand-gold">
              Add New {activeTab === 'posts' ? 'Post' : 'User'} to Track
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTab === 'posts' ? (
                <input
                  type="url"
                  placeholder="Instagram post URL (e.g., https://www.instagram.com/p/ABC123/)"
                  value={newItem.url}
                  onChange={(e) => setNewItem({...newItem, url: e.target.value})}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal font-light"
                />
              ) : (
                <input
                  type="text"
                  placeholder="Instagram username (without @)"
                  value={newItem.username}
                  onChange={(e) => setNewItem({...newItem, username: e.target.value})}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal font-light"
                />
              )}
              <input
                type="text"
                placeholder="Description (e.g., Summer Giveaway, Contest Tracking)"
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal font-light"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm font-light"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={activeTab === 'posts' ? !newItem.url.trim() : !newItem.username.trim()}
                className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-light"
              >
                Start Tracking
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Stats Overview */}
          {((activeTab === 'posts' && crawlPosts?.length > 0) || (activeTab === 'users' && crawlUsers?.length > 0)) && (
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-brand-gold">Active Tracking - Click for Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTab === 'posts' ? (
                  crawlPosts?.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => openDetailView(post)}
                      className="bg-gradient-to-br from-brand-teal/10 to-brand-teal/5 border border-brand-teal/20 rounded-lg p-4 cursor-pointer hover:shadow-soft-lg transition-all duration-200 hover:border-brand-teal/40"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm truncate text-brand-gold">{post.description}</h4>
                          <p className="text-xs mt-1 text-gray-300 font-normal">
                            Tracking for {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${post.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded p-2" style={{
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <div className="text-lg font-semibold text-brand-gold">{post.comments_found}</div>
                          <div className="text-xs text-gray-300">Comments</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded p-2" style={{
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <div className="text-lg font-semibold text-brand-gold">{post.reactions_found}</div>
                          <div className="text-xs text-gray-300">Reactions</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded p-2" style={{
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <div className="text-lg font-semibold text-brand-gold">{post.unique_users}</div>
                          <div className="text-xs text-gray-300">Users</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-gray-300 font-normal">
                          Last: {post.last_crawl ? formatDistanceToNow(new Date(post.last_crawl), { addSuffix: true }) : 'Never'}
                        </span>
                        <span className="text-brand-teal font-medium">Click to view →</span>
                      </div>
                    </div>
                  ))
                ) : (
                  crawlUsers?.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => openDetailView(user)}
                      className="bg-gradient-to-br from-brand-navy/10 to-brand-navy/5 border border-brand-navy/20 rounded-lg p-4 cursor-pointer hover:shadow-soft-lg transition-all duration-200 hover:border-brand-navy/40"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-brand-gold">@{user.username}</h4>
                          <p className="text-xs mt-1 text-gray-300 font-normal">{user.description}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded p-2" style={{
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <div className="text-lg font-semibold text-brand-gold">{user.posts_found}</div>
                          <div className="text-xs text-gray-300">Posts</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded p-2" style={{
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <div className="text-lg font-semibold text-brand-gold">{user.interactions}</div>
                          <div className="text-xs text-gray-300">Interactions</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-gray-300 font-normal">
                          Last: {user.last_crawl ? formatDistanceToNow(new Date(user.last_crawl), { addSuffix: true }) : 'Never'}
                        </span>
                        <span className="text-brand-teal font-medium">Click to view →</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Management List */}
          {activeTab === 'posts' ? (
            <PostTrackingTab 
              posts={crawlPosts || []} 
              isLoading={postsLoading}
              onToggleStatus={toggleItemStatus}
              onRemove={removeItem}
              onViewDetails={openDetailView}
            />
          ) : (
            <UserTrackingTab 
              users={crawlUsers || []} 
              isLoading={usersLoading}
              onToggleStatus={toggleItemStatus}
              onRemove={removeItem}
              onViewDetails={openDetailView}
            />
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <DetailModal 
          item={selectedItem} 
          onClose={closeDetailView}
          onExport={() => exportItemData(selectedItem)}
        />
      )}
    </div>
  );
}

function PostTrackingTab({ posts, isLoading, onToggleStatus, onRemove, onViewDetails }) {
  if (isLoading) return <LoadingSpinner />;

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 font-light">
        <LinkIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg">No posts being tracked</p>
        <p className="text-sm font-extralight">Add Instagram posts to monitor comments and engagement</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:border-brand-teal/30 transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  post.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
                <h3 className="font-medium text-brand-gold">{post.description || 'Untitled Post Track'}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-light ${
                  post.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {post.status}
                </span>
              </div>
              
              <div className="text-sm font-normal space-y-1">
                <p className="flex items-center text-gray-300">
                  <LinkIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline">
                    {post.url}
                  </a>
                </p>
                <p className="flex items-center text-gray-300">
                  <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-brand-gold font-medium">{post.comments_found}</span>&nbsp;comments found
                </p>
                <p className="flex items-center text-gray-300">
                  <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                  Last crawled {post.last_crawl ? formatDistanceToNow(new Date(post.last_crawl), { addSuffix: true }) : 'never'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleStatus(post.id)}
                className={`p-2 rounded-lg transition-all ${
                  post.status === 'active'
                    ? 'text-orange-600 bg-orange-100 hover:bg-orange-200'
                    : 'text-green-600 bg-green-100 hover:bg-green-200'
                }`}
                title={post.status === 'active' ? 'Pause tracking' : 'Resume tracking'}
              >
                {post.status === 'active' ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => onViewDetails ? onViewDetails(post) : null}
                className="p-2 text-brand-teal bg-brand-teal/10 rounded-lg hover:bg-brand-teal/20 transition-all"
                title="View tracked data"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onRemove(post.id)}
                className="p-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-all"
                title="Remove from tracking"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UserTrackingTab({ users, isLoading, onToggleStatus, onRemove, onViewDetails }) {
  if (isLoading) return <LoadingSpinner />;

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 font-light">
        <UserIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg">No users being tracked</p>
        <p className="text-sm font-extralight">Add Instagram users to monitor their posts and activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:border-brand-teal/30 transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  user.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
                <h3 className="font-medium text-brand-gold">@{user.username}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-light ${
                  user.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {user.status}
                </span>
              </div>
              
              <div className="text-sm font-normal space-y-1">
                <p className="text-gray-300">{user.description || 'General user tracking'}</p>
                <p className="flex items-center text-gray-300">
                  <PhotoIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-brand-gold font-medium">{user.posts_found}</span>&nbsp;posts found
                </p>
                <p className="flex items-center text-gray-300">
                  <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                  Last crawled {user.last_crawl ? formatDistanceToNow(new Date(user.last_crawl), { addSuffix: true }) : 'never'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleStatus(user.id)}
                className={`p-2 rounded-lg transition-all ${
                  user.status === 'active'
                    ? 'text-orange-600 bg-orange-100 hover:bg-orange-200'
                    : 'text-green-600 bg-green-100 hover:bg-green-200'
                }`}
                title={user.status === 'active' ? 'Pause tracking' : 'Resume tracking'}
              >
                {user.status === 'active' ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => onViewDetails ? onViewDetails(post) : null}
                className="p-2 text-brand-teal bg-brand-teal/10 rounded-lg hover:bg-brand-teal/20 transition-all"
                title="View tracked data"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onRemove(user.id)}
                className="p-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-all"
                title="Remove from tracking"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Crawl;function DetailModal({ item, onClose, onExport }) {
  const isPost = item.type === 'post';
  const trackingData = item.tracking_data || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-light text-brand-navy">
              {isPost ? 'Post Tracking Details' : `User: @${item.username}`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {item.description || 'Tracking data and analytics'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onExport}
              className="flex items-center px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition-all text-sm font-light"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export Data
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {isPost ? (
            <PostDetailsContent item={item} trackingData={trackingData} />
          ) : (
            <UserDetailsContent item={item} trackingData={trackingData} />
          )}
        </div>
      </div>
    </div>
  );
}

function PostDetailsContent({ item, trackingData }) {
  const comments = trackingData.comments || [];
  const stats = trackingData.engagement_stats || {};

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-brand-teal/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-light text-brand-navy">{item.comments_found}</div>
          <div className="text-sm text-gray-600">Total Comments</div>
        </div>
        <div className="bg-brand-navy/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-light text-brand-navy">{item.reactions_found}</div>
          <div className="text-sm text-gray-600">Emoji Reactions</div>
        </div>
        <div className="bg-yellow-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-light text-brand-navy">{item.unique_users}</div>
          <div className="text-sm text-gray-600">Unique Users</div>
        </div>
        <div className="bg-green-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-light text-brand-navy">{stats.total_interactions || 0}</div>
          <div className="text-sm text-gray-600">Total Interactions</div>
        </div>
      </div>

      {/* Emoji Breakdown */}
      {stats.emoji_breakdown && Object.keys(stats.emoji_breakdown).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-light text-brand-navy mb-3 flex items-center">
            <FaceSmileIcon className="w-5 h-5 mr-2" />
            Top Emojis
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.emoji_breakdown).map(([emoji, count]) => (
              <div key={emoji} className="bg-white rounded-full px-3 py-2 flex items-center space-x-2">
                <span className="text-lg">{emoji}</span>
                <span className="text-sm font-light text-gray-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Comments */}
      <div>
        <h3 className="text-lg font-light text-brand-navy mb-3 flex items-center">
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5 mr-2" />
          Recent Comments ({comments.length})
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-light text-brand-navy">@{comment.username}</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                  {comment.reactions && comment.reactions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {comment.reactions.map((reaction, idx) => (
                        <span key={idx} className="text-xs bg-brand-teal/10 text-brand-teal px-2 py-1 rounded">
                          {reaction}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-500 text-center py-4">No comments tracked yet</p>
          )}
        </div>
      </div>

      {/* Post Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-light text-brand-navy mb-3">Post Information</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">URL:</span> 
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline ml-2">
              {item.url}
            </a>
          </p>
          <p><span className="font-medium">Tracking since:</span> {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</p>
          <p><span className="font-medium">Last crawl:</span> {formatDistanceToNow(new Date(item.last_crawl), { addSuffix: true })}</p>
          <p><span className="font-medium">Status:</span> 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {item.status}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function UserDetailsContent({ item, trackingData }) {
  const posts = trackingData.posts || [];
  const stats = trackingData.activity_stats || {};

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-brand-navy/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-light text-brand-navy">{item.posts_found}</div>
          <div className="text-sm text-gray-600">Posts Found</div>
        </div>
        <div className="bg-brand-teal/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-light text-brand-navy">{item.interactions}</div>
          <div className="text-sm text-gray-600">Interactions</div>
        </div>
        <div className="bg-yellow-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-light text-brand-navy">{stats.avg_engagement || 0}</div>
          <div className="text-sm text-gray-600">Avg Engagement</div>
        </div>
        <div className="bg-green-100 rounded-lg p-4 text-center">
          <div className="text-sm font-light text-brand-navy">{stats.posting_frequency || 'Unknown'}</div>
          <div className="text-sm text-gray-600">Frequency</div>
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <h3 className="text-lg font-light text-brand-navy mb-3 flex items-center">
          <PhotoIcon className="w-5 h-5 mr-2" />
          Recent Posts ({posts.length})
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {posts.map((post) => (
            <div key={post.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-1">{post.caption}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Engagement: {post.engagement}</span>
                    <span>{formatDistanceToNow(new Date(post.posted_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-gray-500 text-center py-4">No posts tracked yet</p>
          )}
        </div>
      </div>

      {/* Hashtag Analysis */}
      {stats.hashtag_usage && stats.hashtag_usage.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-light text-brand-navy mb-3">Common Hashtags</h3>
          <div className="flex flex-wrap gap-2">
            {stats.hashtag_usage.map((hashtag, idx) => (
              <span key={idx} className="bg-brand-teal/10 text-brand-teal px-3 py-1 rounded-full text-sm">
                {hashtag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}