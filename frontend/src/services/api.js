import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  registerTenant: (data) => api.post('/auth/register-tenant', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Tenant APIs
export const tenantAPI = {
  getTenant: (id) => api.get(`/tenants/${id || 'me'}`),
  updateTenant: (id, data) => api.put(`/tenants/${id}`, data),
  listTenants: () => api.get('/tenants'),
};

// User APIs
export const userAPI = {
  addUser: (tenantId, data) => api.post(`/tenants/${tenantId}/users`, data),
  listUsers: (tenantId) => api.get(`/tenants/${tenantId}/users`),
  updateUser: (userId, data) => api.put(`/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  acceptInvite: (userId) => api.get(`/users/accept-invite/${userId}`),
};

// Project APIs
export const projectAPI = {
  createProject: (data) => api.post('/projects', data),
  listProjects: (params) => api.get('/projects', { params }),
  getProject: (projectId) => api.get(`/projects/${projectId}`),
  updateProject: (projectId, data) => api.put(`/projects/${projectId}`, data),
  deleteProject: (projectId) => api.delete(`/projects/${projectId}`),
};

// Task APIs
export const taskAPI = {
  createTask: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  listTasks: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  updateTaskStatus: (taskId, status) => api.patch(`/tasks/${taskId}/status`, { status }),
  updateTask: (taskId, data) => api.put(`/tasks/${taskId}`, data),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
};

export default api;
