import axiosInstance from './axios';

export const productApi = {
  getAll: async (page, size) => (await axiosInstance.get('/products', { params: { page, size } })).data,
  search: async (q, page, size) => (await axiosInstance.get('/products/search', { params: { q, page, size } })).data,
  create: async (data) => (await axiosInstance.post('/products', data)).data,
  update: async (id, data) => (await axiosInstance.put(`/products/${id}`, data)).data,
  delete: async (id) => (await axiosInstance.delete(`/products/${id}`)).data,
  adjustStock: async (data) => (await axiosInstance.post('/inventory/adjust', data)).data,
};