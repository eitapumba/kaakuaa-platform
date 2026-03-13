import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = __DEV__ ? 'http://localhost:4000/api/v1' : 'https://api.kaakuaa.com/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          await AsyncStorage.setItem('accessToken', data.accessToken);
          await AsyncStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
      }
    }
    return Promise.reject(error);
  },
);

// --- Auth ---
export const authApi = {
  register: (data: { email: string; password: string; displayName: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  googleAuth: (data: { googleId: string; email: string; displayName: string }) =>
    api.post('/auth/google', data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// --- Users ---
export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: any) => api.put('/users/me', data),
  getLeaderboard: (limit?: number) => api.get(`/users/leaderboard?limit=${limit || 50}`),
  getProfile: (id: string) => api.get(`/users/${id}/profile`),
};

// --- Challenges ---
export const challengesApi = {
  feed: (category?: string, limit?: number) =>
    api.get('/challenges/feed', { params: { category, limit } }),
  joinMatchmaking: (data: { category: string; stakeAmount: number; preferLive?: boolean }) =>
    api.post('/challenges/matchmaking/join', data),
  leaveMatchmaking: (category: string) =>
    api.delete('/challenges/matchmaking/leave', { data: { category } }),
  matchmakingStats: () => api.get('/challenges/matchmaking/stats'),
  getById: (id: string) => api.get(`/challenges/${id}`),
  getMyChallenges: (status?: string) =>
    api.get('/challenges/my', { params: { status } }),
  submitEvidence: (id: string, data: any) =>
    api.post(`/challenges/${id}/evidence`, data),
};

// --- VITA ---
export const vitaApi = {
  getBalance: () => api.get('/vita/balance'),
  getHistory: (page?: number) => api.get('/vita/history', { params: { page } }),
  transfer: (data: { toUserId: string; amount: number; description?: string }) =>
    api.post('/vita/transfer', data),
};

// --- Investments ---
export const investmentsApi = {
  invest: (data: any) => api.post('/investments', data),
  getMyInvestments: () => api.get('/investments/my'),
  getPlayerInvestors: (playerId: string) => api.get(`/investments/player/${playerId}`),
};

// --- Marketplace ---
export const marketplaceApi = {
  getProducts: (category?: string, page?: number) =>
    api.get('/marketplace/products', { params: { category, page } }),
  getProduct: (id: string) => api.get(`/marketplace/products/${id}`),
  createOrder: (data: { productId: string; quantity?: number; payWithVita?: boolean }) =>
    api.post('/marketplace/orders', data),
  getMyOrders: (page?: number) => api.get('/marketplace/orders/my', { params: { page } }),
};

// --- Content / TV ---
export const contentApi = {
  getFeed: (type?: string, page?: number) =>
    api.get('/content/feed', { params: { type, page } }),
  getFeatured: () => api.get('/content/featured'),
  getChallengeContent: (challengeId: string) => api.get(`/content/challenge/${challengeId}`),
  view: (id: string) => api.post(`/content/${id}/view`),
  like: (id: string) => api.post(`/content/${id}/like`),
};
