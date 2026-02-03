import axiosInstance from './axios';

export const salesOrderApi = {
  getAll: async (page, size) => (await axiosInstance.get('/sales/orders', { params: { page, size } })).data,
  create: async (data) => (await axiosInstance.post('/sales/orders', data)).data,
  updateStatus: async (id, status) => (await axiosInstance.patch(`/sales/orders/${id}/status`, null, { params: { status } })).data,
  getById: async (id) => (await axiosInstance.get(`/sales/orders/${id}`)).data,
};

export const purchaseOrderApi = {
  getAll: async (page, size) => (await axiosInstance.get('/purchases/orders', { params: { page, size } })).data,
  getPending: async () => (await axiosInstance.get('/purchases/orders/pending')).data,
  create: async (data) => (await axiosInstance.post('/purchases/orders', data)).data,
  receive: async (id, items) => (await axiosInstance.post(`/purchases/orders/${id}/receive`, items)).data,
  updateStatus: async (id, status) => (await axiosInstance.patch(`/purchases/orders/${id}/status`, null, { params: { status } })).data,
};