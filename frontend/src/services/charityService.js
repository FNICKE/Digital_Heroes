import api from './api';

export const listCharities = () => api.get('/charities');
export const getCharity = (id) => api.get(`/charities/${id}`);
export const createDonation = (payload) => api.post('/donations', payload);
