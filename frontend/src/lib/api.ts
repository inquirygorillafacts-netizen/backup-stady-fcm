import axios from 'axios';
import { getFirebaseAuth } from './firebase';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API_URL = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to every request (dummy mode)
api.interceptors.request.use(async (config) => {
  // For dummy auth, just use a fake token
  const dummyUser = localStorage.getItem('dummyUser');
  if (dummyUser) {
    config.headers.Authorization = `Bearer dummy-token-${Date.now()}`;
  }
  
  return config;
});

export default api;

// API functions
export const authAPI = {
  checkOwnerExists: () => api.get('/auth/check-owner-exists'),
  claimOwner: () => api.post('/auth/claim-owner'),
  completeOnboarding: () => api.post('/auth/complete-onboarding'),
};

export const formsAPI = {
  getForms: (status?: string, category?: string) => 
    api.get('/forms', { params: { status, category } }),
  getForm: (id: string) => api.get(`/forms/${id}`),
  createForm: (data: any) => api.post('/forms', data),
};

export const likesAPI = {
  likeForm: (formId: string) => api.post('/likes', null, { params: { form_id: formId } }),
  getMyLikes: () => api.get('/likes/my-likes'),
};

export const aiAPI = {
  getChats: () => api.get('/ai/chats'),
  createChat: () => api.post('/ai/chats'),
  addMessage: (chatId: string, message: any) => 
    api.post(`/ai/chats/${chatId}/messages`, message),
};

export const groupsAPI = {
  getGroups: (type?: string) => api.get('/groups', { params: { type } }),
  createGroup: (data: any) => api.post('/groups', data),
  joinGroup: (groupId: string) => api.post(`/groups/${groupId}/join`),
  getMessages: (groupId: string, limit = 50) => 
    api.get(`/groups/${groupId}/messages`, { params: { limit } }),
  sendMessage: (groupId: string, message: string, type = 'text') => 
    api.post(`/groups/${groupId}/messages`, null, { 
      params: { message, message_type: type } 
    }),
};

export const appLockAPI = {
  setLock: (pin: string) => api.post('/app-lock', null, { params: { pin } }),
  verifyLock: (pin: string) => api.post('/app-lock/verify', null, { params: { pin } }),
};

export const usersAPI = {
  updateProfile: (data: any) => api.put('/users/profile', data),
};