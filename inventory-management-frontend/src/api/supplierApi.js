import axiosInstance from './axios';

export const supplierApi = {
  getAll: async (page, size) => (await axiosInstance.get('/suppliers', { params: { page, size } })).data,
  getActive: async () => (await axiosInstance.get('/suppliers/active')).data,
  create: async (data) => (await axiosInstance.post('/suppliers', data)).data,
  update: async (id, data) => (await axiosInstance.put(`/suppliers/${id}`, data)).data,
  delete: async (id) => (await axiosInstance.delete(`/suppliers/${id}`)).data,
};