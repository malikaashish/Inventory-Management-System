import axiosInstance from '../../src/api/axios';
import { dashboardApi, reportApi } from '../../src/api/dashboardApi';

jest.mock('../../src/api/axios');

describe('dashboardApi/reportApi', () => {
  afterEach(() => jest.clearAllMocks());

  test('dashboardApi.getData calls /dashboard', async () => {
    axiosInstance.get.mockResolvedValue({ data: { success: true, data: {} } });
    await dashboardApi.getData();
    expect(axiosInstance.get).toHaveBeenCalledWith('/dashboard');
  });

  test('reportApi.getInventoryReport calls /reports/inventory', async () => {
    axiosInstance.get.mockResolvedValue({ data: { success: true, data: {} } });
    await reportApi.getInventoryReport();
    expect(axiosInstance.get).toHaveBeenCalledWith('/reports/inventory');
  });
});