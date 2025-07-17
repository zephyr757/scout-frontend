// src/pages/Posts.jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon,
  PhotoIcon,
  ArrowTopRightOnSquareIcon,
  Squares2X2Icon,
  Bars3Icon,
  EyeSlashIcon,
  ArrowDownTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { api } from '../services/api';
import { Button, LoadingSpinner } from '../components';

function Posts() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(location.search);
  
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState(urlParams.get('filter') || 'all'); // all, engage, no-engage, today
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'rows'
  const [ignoredPosts, setIgnoredPosts] = useState(new Set()); // Track ignored posts locally
  const [showIgnored, setShowIgnored] = useState(false);
  const [creatorFilter, setCreatorFilter] = useState(urlParams.get('creator') || ''); // Filter by specific creator

  // Update filter when URL changes
  useEffect(() => {
    const urlFilter = urlParams.get('filter');
    const urlCreator = urlParams.get('creator');
    if (urlFilter && urlFilter !== filter) {
      setFilter(urlFilter);
    }
    if (urlCreator && urlCreator !== creatorFilter) {
      setCreatorFilter(urlCreator);
      setSearchTerm(urlCreator); // Auto-populate search with creator name
    }
  }, [location.search]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', page, filter, searchTerm],
    queryFn: () => api.getPosts({ page, limit: 20 }),
    keepPreviousData: true,
  });

  const posts = data?.posts || [];
  const pagination = data?.pagination || {};

  const filteredPosts = posts.filter(post => {
    // Hide ignored posts unless specifically showing them
    if (!showIgnored && ignoredPosts.has(post.id)) {
      return false;
    }
    
    // Show only ignored posts when toggle is on
    if (showIgnored && !ignoredPosts.has(post.id)) {
      return false;
    }
    
    // Filter logic
    let matchesFilter = true;
    
    if (filter === 'engage') {
      matchesFilter = post.should_engage;
    } else if (filter === 'no-engage') {
      matchesFilter = !post.should_engage;
    } else if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      const postDate = new Date(post.posted_at).toISOString().split('T')[0];
      matchesFilter = postDate === today;
    }
    // 'all' filter shows everything
    
    const matchesSearch = !searchTerm || 
      post.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.caption && post.caption.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  // Export function
  const exportPosts = () => {
    const exportData = filteredPosts.map(post => ({
      username: post.username,
      posted_at: post.posted_at,
      caption: post.caption,
      should_engage: post.should_engage,
      suggested_comment: post.suggested_comment,
      tone_description: post.tone_description,
      tone_emoji: post.tone_emoji,
      analysis_confidence: post.analysis_confidence,
      post_url: post.post_url,
      comment_freshness: post.comment_freshness
    }));
    
    const csv = [
      ['Username', 'Posted At', 'Caption', 'Should Engage', 'Suggested Comment', 'Tone', 'Tone Emoji', 'Confidence', 'URL', 'Comment Type'],
      ...exportData.map(post => [
        post.username,
        post.posted_at,
        post.caption?.replace(/"/g, '""') || '',
        post.should_engage ? 'Yes' : 'No',
        post.suggested_comment?.replace(/"/g, '""') || '',
        post.tone_description,
        post.tone_emoji,
        Math.round((post.analysis_confidence || 0) * 100) + '%',
        post.post_url,
        post.comment_freshness
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scout-posts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleIgnorePost = (postId) => {
    setIgnoredPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 font-light">Error loading posts</div>;

  return (
    <div className="space-y-6 font-thin" style={{ 
      padding: '50px', 
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
            letterSpacing: '-0.5px'
          }}>
            {creatorFilter ? `posts by @${creatorFilter}` : 'posts'}
          </h1>
          <p style={{ 
            color: 'rgba(229, 231, 235, 0.9)', 
            fontSize: '18px', 
            fontWeight: '400',
            margin: 0
          }}>
            {creatorFilter 
              ? `showing all discovered posts from @${creatorFilter}` 
              : 'all discovered posts with AI analysis and engagement recommendations'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(218, 175, 27, 0.3)',
            borderRadius: '8px',
            padding: '4px'
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px',
                borderRadius: '4px',
                background: viewMode === 'grid' ? 'rgba(218, 175, 27, 0.2)' : 'transparent',
                border: 'none',
                color: '#daaf1b',
                cursor: 'pointer'
              }}
              title="Grid View"
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('rows')}
              style={{
                padding: '8px',
                borderRadius: '4px',
                background: viewMode === 'rows' ? 'rgba(218, 175, 27, 0.2)' : 'transparent',
                border: 'none',
                color: '#daaf1b',
                cursor: 'pointer'
              }}
              title="Row View"
            >
              <Bars3Icon className="w-4 h-4" />
            </button>
          </div>

          {/* Show Ignored Toggle */}
          <button
            onClick={() => setShowIgnored(!showIgnored)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: '8px',
              background: showIgnored ? 'rgba(255, 165, 0, 0.2)' : 'rgba(255,255,255,0.1)',
              border: `1px solid ${showIgnored ? 'rgba(255, 165, 0, 0.4)' : 'rgba(218, 175, 27, 0.3)'}`,
              color: showIgnored ? '#ff8c00' : '#daaf1b',
              fontSize: '14px',
              fontWeight: '300',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {showIgnored ? <EyeIcon className="w-4 h-4 mr-2" /> : <EyeSlashIcon className="w-4 h-4 mr-2" />}
            {showIgnored ? 'Show Active' : `Ignored (${ignoredPosts.size})`}
          </button>

          {/* Export Button */}
          <button
            onClick={exportPosts}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              background: '#66d1ba',
              color: '#234071',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '300',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: filteredPosts.length === 0 ? 0.5 : 1
            }}
            disabled={filteredPosts.length === 0}
            onMouseEnter={(e) => e.target.style.background = '#5bc4a8'}
            onMouseLeave={(e) => e.target.style.background = '#66d1ba'}
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Export ({filteredPosts.length})
          </button>
          
          <div style={{ 
            fontSize: '14px', 
            color: 'rgba(218, 175, 27, 0.7)', 
            fontWeight: '300' 
          }}>
            <span style={{ fontWeight: '400', color: '#daaf1b' }}>{pagination.total || 0}</span> total posts
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(20px)'
      }}>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon style={{
                width: '20px',
                height: '20px',
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(156, 163, 175, 0.8)'
              }} />
              <input
                type="text"
                placeholder="Search by creator or caption..."
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '16px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#e5e7eb',
                  fontSize: '16px',
                  fontWeight: '400',
                  outline: 'none',
                  backdropFilter: 'blur(10px)'
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = 'rgba(218, 175, 27, 0.6)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setFilter('all');
                navigate('/posts');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: filter === 'all' ? '#66d1ba' : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${filter === 'all' ? '#66d1ba' : 'rgba(255, 255, 255, 0.2)'}`,
                color: filter === 'all' ? '#234071' : '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                backdropFilter: 'blur(10px)'
              }}
            >
              <FunnelIcon className="w-4 h-4 inline mr-2" />
              All Posts
            </button>
            <button
              onClick={() => {
                setFilter('today');
                navigate('/posts?filter=today');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: filter === 'today' ? '#4f83cc' : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${filter === 'today' ? '#4f83cc' : 'rgba(255, 255, 255, 0.2)'}`,
                color: filter === 'today' ? 'white' : '#e5e7eb',
                backdropFilter: 'blur(10px)'
              }}
            >
              Today
            </button>
            <button
              onClick={() => {
                setFilter('engage');
                navigate('/posts?filter=engage');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: filter === 'engage' ? '#66d1ba' : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${filter === 'engage' ? '#66d1ba' : 'rgba(255, 255, 255, 0.2)'}`,
                color: filter === 'engage' ? '#234071' : '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                backdropFilter: 'blur(10px)'
              }}
            >
              <CheckCircleIcon className="w-4 h-4 inline mr-2" />
              Engage
            </button>
            <button
              onClick={() => {
                setFilter('no-engage');
                navigate('/posts?filter=no-engage');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: filter === 'no-engage' ? '#ef5350' : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${filter === 'no-engage' ? '#ef5350' : 'rgba(255, 255, 255, 0.2)'}`,
                color: filter === 'no-engage' ? 'white' : '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                backdropFilter: 'blur(10px)'
              }}
            >
              <XCircleIcon className="w-4 h-4 inline mr-2" />
              Skip
            </button>
          </div>
        </div>
      </div>

      {/* Posts Display */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
        {filteredPosts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            viewMode={viewMode}
            isIgnored={ignoredPosts.has(post.id)}
            onToggleIgnore={() => toggleIgnorePost(post.id)}
          />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12 text-gray-500 font-light">
          <PhotoIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No posts found</p>
          <p className="text-sm font-extralight">Try adjusting your filters or search terms</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          
          <div className="flex items-center px-4 py-2 text-sm font-light text-gray-600">
            Page {page} of {pagination.totalPages}
          </div>
          
          <Button
            variant="outline"
            disabled={page === pagination.totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, viewMode, isIgnored, onToggleIgnore }) {
  const [expanded, setExpanded] = useState(false);

  if (viewMode === 'rows') {
    return (
      <div className={`rounded-lg shadow-soft border p-4 hover:shadow-soft-lg transition-all duration-200 ${
        isIgnored ? 'opacity-60 border-orange-200/30' : ''
      }`} style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <div className="flex items-center justify-between">
          {/* Left side - Creator and basic info */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
              background: 'linear-gradient(135deg, #daaf1b 0%, #f2c568 100%)',
              boxShadow: '0 2px 8px rgba(218, 175, 27, 0.3)'
            }}>
              <span className="text-xs font-medium text-white">
                {post.username[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="font-medium text-brand-gold">@{post.username}</p>
                <span className="text-lg" role="img" aria-label="tone">{post.tone_emoji}</span>
                {post.should_engage ? (
                  <CheckCircleIcon className="w-4 h-4 text-brand-teal" />
                ) : (
                  <XCircleIcon className="w-4 h-4 text-red-400" />
                )}
              </div>
              <p className="text-xs text-gray-300 font-normal truncate">
                {post.caption || 'No caption'}
              </p>
            </div>
          </div>

          {/* Right side - Actions and metadata */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <span className="text-xs px-2 py-1 rounded font-normal text-gray-300" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              {post.tone_description}
            </span>
            <span className="text-xs text-brand-gold font-medium">
              {Math.round((post.analysis_confidence || 0) * 100)}%
            </span>
            <span className="text-xs text-gray-300 font-normal">
              {formatDistanceToNow(new Date(post.posted_at), { addSuffix: true })}
            </span>
            
            <div className="flex items-center space-x-1">
              {post.post_url && (
                <a 
                  href={post.post_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-teal hover:text-brand-teal/80 p-1"
                  title="View on Instagram"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
              )}
              
              <button
                onClick={onToggleIgnore}
                className={`p-1 rounded transition-all ${
                  isIgnored 
                    ? 'text-orange-600 bg-orange-100 hover:bg-orange-200' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title={isIgnored ? 'Show post' : 'Hide post'}
              >
                <EyeSlashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Suggested comment - expandable */}
        {post.suggested_comment && (
          <div className="mt-3 rounded-lg p-3" style={{
            background: 'rgba(102, 209, 186, 0.1)',
            border: '1px solid rgba(102, 209, 186, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="flex items-start space-x-2">
              <ChatBubbleLeftIcon className="w-4 h-4 text-brand-teal mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-brand-teal font-medium mb-1">Suggested Comment</p>
                <p className="text-sm font-normal text-gray-100">{post.suggested_comment}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Grid view (original card design)
  return (
    <div className={`rounded-lg shadow-soft border border-white/20 overflow-hidden hover:shadow-soft-lg transition-all duration-200 ${
      isIgnored ? 'opacity-60 border-orange-200/30' : ''
    }`} style={{
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.15)'
    }}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #daaf1b 0%, #f2c568 100%)',
              boxShadow: '0 4px 12px rgba(218, 175, 27, 0.3)'
            }}>
              <span className="text-sm font-medium text-white">
                {post.username[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-brand-gold">@{post.username}</p>
              <p className="text-xs text-gray-300 font-normal">
                {formatDistanceToNow(new Date(post.posted_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-label="tone">{post.tone_emoji}</span>
            {post.should_engage ? (
              <div className="p-1 bg-brand-teal/10 rounded-full">
                <CheckCircleIcon className="w-5 h-5 text-brand-teal" />
              </div>
            ) : (
              <div className="p-1 bg-red-50 rounded-full">
                <XCircleIcon className="w-5 h-5 text-red-400" />
              </div>
            )}
            
            <button
              onClick={onToggleIgnore}
              className={`p-1 rounded transition-all ${
                isIgnored 
                  ? 'text-orange-600 bg-orange-100 hover:bg-orange-200' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title={isIgnored ? 'Show post' : 'Hide post'}
            >
              <EyeSlashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Image */}
        {post.display_image_url && (
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-50">
            <img 
              src={post.display_image_url} 
              alt="Instagram post" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.parentNode.innerHTML = '<div class="w-full h-full bg-gray-100 flex items-center justify-center"><PhotoIcon class="w-12 h-12 text-gray-400" /></div>';
              }}
            />
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <div>
            <p className={`text-sm font-normal ${!expanded && 'line-clamp-3'}`} style={{ color: '#e5e7eb' }}>
              {post.caption}
            </p>
            {post.caption.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-brand-teal text-sm font-medium hover:underline mt-2"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* AI Analysis */}
        <div className="space-y-3">
          {/* Suggested Comment */}
          {post.suggested_comment && (
            <div className="rounded-lg p-3" style={{
              background: 'rgba(102, 209, 186, 0.1)',
              border: '1px solid rgba(102, 209, 186, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="flex items-start space-x-2">
                <ChatBubbleLeftIcon className="w-4 h-4 text-brand-teal mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-brand-teal font-medium mb-1">Suggested Comment</p>
                  <p className="text-sm font-normal text-gray-100">{post.suggested_comment}</p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs font-normal text-gray-300">
            <div className="flex items-center space-x-4">
              <span className="px-2 py-1 rounded capitalize" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                {post.comment_freshness}
              </span>
              <span className="px-2 py-1 rounded" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                {post.tone_description}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="font-medium text-brand-gold">
                {Math.round((post.analysis_confidence || 0) * 100)}%
              </span>
              {post.post_url && (
                <a 
                  href={post.post_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-teal hover:text-brand-teal/80 transition-colors"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Posts;