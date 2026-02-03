import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { toast } from 'react-toastify';

export const useProducts = (page = 0, size = 20, search = '') => {
  return useQuery({
    queryKey: ['products', { page, size, search }],
    queryFn: () => search ? productApi.search(search, page, size) : productApi.getAll(page, size),
    keepPreviousData: true,
  });
};

export const useProductDelete = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      toast.success('Product deleted');
      qc.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Delete failed'),
  });
};