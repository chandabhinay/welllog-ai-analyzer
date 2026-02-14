import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Wells API
export const wellsAPI = {
  uploadLAS: (formData) => {
    return api.post('/wells/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getAll: () => api.get('/wells'),
  getById: (id) => api.get(`/wells/${id}`),
  getCurves: (id) => api.get(`/wells/${id}/curves`),
  delete: (id) => api.delete(`/wells/${id}`),
};

// Data API
export const dataAPI = {
  query: (params) => api.post('/data/query', params),
  getStatistics: (params) => api.post('/data/statistics', params),
  getDepthRange: (wellId) => api.get(`/data/depth-range/${wellId}`),
};

// AI API
export const aiAPI = {
  interpret: (params) => api.post('/ai/interpret', params),
};

// Chatbot API
export const chatbotAPI = {
  query: (params) => api.post('/chatbot/query', params),
};

export default api;
