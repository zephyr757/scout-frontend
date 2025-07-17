// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('🚫 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('🚫 API Response Error:', error.response?.data || error.message);
    
    // Handle common errors
    if (error.response?.status === 404) {
      throw new Error('Resource not found');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    }
    
    throw error;
  }
);

export const api = {
  // Health check
  async getHealth() {
    return apiClient.get('/health');
  },

  // Stats
  async getStats() {
    return apiClient.get('/stats');
  },

  // Creators
  async getCreators() {
    return apiClient.get('/creators');
  },

  async addCreator(creatorData) {
    return apiClient.post('/creators', creatorData);
  },

  async removeCreator(creatorId) {
    return apiClient.delete(`/creators/${creatorId}`);
  },

  async scanCreator(username) {
    return apiClient.post(`/creators/${username}/scan`);
  },

  async getCreatorPosts(creatorId, params = {}) {
    return apiClient.get(`/creators/${creatorId}/posts`, { params });
  },

  // Posts
  async getPosts(params = {}) {
    return apiClient.get('/posts', { params });
  },

  // Scan logs
  async getScanLogs(params = {}) {
    return apiClient.get('/scan-logs', { params });
  },

  // Scheduler
  async getSchedulerStatus() {
    return apiClient.get('/scheduler/status');
  },

  async startScheduler() {
    return apiClient.post('/scheduler/start');
  },

  async stopScheduler() {
    return apiClient.post('/scheduler/stop');
  },

  // Crawl functionality
  async getCrawlItems(type = null) {
    const params = type ? { type } : {};
    return apiClient.get('/crawl/items', { params });
  },

  async addCrawlItem(itemData) {
    return apiClient.post('/crawl/items', itemData);
  },

  async updateCrawlItem(itemId, updates) {
    return apiClient.put(`/crawl/items/${itemId}`, updates);
  },

  async removeCrawlItem(itemId) {
    return apiClient.delete(`/crawl/items/${itemId}`);
  },

  async toggleCrawlItemStatus(itemId) {
    return apiClient.post(`/crawl/items/${itemId}/toggle`);
  },

  async getCrawlData(itemId, dataType = null) {
    const params = dataType ? { type: dataType } : {};
    return apiClient.get(`/crawl/items/${itemId}/data`, { params });
  },
};