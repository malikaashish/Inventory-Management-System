import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';

import { productApi } from '../../api/productApi';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

const schema = yup.object({
  adjustmentType: yup.string().required(),
  quantity: yup.number().required().min(0),
  reason: yup.string().required().max(500),
  referenceNumber: yup.string().nullable(),
});

export const StockAdjustment = ({ product, onSuccess, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      adjustmentType: 'INCREASE',
      quantity: 1,
      reason: '',
      referenceNumber: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (payload) => productApi.adjustStock(payload),
    onSuccess: () => {
      toast.success('Stock adjusted');
      onSuccess?.();
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to adjust stock'),
  });

  const onSubmit = (data) => {
    mutation.mutate({
      productId: product.id,
      adjustmentType: data.adjustmentType,
      quantity: Number(data.quantity),
      reason: data.reason,
      referenceNumber: data.referenceNumber || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-500">Product</p>
        <p className="font-medium">{product.name}</p>
        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
        <p className="text-lg font-bold mt-2">Current Stock: {product.quantityOnHand}</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Adjustment Type *</label>
        <select className="w-full px-3 py-2 border rounded-lg" {...register('adjustmentType')}>
          <option value="INCREASE">Increase</option>
          <option value="DECREASE">Decrease</option>
          <option value="CORRECTION">Correction</option>
        </select>
        {errors.adjustmentType && <p className="text-sm text-red-600 mt-1">{errors.adjustmentType.message}</p>}
      </div>

      <Input label="Quantity *" type="number" error={errors.quantity?.message} {...register('quantity')} />

      <div>
        <label className="block text-sm font-medium mb-1">Reason *</label>
        <textarea className="w-full px-3 py-2 border rounded-lg" rows={3} {...register('reason')} />
        {errors.reason && <p className="text-sm text-red-600 mt-1">{errors.reason.message}</p>}
      </div>

      <Input label="Reference Number" error={errors.referenceNumber?.message} {...register('referenceNumber')} />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          Adjust Stock
        </Button>
      </div>
    </form>
  );
};