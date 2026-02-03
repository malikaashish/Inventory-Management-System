import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Trash2, Plus } from 'lucide-react';

export const SalesOrderForm = ({ onSubmit, initialData, customers = [], products = [], loading }) => {
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      customerId: '',
      items: [{ productId: '', quantity: 1, unitPrice: '' }],
      shippingAddress: ''
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Customer</label>
        <select {...register('customerId')} className="w-full px-3 py-2 border rounded-lg">
          <option value="">Walk-in Customer</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium">Items</label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-end bg-gray-50 p-3 rounded-lg">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Product</label>
              <select {...register(`items.${index}.productId`, { required: true })} className="w-full px-2 py-1 border rounded">
                <option value="">Select...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantityOnHand})</option>)}
              </select>
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-500">Qty</label>
              <Input type="number" min="1" {...register(`items.${index}.quantity`, { required: true })} />
            </div>
            <button type="button" onClick={() => remove(index)} className="p-2 text-red-600 hover:bg-red-50 rounded">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={() => append({ productId: '', quantity: 1 })}>
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Shipping Address</label>
        <textarea {...register('shippingAddress')} className="w-full px-3 py-2 border rounded-lg" rows={3} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>Create Order</Button>
      </div>
    </form>
  );
};