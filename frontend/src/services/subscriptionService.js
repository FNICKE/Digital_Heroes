import api from './api';

export const createSubscription = (plan) =>
  api.post('/subscriptions', { plan });
export const cancelSubscription = () => api.patch('/subscriptions/cancel');
export const getSubscriptionStatus = () => api.get('/subscriptions/status');
