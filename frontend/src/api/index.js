import axios from 'axios';

// In Docker: nginx proxies /api to backend. In local dev: direct to localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data) => api.post('/auth/login', data),
};

// Employees API
export const employeesApi = {
  getAll: (search = '') => api.get(`/employees${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

// Reports API
export const reportsApi = {
  getEmployeesReport: (search = '') => api.get(`/reports/employees${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getEmployeeCvReport: (id) => api.get(`/reports/employees/${id}`),
};

export default api;
