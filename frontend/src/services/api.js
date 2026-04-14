import axios from 'axios';

const API_BASE = 'http://localhost:8001/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// 请求拦截器 - 添加Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== 认证 ==========
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getProfile: () => api.get('/auth/me/profile'),
};

// ========== 题库 ==========
export const questionAPI = {
  getSubjects: () => api.get('/questions/subjects'),
  getQuestions: (params) => api.get('/questions', { params }),
  getQuestion: (id) => api.get(`/questions/${id}`),
  submitAnswer: (data) => api.post('/questions/answer', data),
  getWrongQuestions: (params) => api.get('/questions/wrong/list', { params }),
  updateWrongReason: (id, data) => api.put(`/questions/wrong/${id}/reason`, data),
  updateWrongStatus: (id, data) => api.put(`/questions/wrong/${id}/status`, data),
};

// ========== 成就 ==========
export const achievementAPI = {
  getSummary: () => api.get('/achievements'),
  getDimensions: () => api.get('/achievements/dimensions'),
  getAbilityReport: () => api.get('/achievements/ability/latest'),
};

export default api;
