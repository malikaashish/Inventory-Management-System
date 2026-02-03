import { useQuery } from '@tanstack/react-query';
import { salesOrderApi, purchaseOrderApi } from '../api/orderApi';

export const useSalesOrders = (page = 0, size = 20) => {
  return useQuery({
    queryKey: ['salesOrders', page],
    queryFn: () => salesOrderApi.getAll(page, size),
    keepPreviousData: true,
  });
};

export const usePurchaseOrders = (page = 0, size = 20) => {
  return useQuery({
    queryKey: ['purchaseOrders', page],
    queryFn: () => purchaseOrderApi.getAll(page, size),
    keepPreviousData: true,
  });
};

export const usePendingPurchaseOrders = () => {
  return useQuery({
    queryKey: ['pendingPurchaseOrders'],
    queryFn: purchaseOrderApi.getPending,
  });
};