import axiosInstance from './axios';

export const dashboardApi = {
  getData: async (range = 'week') => (await axiosInstance.get('/dashboard', { params: { range } })).data,
};

export const reportApi = {
  getInventoryReport: async () => (await axiosInstance.get('/reports/inventory')).data,
  getLowStockReport: async () => (await axiosInstance.get('/reports/low-stock')).data,
  getSalesReport: async (startDate, endDate, productId = null) => {
    const params = { startDate, endDate };
    if (productId) params.productId = productId;
    return (await axiosInstance.get('/reports/sales', { params })).data;
  },
};