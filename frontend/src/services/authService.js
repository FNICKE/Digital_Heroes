import api from './api';

export const signup = (payload) => api.post('/auth/signup', payload);
export const login = (payload) => api.post('/auth/login', payload);
export const me = () => api.get('/auth/me');
export const updateMyCharity = (payload) =>
  api.patch('/users/me/charity', payload);
