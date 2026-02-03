import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; // Import useQueryClient
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';

import { productApi } from '../../api/productApi';
import axiosInstance from '../../api/axios'; // Direct call for categories
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Plus, X } from 'lucide-react';

const schema = yup.object({
  sku: yup.string().required('SKU is required').max(100),
  name: yup.string().required('Name is required').max(255),
  description: yup.string().nullable(),
  categoryId: yup.number().nullable(),
  unitPrice: yup.number().required('Unit price is required').min(0),
  costPrice: yup.number().required('Cost price is required').min(0),
  quantityOnHand: yup.number().min(0).nullable(),
  reorderPoint: yup.number().min(0).nullable(),
  reorderQuantity: yup.number().min(1).nullable(),
  autoReorderEnabled: yup.boolean(),
  expiryDate: yup.string().nullable(),
  unitOfMeasure: yup.string().nullable(),
  location: yup.string().nullable(),
  barcode: yup.string().nullable(),
  imageUrl: yup.string().nullable(),
});

export const ProductForm = ({ product, onSuccess, onCancel }) => {
  const isEdit = !!product;
  const qc = useQueryClient();
  const [isNewCategoryMode, setIsNewCategoryMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await axiosInstance.get('/categories')).data,
  });
  
  const categories = categoriesData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue, // Need this to manually set categoryId after creating one
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      categoryId: null,
      unitPrice: 0,
      costPrice: 0,
      quantityOnHand: 0,
      reorderPoint: 10,
      reorderQuantity: 50,
      autoReorderEnabled: false,
      expiryDate: '',
      unitOfMeasure: 'UNIT',
      location: '',
      barcode: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        sku: product.sku ?? '',
        name: product.name ?? '',
        description: product.description ?? '',
        categoryId: product.categoryId ?? null,
        unitPrice: product.unitPrice ?? 0,
        costPrice: product.costPrice ?? 0,
        quantityOnHand: product.quantityOnHand ?? 0,
        reorderPoint: product.reorderPoint ?? 10,
        reorderQuantity: product.reorderQuantity ?? 50,
        autoReorderEnabled: product.autoReorderEnabled ?? false,
        expiryDate: product.expiryDate ?? '',
        unitOfMeasure: product.unitOfMeasure ?? 'UNIT',
        location: product.location ?? '',
        barcode: product.barcode ?? '',
        imageUrl: product.imageUrl ?? '',
      });
    }
  }, [product, reset]);

  // Mutation to Create Category
  const categoryMutation = useMutation({
    mutationFn: async (name) => (await axiosInstance.post('/categories', { name, description: 'Auto-created' })).data,
    onSuccess: (res) => {
        toast.success('Category created');
        qc.invalidateQueries({ queryKey: ['categories'] }); // Refresh list
        setIsNewCategoryMode(false);
        setNewCategoryName('');
        // Auto-select the new category
        setValue('categoryId', res.data.id); 
    },
    onError: () => toast.error('Failed to create category'),
  });

  const handleCreateCategory = () => {
      if(!newCategoryName.trim()) return;
      categoryMutation.mutate(newCategoryName);
  };

  const createMutation = useMutation({
    mutationFn: (payload) => productApi.create(payload),
    onSuccess: () => {
      toast.success('Product created');
      onSuccess?.();
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => productApi.update(product.id, payload),
    onSuccess: () => {
      toast.success('Product updated');
      onSuccess?.();
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to update product'),
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      unitPrice: Number(data.unitPrice),
      costPrice: Number(data.costPrice),
      quantityOnHand: isEdit ? undefined : Number(data.quantityOnHand ?? 0),
      reorderPoint: Number(data.reorderPoint ?? 0),
      reorderQuantity: Number(data.reorderQuantity ?? 1),
      autoReorderEnabled: Boolean(data.autoReorderEnabled),
      expiryDate: data.expiryDate || null,
    };

    if (isEdit) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  const loading = createMutation.isPending || updateMutation.isPending || categoryMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="SKU *" disabled={isEdit} error={errors.sku?.message} {...register('sku')} />
        <Input label="Name *" error={errors.name?.message} {...register('name')} />
      </div>

      {/* --- CATEGORY SECTION (UPDATED) --- */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        
        {isNewCategoryMode ? (
            <div className="flex gap-2">
                <input 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button type="button" size="sm" onClick={handleCreateCategory} loading={categoryMutation.isPending}>
                    Save
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsNewCategoryMode(false)}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
        ) : (
            <div className="flex gap-2">
                <select 
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    {...register('categoryId')}
                >
                    <option value="">Select Category...</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => setIsNewCategoryMode(true)}
                    title="Add New Category"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
        )}
      </div>
      {/* ---------------------------------- */}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border rounded-lg"
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Unit Price *" type="number" step="0.01" error={errors.unitPrice?.message} {...register('unitPrice')} />
        <Input label="Cost Price *" type="number" step="0.01" error={errors.costPrice?.message} {...register('costPrice')} />
        <Input label="Unit of Measure" error={errors.unitOfMeasure?.message} {...register('unitOfMeasure')} />
      </div>

      {!isEdit && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Quantity on Hand" type="number" error={errors.quantityOnHand?.message} {...register('quantityOnHand')} />
          <Input label="Reorder Point" type="number" error={errors.reorderPoint?.message} {...register('reorderPoint')} />
          <Input label="Reorder Quantity" type="number" error={errors.reorderQuantity?.message} {...register('reorderQuantity')} />
        </div>
      )}

      {/* AUTOMATION SECTION */}
      <Card title="Automation Settings" className="mt-4 bg-gray-50 border border-gray-200">
        <div className="flex items-start gap-3 p-2">
          <input
            type="checkbox"
            id="autoReorder"
            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            {...register('autoReorderEnabled')}
          />
          <div>
            <label htmlFor="autoReorder" className="font-bold text-gray-900 block text-sm">
              Enable Auto-Reorder Bot
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Automatically places a Purchase Order when stock falls below Reorder Point.
            </p>
          </div>
        </div>

        {isEdit && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
             <Input label="Reorder Point (Threshold)" type="number" error={errors.reorderPoint?.message} {...register('reorderPoint')} />
             <Input label="Reorder Quantity" type="number" error={errors.reorderQuantity?.message} {...register('reorderQuantity')} />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Expiry Date" 
          type="date" 
          error={errors.expiryDate?.message} 
          {...register('expiryDate')} 
        />
        <Input label="Barcode" error={errors.barcode?.message} {...register('barcode')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Location" error={errors.location?.message} {...register('location')} />
        <Input label="Image URL" error={errors.imageUrl?.message} {...register('imageUrl')} />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};