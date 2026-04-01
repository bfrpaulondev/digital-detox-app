import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api');

const api = axios.create({
  baseURL: API_BASE,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use custom event instead of hard redirect to avoid race conditions
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updatePreferences: (data) => api.put('/auth/preferences', data)
};

// User API
export const userAPI = {
  getStudents: () => api.get('/users/students'),
  getProfile: (id) => api.get(`/users/profile/${id}`),
  updateProfile: (id, data) => api.put(`/users/profile/${id}`, data),
  getPoints: (userId) => api.get(`/users/points/${userId}`),
  linkChild: (parentCode) => api.post('/users/link-child', { parentCode })
};

// School API
export const schoolAPI = {
  getAll: () => api.get('/schools'),
  getById: (id) => api.get(`/schools/${id}`),
  getSchedule: (id, params) => api.get(`/schools/${id}/schedule`, { params }),
  getStudents: (id, params) => api.get(`/schools/${id}/students`, { params })
};

// Activity API
export const activityAPI = {
  create: (data) => api.post('/activities', data),
  getAll: (params) => api.get('/activities', { params }),
  complete: (id) => api.put(`/activities/${id}/complete`),
  validate: (id, data) => api.put(`/activities/${id}/validate`, data),
  delete: (id) => api.delete(`/activities/${id}`)
};

// Pet API
export const petAPI = {
  create: (data) => api.post('/pets', data),
  getMy: (params) => api.get('/pets/my', { params }),
  feed: (points) => api.put('/pets/feed', { points }),
  updateEnvironment: (id, environment) => api.put(`/pets/${id}/environment`, { environment })
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRanking: (params) => api.get('/dashboard/ranking', { params }),
  getNotifications: (params) => api.get('/dashboard/notifications', { params }),
  markNotificationsRead: () => api.put('/dashboard/notifications/read-all')
};

// Photo API
export const photoAPI = {
  upload: (data) => api.post('/photos/upload', data), // Now sends JSON with base64
  uploadAndAnalyze: (data) => api.post('/photos/upload-analyze', data),
  getAll: (params) => api.get('/photos', { params }),
  getById: (id) => api.get(`/photos/${id}`),
  delete: (id) => api.delete(`/photos/${id}`)
};

// Parent API
export const parentAPI = {
  getChildSettings: (childId) => api.get(`/parent/child-settings/${childId}`),
  updateChildSettings: (childId, data) => api.put(`/parent/child-settings/${childId}`, data),
  validatePhoto: (photoId, data) => api.put(`/parent/validate-photo/${photoId}`, data),
  getChildPhotos: (childId) => api.get(`/photos/child/${childId}`)
};

// Calendar API
export const calendarAPI = {
  getEvents: (params) => api.get('/calendar', { params })
};

// AI API
export const aiAPI = {
  analyzePhoto: (photoId) => api.post('/ai/analyze-photo', { photoId }),
  getSuggestions: (data) => api.post('/ai/suggestions', data),
  validateActivity: (data) => api.post('/ai/validate-activity', data)
};

export default api;
