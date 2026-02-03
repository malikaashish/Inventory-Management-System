import axiosInstance from '../../src/api/axios';
import { supplierApi } from '../../src/api/supplierApi';

jest.mock('../../src/api/axios');

describe('supplierApi', () => {
  afterEach(() => jest.clearAllMocks());

  test('getAll calls /suppliers', async () => {
    axiosInstance.get.mockResolvedValue({ data: { success: true, data: { content: [] } } });
    const res = await supplierApi.getAll(0, 20);
    expect(axiosInstance.get).toHaveBeenCalledWith('/suppliers', { params: { page: 0, size: 20 } });
    expect(res.success).toBe(true);
  });

  test('getActive calls /suppliers/active', async () => {
    axiosInstance.get.mockResolvedValue({ data: { success: true, data: [] } });
    const res = await supplierApi.getActive();
    expect(axiosInstance.get).toHaveBeenCalledWith('/suppliers/active');
    expect(res.success).toBe(true);
  });
});