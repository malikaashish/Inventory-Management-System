import axiosInstance from './axios';

export const authApi = {
  login: async (data) => (await axiosInstance.post('/auth/login', data)).data,
  register: async (data) => (await axiosInstance.post('/auth/register', data)).data,
  logout: async (refreshToken) => (await axiosInstance.post('/auth/logout', null, { params: { refreshToken } })).data,
};