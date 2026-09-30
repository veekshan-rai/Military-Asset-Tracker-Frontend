// src/services/api.js
// Centralized Axios API configuration for backend communication (http://localhost:8080)

import axios from 'axios';
import { getToken, logout } from '../utils/auth';

const API_BASE_URL = 'http://localhost:8080';

// Create Axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach Bearer JWT Token if logged in
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      // 401 Unauthorized -> Clear session and redirect to login
      if (status === 401) {
        logout();
      }
    }
    return Promise.reject(error);
  }
);

// API Service Functions matching Spring Boot Backend Controllers

// Auth API
export const loginApi = (credentials) => api.post('/api/auth/login', credentials);

// Dashboard API
export const getDashboardApi = (params = {}) => api.get('/api/dashboard', { params });

// Equipment API
export const getEquipmentApi = () => api.get('/api/equipment');
export const createEquipmentApi = (data) => api.post('/api/equipment', data);

// Bases API
export const getBasesApi = () => api.get('/api/bases');
export const createBaseApi = (data) => api.post('/api/bases', data);

// Purchases API
export const getPurchasesApi = (params = {}) => api.get('/api/purchases', { params });
export const createPurchaseApi = (data) => api.post('/api/purchases', data);

// Transfers API
export const getTransfersApi = () => api.get('/api/transfers');
export const createTransferApi = (data) => api.post('/api/transfers', data);

// Assignments API
export const getAssignmentsApi = () => api.get('/api/assignments');
export const createAssignmentApi = (data) => api.post('/api/assignments', data);

// Expenditures API
export const getExpendituresApi = () => api.get('/api/expenditures');
export const createExpenditureApi = (data) => api.post('/api/expenditures', data);

// Stock API
export const getStockApi = (baseId = null) => {
  if (baseId) {
    return api.get(`/api/stock`, { params: { baseId } });
  }
  return api.get('/api/stock');
};

// Audit Logs API (Admin only)
export const getAuditLogsApi = () => api.get('/api/audit-logs');

// Users API (Admin only)
export const getUsersApi = () => api.get('/api/users');
export const createUserApi = (data) => api.post('/api/users', data);

export default api;
