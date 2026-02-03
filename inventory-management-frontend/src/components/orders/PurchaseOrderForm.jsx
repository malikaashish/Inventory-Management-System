import React from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form'; // Import useWatch
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Trash2, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers'; // Assuming you have this helper

export const PurchaseOrderForm = ({ onSubmit, initialData, suppliers = [], products = [], loading }) => {
  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || {
      supplierId: '',
      items: [{ productId: '', quantity: 1, unitCost: '' }],
      notes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  // Custom handler when a product is selected
  const handleProductChange = (index, e) => {
    const selectedId = Number(e.target.value);
    
    // Find the product details from the props
    const product = products.find(p => p.id === selectedId);

    if (product) {
      // Automatically set the Unit Cost based on the product's Cost Price
      setValue(`items.${index}.unitCost`, product.costPrice);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Supplier Selection */}
      <div>
        <label className="block text-sm font-medium mb-1">Supplier</label>
        <select {...register('supplierId', { required: 'Required' })} className="w-full px-3 py-2 border rounded-lg bg-white">
          <option value="">Select Supplier</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {errors.supplierId && <p className="text-red-500 text-sm mt-1">{errors.supplierId.message}</p>}
      </div>

      {/* Items List */}
      <div className="space-y-4">
        <label className="block text-sm font-medium">Items</label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start md:items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
            
            {/* Product Dropdown */}
            <div className="flex-1 w-full">
              <label className="text-xs text-gray-500 font-semibold mb-1 block">Product</label>
              <select 
                {...register(`items.${index}.productId`, { 
                  required: true,
                  onChange: (e) => handleProductChange(index, e) // <--- TRIGGER UPDATE HERE
                })} 
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">Select Product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.sku} - {p.name} (Stock: {p.quantityOnHand})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Input */}
            <div className="w-full md:w-24">
              <label className="text-xs text-gray-500 font-semibold mb-1 block">Qty</label>
              <Input 
                type="number" 
                min="1" 
                {...register(`items.${index}.quantity`, { required: true, valueAsNumber: true })} 
              />
            </div>

            {/* Unit Cost Input (Auto-filled) */}
            <div className="w-full md:w-32">
              <label className="text-xs text-gray-500 font-semibold mb-1 block">Unit Cost</label>
              <Input 
                type="number" 
                step="0.01" 
                {...register(`items.${index}.unitCost`, { required: true })} 
              />
            </div>

            {/* Line Total Display (Calculated) */}
            <div className="w-full md:w-32 pb-2">
               <LineTotal control={control} index={index} />
            </div>

            {/* Remove Button */}
            <button 
              type="button" 
              onClick={() => remove(index)} 
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2 md:mt-0"
              title="Remove Item"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        <Button 
          type="button" 
          variant="secondary" 
          size="sm" 
          onClick={() => append({ productId: '', quantity: 1, unitCost: '' })}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea {...register('notes')} className="w-full px-3 py-2 border rounded-lg" rows={3} placeholder="Add any specific instructions..." />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" loading={loading} className="px-8">Save Purchase Order</Button>
      </div>
    </form>
  );
};

// Sub-component to watch and calculate total for a specific row without re-rendering the whole form
const LineTotal = ({ control, index }) => {
  const quantity = useWatch({
    control,
    name: `items.${index}.quantity`,
    defaultValue: 0
  });
  
  const unitCost = useWatch({
    control,
    name: `items.${index}.unitCost`,
    defaultValue: 0
  });

  const total = (Number(quantity) || 0) * (Number(unitCost) || 0);

  return (
    <div>
      <label className="text-xs text-gray-400 font-semibold mb-1 block">Total</label>
      <div className="text-sm font-bold text-gray-700 py-2">
        {formatCurrency(total)}
      </div>
    </div>
  );
};