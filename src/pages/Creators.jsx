// src/pages/Creators.jsx - Enhanced Version with Links and View Modes
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowTopRightOnSquareIcon,
  Squares2X2Icon,
  Bars3Icon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';

function Creators() {
  const [newCreatorUsername, setNewCreatorUsername] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'rows'
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: creators, isLoading } = useQuery({
    queryKey: ['creators'],
    queryFn: api.getCreators,
  });

  const addCreatorMutation = useMutation({
    mutationFn: api.addCreator,
    onSuccess: () => {
      queryClient.invalidateQueries(['creators']);
      setNewCreatorUsername('');
      setIsAdding(false);
    },
  });

  const removeCreatorMutation = useMutation({
    mutationFn: api.removeCreator,
    onSuccess: () => {
      queryClient.invalidateQueries(['creators']);
    },
  });

  const scanCreatorMutation = useMutation({
    mutationFn: api.scanCreator,
    onSuccess: () => {
      queryClient.invalidateQueries(['creators']);
    },
  });

  const handleAddCreator = async (e) => {
    e.preventDefault();
    if (!newCreatorUsername.trim()) return;
    
    await addCreatorMutation.mutateAsync({
      username: newCreatorUsername.trim().replace('@', ''),
    });
  };

  // Filter creators based on search term
  const filteredCreators = creators?.filter(creator => 
    !searchTerm || 
    creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Handle navigation to posts
  const handleViewPosts = (creator) => {
    navigate(`/posts?creator=${creator.username}`);
  };

  // Handle external Instagram link
  const handleViewProfile = (username) => {
    window.open(`https://www.instagram.com/${username}/`, '_blank');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

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
            creators
          </h1>
          <p style={{ 
            color: 'rgba(229, 231, 235, 0.9)', 
            fontSize: '18px', 
            fontWeight: '400',
            margin: 0
          }}>
            manage your Instagram creator network
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
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

          <button
            onClick={() => setIsAdding(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              background: '#66d1ba',
              color: '#234071',
              borderRadius: '12px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#5bc4a8'}
            onMouseLeave={(e) => e.target.style.background = '#66d1ba'}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Creator
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(20px)'
      }}>
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
            placeholder="Search creators by username or name..."
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

      {/* Add Creator Form */}
      {isAdding && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(20px)'
        }}>
          <h3 className="text-lg font-medium mb-4 text-brand-gold">Add New Creator</h3>
          <form onSubmit={handleAddCreator} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={newCreatorUsername}
                onChange={(e) => setNewCreatorUsername(e.target.value)}
                placeholder="Enter Instagram username (without @)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#e5e7eb',
                  fontSize: '16px',
                  fontWeight: '400',
                  outline: 'none',
                  backdropFilter: 'blur(10px)'
                }}
                disabled={addCreatorMutation.isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!newCreatorUsername.trim() || addCreatorMutation.isLoading}
              style={{
                padding: '12px 20px',
                background: '#66d1ba',
                color: '#234071',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                opacity: (!newCreatorUsername.trim() || addCreatorMutation.isLoading) ? 0.5 : 1
              }}
            >
              {addCreatorMutation.isLoading ? 'Adding...' : 'Add Creator'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewCreatorUsername('');
              }}
              style={{
                padding: '12px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#e5e7eb',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Creators Display */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredCreators.map((creator) => (
          <CreatorCard 
            key={creator.id} 
            creator={creator} 
            viewMode={viewMode}
            onViewPosts={() => handleViewPosts(creator)}
            onViewProfile={() => handleViewProfile(creator.username)}
            onScan={() => scanCreatorMutation.mutate(creator.username)}
            onRemove={() => removeCreatorMutation.mutate(creator.id)}
            isScanning={scanCreatorMutation.isLoading}
            isRemoving={removeCreatorMutation.isLoading}
          />
        ))}
      </div>

      {filteredCreators.length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <UserCircleIcon className="w-16 h-16 text-gray-400 opacity-30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No creators yet</h3>
          <p className="text-gray-400 mb-6">Start by adding your first Instagram creator to monitor</p>
          <button
            onClick={() => setIsAdding(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '0 auto',
              padding: '12px 20px',
              background: '#66d1ba',
              color: '#234071',
              borderRadius: '12px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Your First Creator
          </button>
        </div>
      )}

      {filteredCreators.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 opacity-30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No creators found</h3>
          <p className="text-gray-400">No creators match your search for "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}

function CreatorCard({ creator, viewMode, onViewPosts, onViewProfile, onScan, onRemove, isScanning, isRemoving }) {
  if (viewMode === 'rows') {
    return (
      <div className="rounded-lg shadow-soft border p-4 hover:shadow-soft-lg transition-all duration-200" style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <div className="flex items-center justify-between">
          {/* Left side - Creator info */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{
              background: creator.profile_pic_url ? 'transparent' : 'linear-gradient(135deg, #daaf1b 0%, #f2c568 100%)',
              boxShadow: '0 4px 12px rgba(218, 175, 27, 0.3)'
            }}>
              {creator.profile_pic_url ? (
                <img
                  src={creator.profile_pic_url}
                  alt={creator.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-white">
                  {creator.username[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <button
                  onClick={onViewProfile}
                  className="font-medium text-brand-gold hover:text-brand-gold/80 transition-colors flex items-center"
                >
                  @{creator.username}
                  <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                </button>
              </div>
              <p className="text-xs text-gray-300 font-normal truncate">
                {creator.display_name || 'No display name'}
              </p>
            </div>
          </div>

          {/* Right side - Stats and actions */}
          <div className="flex items-center space-x-6 flex-shrink-0">
            <div className="text-center">
              <div className="text-sm font-semibold text-brand-gold">{creator.follower_count?.toLocaleString() || 'N/A'}</div>
              <div className="text-xs text-gray-300">Followers</div>
            </div>
            <div className="text-center">
              <button
                onClick={onViewPosts}
                className="text-sm font-semibold text-brand-gold hover:text-brand-gold/80 transition-colors"
              >
                {creator.posts_count || 0}
              </button>
              <div className="text-xs text-gray-300">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-300">
                {creator.last_scan ? formatDistanceToNow(new Date(creator.last_scan), { addSuffix: true }) : 'Never'}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={onScan}
                disabled={isScanning}
                className="p-2 text-gray-400 hover:text-brand-teal rounded-lg hover:bg-white/10 transition-all"
                title="Scan now"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
              </button>
              <button
                onClick={onRemove}
                disabled={isRemoving}
                className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition-all"
                title="Remove creator"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="rounded-lg shadow-soft border overflow-hidden hover:shadow-soft-lg transition-all duration-200" style={{
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.15)'
    }}>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
              background: creator.profile_pic_url ? 'transparent' : 'linear-gradient(135deg, #daaf1b 0%, #f2c568 100%)',
              boxShadow: '0 4px 12px rgba(218, 175, 27, 0.3)'
            }}>
              {creator.profile_pic_url ? (
                <img
                  src={creator.profile_pic_url}
                  alt={creator.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-white">
                  {creator.username[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <button
                onClick={onViewProfile}
                className="font-medium text-brand-gold hover:text-brand-gold/80 transition-colors flex items-center"
              >
                @{creator.username}
                <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
              </button>
              <p className="text-sm text-gray-300 font-normal">
                {creator.display_name || 'No display name'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onScan}
              disabled={isScanning}
              className="p-2 text-gray-400 hover:text-brand-teal rounded-lg hover:bg-white/10 transition-all"
              title="Scan now"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onRemove}
              disabled={isRemoving}
              className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition-all"
              title="Remove creator"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-brand-gold">{creator.follower_count?.toLocaleString() || 'N/A'}</div>
            <div className="text-xs text-gray-300">Followers</div>
          </div>
          <div>
            <button
              onClick={onViewPosts}
              className="text-lg font-semibold text-brand-gold hover:text-brand-gold/80 transition-colors"
            >
              {creator.posts_count || 0}
            </button>
            <div className="text-xs text-gray-300">Posts Found</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-brand-gold">
              {creator.last_scan ? formatDistanceToNow(new Date(creator.last_scan)) : 'Never'}
            </div>
            <div className="text-xs text-gray-300">Last Scan</div>
          </div>
        </div>

        {/* Biography */}
        {creator.biography && (
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-gray-300 line-clamp-2">{creator.biography}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Creators;

export default Creators;