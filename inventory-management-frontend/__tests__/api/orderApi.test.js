import axiosInstance from '../../src/api/axios';
import { salesOrderApi, purchaseOrderApi } from '../../src/api/orderApi';

jest.mock('../../src/api/axios');

describe('orderApi', () => {
  afterEach(() => jest.clearAllMocks());

  test('salesOrderApi.getAll calls /sales/orders', async () => {
    axiosInstance.get.mockResolvedValue({ data: { success: true, data: { content: [] } } });
    await salesOrderApi.getAll(0, 20);
    expect(axiosInstance.get).toHaveBeenCalledWith('/sales/orders', { params: { page: 0, size: 20 } });
  });

  test('purchaseOrderApi.getPending calls /purchases/orders/pending', async () => {
    axiosInstance.get.mockResolvedValue({ data: { success: true, data: [] } });
    await purchaseOrderApi.getPending();
    expect(axiosInstance.get).toHaveBeenCalledWith('/purchases/orders/pending');
  });
});