import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { purchaseOrderApi } from '../api/orderApi';
import { supplierApi } from '../api/supplierApi';
import { productApi } from '../api/productApi';
// Assuming you saved the form component here. 
// If it's in a different folder (e.g., ../components/forms/), please update the path.
import { PurchaseOrderForm } from '../components/orders/PurchaseOrderForm'; 
import { PurchaseOrderList } from '../components/orders/PurchaseOrderList';
import { Card } from '../components/common/Card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

export const PurchaseOrderFormPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  // 1. Fetch Active Suppliers
  const { data: suppliersData } = useQuery({
    queryKey: ['activeSuppliers'],
    queryFn: supplierApi.getActive,
  });

  // 2. Fetch All Products (for the dropdown)
  const { data: productsData } = useQuery({
    queryKey: ['allProducts'],
    queryFn: () => productApi.getAll(0, 1000), // Fetch large size to ensure we get all products
  });

  const suppliers = suppliersData?.data || [];
  const products = productsData?.data?.content || [];

  // 3. Create Mutation
  const createMutation = useMutation({
    mutationFn: purchaseOrderApi.create,
    onSuccess: () => {
      toast.success('Purchase Order created successfully');
      // Invalidate queries to refresh lists
      qc.invalidateQueries({ queryKey: ['purchaseOrders'] });
      qc.invalidateQueries({ queryKey: ['pendingPurchaseOrders'] }); 
      navigate('/purchase-orders');
    },
    onError: (e) => {
      toast.error(e?.response?.data?.message || 'Failed to create order');
    },
  });

  const handleSubmit = (data) => {
    // Transform form data to match API expectations
    const payload = {
      supplierId: Number(data.supplierId),
      notes: data.notes,
      items: data.items.map(item => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost)
      }))
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/purchase-orders')} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Purchase Order</h1>
          <p className="text-gray-600 mt-1">Raise a request to suppliers for new stock</p>
        </div>
      </div>

      <Card>
        <PurchaseOrderForm 
          onSubmit={handleSubmit}
          suppliers={suppliers}
          products={products}
          loading={createMutation.isPending}
        />
      </Card>
    </div>
  );
};