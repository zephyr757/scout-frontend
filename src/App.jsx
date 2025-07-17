// Enhanced scout with creator management
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IoStatsChart, IoPeople, IoSunny, IoMoon, IoAdd, IoTrash, IoSearch, IoGrid } from 'react-icons/io5';
import { Heart, Plus } from 'lucide-react';

// Import the Posts and Crawl components
import Posts from './pages/Posts';
import Crawl from './pages/Crawl';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// API functions
const api = {
  async getStats() {
    const response = await fetch('http://localhost:3001/api/stats');
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },
  
  async getCreators() {
    const response = await fetch('http://localhost:3001/api/creators');
    if (!response.ok) throw new Error('Failed to fetch creators');
    return response.json();
  },
  
  async addCreator(creatorData) {
    const response = await fetch('http://localhost:3001/api/creators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creatorData),
    });
    if (!response.ok) throw new Error('Failed to add creator');
    return response.json();
  },
  
  async removeCreator(creatorId) {
    const response = await fetch(`http://localhost:3001/api/creators/${creatorId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove creator');
    return response.json();
  },
  
  async scanCreator(username) {
    const response = await fetch(`http://localhost:3001/api/creators/${username}/scan`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to scan creator');
    return response.json();
  },
  
  async getSchedulerStatus() {
    const response = await fetch('http://localhost:3001/api/scheduler/status');
    if (!response.ok) throw new Error('Failed to fetch scheduler status');
    return response.json();
  }
};

// Scout Logo Component
function ScoutLogo({ isDark, size = 32 }) {
  const primaryColor = isDark ? '#daaf1b' : '#234071';
  const accentColor = isDark ? '#66d1ba' : '#daaf1b';
  
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle 
        cx="16" 
        cy="16" 
        r="14" 
        stroke={primaryColor} 
        strokeWidth="2" 
        fill="none"
      />
      <line 
        x1="16" 
        y1="6" 
        x2="16" 
        y2="26" 
        stroke={primaryColor} 
        strokeWidth="1.5"
        opacity="0.6"
      />
      <line 
        x1="6" 
        y1="16" 
        x2="26" 
        y2="16" 
        stroke={primaryColor} 
        strokeWidth="1.5"
        opacity="0.6"
      />
      <circle 
        cx="16" 
        cy="16" 
        r="3" 
        fill={accentColor}
        style={{
          filter: `drop-shadow(0 0 6px ${accentColor})`
        }}
      />
      <circle cx="22" cy="10" r="1.5" fill={primaryColor} opacity="0.7" />
      <circle cx="10" cy="22" r="1.5" fill={primaryColor} opacity="0.7" />
      <circle cx="24" cy="22" r="1" fill={accentColor} opacity="0.8" />
    </svg>
  );
}

// Loading spinner component
function LoadingSpinner({ isDark, size = 24 }) {
  const color = isDark ? '#daaf1b' : '#234071';
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `2px solid ${color}30`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function Dashboard({ isDark }) {
  const navigate = useNavigate();
  const textColor = isDark ? '#daaf1b' : '#234071';
  const mutedColor = isDark ? 'rgba(218, 175, 27, 0.7)' : 'rgba(35, 64, 113, 0.7)';
  
  // Fetch real data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: schedulerStatus } = useQuery({
    queryKey: ['scheduler-status'],
    queryFn: api.getSchedulerStatus,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  return (
    <div style={{ padding: '50px', fontFamily: 'Poppins', minHeight: 'calc(100vh - 100px)' }}>
      {/* Header with scheduler status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ 
            color: textColor, 
            fontSize: '36px', 
            fontWeight: '300',
            margin: 0,
            marginBottom: '8px'
          }}>
            dashboard
          </h1>
          <p style={{ 
            color: mutedColor, 
            fontSize: '18px', 
            fontWeight: '300',
            margin: 0
          }}>
            instagram creator monitoring
          </p>
        </div>
        
        {/* Scheduler status indicator */}
        {schedulerStatus && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            borderRadius: '20px',
            background: schedulerStatus.isRunning 
              ? (isDark ? 'rgba(102, 209, 186, 0.2)' : 'rgba(102, 209, 186, 0.15)') 
              : 'rgba(128, 128, 128, 0.2)',
            border: `1px solid ${schedulerStatus.isRunning 
              ? (isDark ? 'rgba(102, 209, 186, 0.4)' : 'rgba(102, 209, 186, 0.3)') 
              : 'rgba(128, 128, 128, 0.3)'}`,
            fontSize: '14px',
            color: schedulerStatus.isRunning ? (isDark ? '#66d1ba' : '#234071') : mutedColor,
            fontWeight: '300'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: schedulerStatus.isRunning ? '#66d1ba' : '#999',
              marginRight: '8px',
              ...(schedulerStatus.isRunning && {
                boxShadow: '0 0 6px #66d1ba',
                animation: 'pulse 2s infinite'
              })
            }}></div>
            {schedulerStatus.isRunning ? 'scanner active' : 'scanner idle'}
          </div>
        )}
      </div>
      
      {/* Stats cards */}
      {statsLoading ? (
        <LoadingSpinner isDark={isDark} />
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px'
        }}>
          {/* Active Creators - Navigate to Creators page */}
          <div 
            onClick={() => navigate('/creators')}
            style={{
              background: 'linear-gradient(132deg, #daaf1b 0%, rgb(239, 221, 157) 100%)',
              padding: '30px',
              borderRadius: '16px',
              color: '#234071',
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: 'scale(1)',
              ':hover': {
                transform: 'scale(1.02)'
              }
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '400', textTransform: 'lowercase' }}>
              active creators
            </h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '300' }}>
              {stats?.active_creators || 0}
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.7 }}>
              click to manage →
            </p>
          </div>
          
          {/* Posts Today - Navigate to Posts with today filter */}
          <div 
            onClick={() => navigate('/posts?filter=today')}
            style={{
              background: 'linear-gradient(132deg, #66d1ba 0%, rgb(189, 235, 225) 100%)',
              padding: '30px',
              borderRadius: '16px',
              color: '#234071',
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '400', textTransform: 'lowercase' }}>
              posts today
            </h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '300' }}>
              {stats?.posts_today || 0}
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.7 }}>
              click to view →
            </p>
          </div>
          
          {/* Engagement Opportunities - Navigate to Posts with engage filter */}
          <div 
            onClick={() => navigate('/posts?filter=engage')}
            style={{
              background: 'linear-gradient(132deg, #234071 0%, rgb(160, 173, 194) 100%)',
              padding: '30px',
              borderRadius: '16px',
              color: '#daaf1b',
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '400', textTransform: 'lowercase' }}>
              engagement opps
            </h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '300' }}>
              {stats?.engagement_opportunities || 0}
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.7 }}>
              click to engage →
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Creators({ isDark }) {
  const textColor = isDark ? '#daaf1b' : '#234071';
  const mutedColor = isDark ? 'rgba(218, 175, 27, 0.7)' : 'rgba(35, 64, 113, 0.7)';
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCreatorUsername, setNewCreatorUsername] = useState('');
  
  const queryClient = useQueryClient();
  
  // Fetch creators data
  const { data: creators, isLoading } = useQuery({
    queryKey: ['creators'],
    queryFn: api.getCreators,
  });
  
  // Add creator mutation
  const addCreatorMutation = useMutation({
    mutationFn: api.addCreator,
    onSuccess: () => {
      queryClient.invalidateQueries(['creators']);
      queryClient.invalidateQueries(['stats']);
      setNewCreatorUsername('');
      setShowAddForm(false);
    },
    onError: (error) => {
      alert('Failed to add creator: ' + error.message);
    }
  });
  
  // Remove creator mutation
  const removeCreatorMutation = useMutation({
    mutationFn: api.removeCreator,
    onSuccess: () => {
      queryClient.invalidateQueries(['creators']);
      queryClient.invalidateQueries(['stats']);
    },
    onError: (error) => {
      alert('Failed to remove creator: ' + error.message);
    }
  });
  
  // Scan creator mutation
  const scanCreatorMutation = useMutation({
    mutationFn: api.scanCreator,
    onSuccess: () => {
      queryClient.invalidateQueries(['creators']);
      queryClient.invalidateQueries(['stats']);
    },
    onError: (error) => {
      alert('Failed to scan creator: ' + error.message);
    }
  });
  
  const handleAddCreator = (e) => {
    e.preventDefault();
    if (!newCreatorUsername.trim()) return;
    
    addCreatorMutation.mutate({
      username: newCreatorUsername.trim().replace('@', ''),
    });
  };
  
  return (
    <div style={{ padding: '50px', fontFamily: 'Poppins', minHeight: 'calc(100vh - 100px)' }}>
      {/* Header with add button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ 
            color: textColor, 
            fontSize: '36px', 
            fontWeight: '300',
            margin: 0,
            marginBottom: '8px'
          }}>
            creators
          </h1>
          <p style={{ 
            color: mutedColor, 
            fontSize: '18px', 
            fontWeight: '300',
            margin: 0
          }}>
            manage your instagram creator network
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            borderRadius: '12px',
            background: isDark ? 'rgba(102, 209, 186, 0.2)' : 'rgba(35, 64, 113, 0.15)',
            border: `1px solid ${isDark ? 'rgba(102, 209, 186, 0.4)' : 'rgba(35, 64, 113, 0.3)'}`,
            color: textColor,
            fontSize: '16px',
            fontWeight: '300',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'lowercase'
          }}
        >
          <Plus size={18} style={{ marginRight: '8px' }} />
          add creator
        </button>
      </div>
      
      {/* Add Creator Form */}
      {showAddForm && (
        <div style={{
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDark ? 'rgba(218, 175, 27, 0.2)' : 'rgba(35, 64, 113, 0.2)'}`,
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '30px',
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            color: textColor, 
            margin: '0 0 16px 0', 
            fontSize: '18px', 
            fontWeight: '400',
            textTransform: 'lowercase'
          }}>
            add new creator
          </h3>
          <form onSubmit={handleAddCreator} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              value={newCreatorUsername}
              onChange={(e) => setNewCreatorUsername(e.target.value)}
              placeholder="instagram username (without @)"
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${isDark ? 'rgba(218, 175, 27, 0.3)' : 'rgba(35, 64, 113, 0.3)'}`,
                background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.9)',
                color: textColor,
                fontSize: '16px',
                fontWeight: '300',
                outline: 'none'
              }}
              disabled={addCreatorMutation.isLoading}
            />
            <button
              type="submit"
              disabled={!newCreatorUsername.trim() || addCreatorMutation.isLoading}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                background: isDark ? '#66d1ba' : '#234071',
                border: 'none',
                color: isDark ? '#234071' : '#daaf1b',
                fontSize: '16px',
                fontWeight: '300',
                cursor: 'pointer',
                opacity: (!newCreatorUsername.trim() || addCreatorMutation.isLoading) ? 0.5 : 1,
                textTransform: 'lowercase'
              }}
            >
              {addCreatorMutation.isLoading ? 'adding...' : 'add'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'transparent',
                border: `1px solid ${isDark ? 'rgba(218, 175, 27, 0.3)' : 'rgba(35, 64, 113, 0.3)'}`,
                color: mutedColor,
                fontSize: '16px',
                fontWeight: '300',
                cursor: 'pointer',
                textTransform: 'lowercase'
              }}
            >
              cancel
            </button>
          </form>
        </div>
      )}
      
      {/* Creators Grid */}
      {isLoading ? (
        <LoadingSpinner isDark={isDark} />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {creators?.map((creator) => (
            <div
              key={creator.id}
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                border: `1px solid ${isDark ? 'rgba(218, 175, 27, 0.2)' : 'rgba(35, 64, 113, 0.2)'}`,
                borderRadius: '16px',
                padding: '24px',
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)',
                position: 'relative'
              }}
            >
              {/* Creator Info */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ 
                  color: textColor, 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: '400',
                  textTransform: 'lowercase'
                }}>
                  @{creator.username}
                </h3>
                <p style={{ 
                  color: mutedColor, 
                  margin: '4px 0 0 0', 
                  fontSize: '14px',
                  textTransform: 'lowercase'
                }}>
                  {creator.display_name || 'instagram creator'}
                </p>
              </div>
              
              {/* Stats */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px', 
                marginBottom: '16px',
                fontSize: '14px',
                color: mutedColor
              }}>
                <div>posts found: {creator.posts_count || 0}</div>
                <div>last scan: {creator.last_scan ? 'recent' : 'never'}</div>
              </div>
              
              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => scanCreatorMutation.mutate(creator.username)}
                  disabled={scanCreatorMutation.isLoading}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: `1px solid ${isDark ? 'rgba(102, 209, 186, 0.4)' : 'rgba(35, 64, 113, 0.3)'}`,
                    color: isDark ? '#66d1ba' : '#234071',
                    fontSize: '14px',
                    fontWeight: '300',
                    cursor: 'pointer',
                    textTransform: 'lowercase',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <IoSearch size={14} />
                  {scanCreatorMutation.isLoading ? 'scanning...' : 'scan now'}
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove @${creator.username}?`)) {
                      removeCreatorMutation.mutate(creator.id);
                    }
                  }}
                  disabled={removeCreatorMutation.isLoading}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: `1px solid rgba(239, 68, 68, 0.3)`,
                    color: '#ef4444',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IoTrash size={14} />
                </button>
              </div>
            </div>
          ))}
          
          {/* Empty State */}
          {creators?.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              color: mutedColor
            }}>
              <IoPeople size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '18px', 
                fontWeight: '300',
                textTransform: 'lowercase'
              }}>
                no creators yet
              </h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                add your first instagram creator to start monitoring
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  const [isDark, setIsDark] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  const backgroundGradient = isDark 
    ? 'linear-gradient(to bottom, rgb(35, 64, 113) 0%, rgb(15, 28, 49) 100%)'
    : 'linear-gradient(to bottom, rgb(102, 209, 186) 0%, rgb(189, 235, 225) 100%)';
    
  const textColor = isDark ? '#daaf1b' : '#234071';
  const mutedTextColor = isDark ? 'rgba(218, 175, 27, 0.7)' : 'rgba(35, 64, 113, 0.7)';
  
  // Update current path when location changes
  React.useEffect(() => {
    const handlePathChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePathChange);
    return () => window.removeEventListener('popstate', handlePathChange);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div 
          className="app-container"
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100%',
            fontFamily: 'Poppins, sans-serif',
            background: backgroundGradient,
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
          }}>
          <div style={{ display: 'flex', flex: 1 }}>
            {/* sidebar */}
            <div style={{
              width: '280px',
              padding: '30px 25px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* header with logo and theme toggle */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '40px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ScoutLogo isDark={isDark} size={28} />
                  <h1 style={{ 
                    margin: 0, 
                    fontSize: '28px', 
                    fontWeight: '300',
                    letterSpacing: '1px',
                    color: textColor,
                    textTransform: 'lowercase',
                    marginLeft: '12px'
                  }}>
                    scout
                  </h1>
                </div>
                
                {/* theme toggle */}
                <button
                  onClick={() => setIsDark(!isDark)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: `1px solid ${isDark ? 'rgba(218, 175, 27, 0.3)' : 'rgba(35, 64, 113, 0.3)'}`,
                    borderRadius: '8px',
                    padding: '8px',
                    color: textColor,
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isDark ? <IoSunny /> : <IoMoon />}
                </button>
              </div>
              
              {/* navigation */}
              <nav style={{ flex: 1 }}>
                <a href="/" style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  color: textColor, 
                  textDecoration: 'none', 
                  padding: '15px 20px',
                  marginBottom: '8px',
                  borderRadius: '12px',
                  background: currentPath === '/' 
                    ? (isDark ? 'rgba(102, 209, 186, 0.15)' : 'rgba(35, 64, 113, 0.15)')
                    : 'transparent',
                  border: `1px solid ${currentPath === '/' 
                    ? (isDark ? 'rgba(102, 209, 186, 0.3)' : 'rgba(35, 64, 113, 0.3)')
                    : 'transparent'}`,
                  fontSize: '16px',
                  fontWeight: '300',
                  transition: 'all 0.3s ease',
                  textTransform: 'lowercase',
                  opacity: currentPath === '/' ? 1 : 0.7
                }}
                onClick={() => setCurrentPath('/')}
                >
                  <IoStatsChart style={{ marginRight: '15px', fontSize: '18px' }} />
                  dashboard
                </a>
                <a href="/posts" style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  color: textColor, 
                  textDecoration: 'none', 
                  padding: '15px 20px',
                  marginBottom: '8px',
                  borderRadius: '12px',
                  background: currentPath === '/posts' 
                    ? (isDark ? 'rgba(102, 209, 186, 0.15)' : 'rgba(35, 64, 113, 0.15)')
                    : 'transparent',
                  border: `1px solid ${currentPath === '/posts' 
                    ? (isDark ? 'rgba(102, 209, 186, 0.3)' : 'rgba(35, 64, 113, 0.3)')
                    : 'transparent'}`,
                  fontSize: '16px',
                  fontWeight: '300',
                  transition: 'all 0.3s ease',
                  textTransform: 'lowercase',
                  opacity: currentPath === '/posts' ? 1 : 0.7
                }}
                onClick={() => setCurrentPath('/posts')}
                >
                  <IoGrid style={{ marginRight: '15px', fontSize: '18px' }} />
                  posts
                </a>
                <a href="/creators" style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  color: textColor, 
                  textDecoration: 'none', 
                  padding: '15px 20px',
                  marginBottom: '8px',
                  borderRadius: '12px',
                  background: currentPath === '/creators' 
                    ? (isDark ? 'rgba(102, 209, 186, 0.15)' : 'rgba(35, 64, 113, 0.15)')
                    : 'transparent',
                  border: `1px solid ${currentPath === '/creators' 
                    ? (isDark ? 'rgba(102, 209, 186, 0.3)' : 'rgba(35, 64, 113, 0.3)')
                    : 'transparent'}`,
                  fontSize: '16px',
                  fontWeight: '300',
                  transition: 'all 0.3s ease',
                  textTransform: 'lowercase',
                  opacity: currentPath === '/creators' ? 1 : 0.7
                }}
                onClick={() => setCurrentPath('/creators')}
                >
                  <IoPeople style={{ marginRight: '15px', fontSize: '18px' }} />
                  creators
                </a>
                <a href="/crawl" style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  color: textColor, 
                  textDecoration: 'none', 
                  padding: '15px 20px',
                  marginBottom: '8px',
                  borderRadius: '12px',
                  background: currentPath === '/crawl' 
                    ? (isDark ? 'rgba(102, 209, 186, 0.15)' : 'rgba(35, 64, 113, 0.15)')
                    : 'transparent',
                  border: `1px solid ${currentPath === '/crawl' 
                    ? (isDark ? 'rgba(102, 209, 186, 0.3)' : 'rgba(35, 64, 113, 0.3)')
                    : 'transparent'}`,
                  fontSize: '16px',
                  fontWeight: '300',
                  transition: 'all 0.3s ease',
                  textTransform: 'lowercase',
                  opacity: currentPath === '/crawl' ? 1 : 0.7
                }}
                onClick={() => setCurrentPath('/crawl')}
                >
                  <span style={{ marginRight: '15px', fontSize: '18px' }}>🕸️</span>
                  crawl
                </a>
              </nav>
              
              {/* sidebar footer */}
              <div style={{ 
                padding: '20px 0',
                borderTop: `1px solid ${isDark ? 'rgba(218, 175, 27, 0.2)' : 'rgba(35, 64, 113, 0.2)'}`,
                fontSize: '14px',
                color: mutedTextColor,
                fontWeight: '300',
                textTransform: 'lowercase'
              }}>
                creator monitor platform
              </div>
            </div>
            
            {/* main content */}
            <div style={{ 
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 'calc(100vh - 120px)', // Account for header and footer
              background: 'transparent' // Ensure background shows through
            }}>
              <div style={{ 
                flex: 1,
                background: 'transparent'
              }}>
                <Routes>
                  <Route path="/" element={<Dashboard isDark={isDark} />} />
                  <Route path="/posts" element={<Posts />} />
                  <Route path="/creators" element={<Creators isDark={isDark} />} />
                  <Route path="/crawl" element={<Crawl />} />
                </Routes>
              </div>
            </div>
          </div>
          
          {/* stephen's footer */}
          <footer style={{
            padding: '20px 50px',
            textAlign: 'center',
            fontSize: '14px',
            color: mutedTextColor,
            fontWeight: '300',
            borderTop: `1px solid ${isDark ? 'rgba(218, 175, 27, 0.2)' : 'rgba(35, 64, 113, 0.2)'}`,
            background: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px'
            }}>
              created with intent by stephen
              <Heart 
                size={16} 
                style={{ 
                  color: isDark ? '#66d1ba' : '#daaf1b',
                  fill: 'currentColor'
                }} 
              />
            </div>
          </footer>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;