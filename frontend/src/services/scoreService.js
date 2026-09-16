import api from './api';

export const listScores = () => api.get('/scores');
export const createScore = (payload) => api.post('/scores', payload);
export const updateScore = (id, payload) => api.patch(`/scores/${id}`, payload);
export const deleteScore = (id) => api.delete(`/scores/${id}`);
