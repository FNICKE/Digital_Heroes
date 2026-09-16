import api from './api';

export const listDraws = () => api.get('/draws');
export const simulateDraw = (payload) => api.post('/draws/simulate', payload);
export const publishDraw = (payload) => api.post('/draws/publish', payload);

export const listMyWins = () => api.get('/winners/mine');
export const listAllWinners = () => api.get('/winners');
export const uploadProof = (id, formData) =>
  api.post(`/winners/${id}/proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const reviewWinner = (id, status) =>
  api.patch(`/winners/${id}/review`, { status });
export const payWinner = (id) => api.patch(`/winners/${id}/pay`);

export const adminUsers = () => api.get('/admin/users');
export const adminUpdateUser = (id, payload) =>
  api.patch(`/admin/users/${id}`, payload);
export const adminSubscriptions = () => api.get('/admin/subscriptions');
export const adminUpdateSubscription = (id, payload) =>
  api.patch(`/admin/subscriptions/${id}`, payload);
export const adminCharities = () => api.get('/admin/charities');
export const adminCreateCharity = (payload) =>
  api.post('/admin/charities', payload);
export const adminUpdateCharity = (id, payload) =>
  api.patch(`/admin/charities/${id}`, payload);
export const adminDeleteCharity = (id) => api.delete(`/admin/charities/${id}`);
export const adminReports = () => api.get('/admin/reports');
export const adminUserScores = (userId) => api.get(`/admin/scores/${userId}`);
export const adminCreateScore = (userId, payload) =>
  api.post(`/admin/scores/${userId}`, payload);
export const adminUpdateScore = (userId, scoreId, payload) =>
  api.patch(`/admin/scores/${userId}/${scoreId}`, payload);
export const adminDeleteScore = (userId, scoreId) =>
  api.delete(`/admin/scores/${userId}/${scoreId}`);
