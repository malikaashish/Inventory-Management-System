// src/__tests__/api/productApi.test.js
import axiosInstance from '../../api/axios';
import { productApi } from '../../api/productApi';

jest.mock('../../api/axios');

describe('Product API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all products with pagination', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            content: [{ id: 1, name: 'Product 1' }],
            totalElements: 1,
          },
        },
      };
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await productApi.getAll(0, 20);

      expect(axiosInstance.get).toHaveBeenCalledWith('/products', {
        params: { page: 0, size: 20 },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getById', () => {
    it('should fetch a single product by id', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { id: 1, name: 'Product 1', sku: 'SKU-001' },
        },
      };
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await productApi.getById(1);

      expect(axiosInstance.get).toHaveBeenCalledWith('/products/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('search', () => {
    it('should search products with query', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { content: [] },
        },
      };
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await productApi.search('test', 0, 20);

      expect(axiosInstance.get).toHaveBeenCalledWith('/products/search', {
        params: { q: 'test', page: 0, size: 20 },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const productData = {
        sku: 'NEW-001',
        name: 'New Product',
        unitPrice: 99.99,
        costPrice: 49.99,
      };
      const mockResponse = {
        data: {
          success: true,
          data: { id: 1, ...productData },
        },
      };
      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await productApi.create(productData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/products', productData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const productData = { name: 'Updated Product' };
      const mockResponse = {
        data: {
          success: true,
          data: { id: 1, ...productData },
        },
      };
      axiosInstance.put.mockResolvedValue(mockResponse);

      const result = await productApi.update(1, productData);

      expect(axiosInstance.put).toHaveBeenCalledWith('/products/1', productData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      const mockResponse = {
        data: { success: true },
      };
      axiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await productApi.delete(1);

      expect(axiosInstance.delete).toHaveBeenCalledWith('/products/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getLowStock', () => {
    it('should fetch low stock products', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: 1, name: 'Low Stock Product' }],
        },
      };
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await productApi.getLowStock();

      expect(axiosInstance.get).toHaveBeenCalledWith('/products/low-stock');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('adjustStock', () => {
    it('should adjust product stock', async () => {
      const adjustmentData = {
        productId: 1,
        adjustmentType: 'INCREASE',
        quantity: 50,
        reason: 'Received shipment',
      };
      const mockResponse = {
        data: {
          success: true,
          data: { id: 1, quantityAfter: 150 },
        },
      };
      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await productApi.adjustStock(adjustmentData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/inventory/adjust', adjustmentData);
      expect(result).toEqual(mockResponse.data);
    });
  });
});