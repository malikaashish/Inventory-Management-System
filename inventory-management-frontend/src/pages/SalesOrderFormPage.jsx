import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/helpers';

const api = {
  customersActive: async () => (await axiosInstance.get('/customers/active')).data,
  productsAll: async () => (await axiosInstance.get('/products', { params: { page: 0, size: 1000 } })).data,
  createSalesOrder: async (payload) => (await axiosInstance.post('/sales/orders', payload)).data,
};

export const SalesOrderFormPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [customerId, setCustomerId] = useState('');
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState([{ productId: '', quantity: 1, unitPrice: '', discountPercent: 0 }]);

  const { data: customersRes } = useQuery({
    queryKey: ['activeCustomers'],
    queryFn: api.customersActive,
  });

  const { data: productsRes } = useQuery({
    queryKey: ['allProducts'],
    queryFn: api.productsAll,
  });

  const customers = customersRes?.data || [];
  const products = productsRes?.data?.content || [];

  const createMutation = useMutation({
    mutationFn: api.createSalesOrder,
    onSuccess: () => {
      toast.success('Sales order created');
      qc.invalidateQueries({ queryKey: ['salesOrders'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      navigate('/sales-orders');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to create order'),
  });

  const addItem = () => setItems((prev) => [...prev, { productId: '', quantity: 1, unitPrice: '', discountPercent: 0 }]);
  
  const removeItem = (idx) => setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const updateItem = (idx, patch) => {
    setItems((prev) => prev.map((it, i) => {
      if (i !== idx) return it;
      
      const updated = { ...it, ...patch };
      
      if (patch.productId) {
        const p = products.find(prod => prod.id === Number(patch.productId));
        if (p?.isExpired) {
          toast.error(`WARNING: ${p.name} is EXPIRED! Cannot sell.`);
          return { ...it, productId: '' };
        }
        if (p && updated.unitPrice === '') {
          updated.unitPrice = p.unitPrice;
        }
      }
      return updated;
    }));
  };

  const subtotal = useMemo(() => {
    if (!products.length) return 0;
    let s = 0;
    for (const it of items) {
      if (!it.productId || !it.quantity) continue;
      const p = products.find((x) => x.id === Number(it.productId));
      if (!p) continue;
      
      const price = it.unitPrice !== '' ? Number(it.unitPrice) : Number(p.unitPrice || 0);
      const qty = Number(it.quantity || 0);
      const disc = Number(it.discountPercent || 0) / 100;
      s += price * qty * (1 - disc);
    }
    return s;
  }, [items, products]);

  const total = useMemo(() => subtotal + Number(taxAmount || 0) - Number(discountAmount || 0), [subtotal, taxAmount, discountAmount]);

  const submit = () => {
    if (!items.length || items.some((it) => !it.productId || Number(it.quantity) < 1)) {
      toast.error('Please select valid products and quantities');
      return;
    }

    createMutation.mutate({
      customerId: customerId ? Number(customerId) : null,
      items: items.map((it) => ({
        productId: Number(it.productId),
        quantity: Number(it.quantity),
        unitPrice: it.unitPrice === '' ? null : Number(it.unitPrice),
        discountPercent: Number(it.discountPercent || 0),
      })),
      taxAmount: Number(taxAmount || 0),
      discountAmount: Number(discountAmount || 0),
      shippingAddress,
      notes,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/sales-orders')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Sales Order</h1>
          <p className="text-gray-600 mt-1">Create a new sales order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Customer">
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.email ? `- ${c.email}` : ''}
                </option>
              ))}
            </select>
          </Card>

          <Card title="Order Items" actions={<Button variant="outline" onClick={addItem}><Plus className="w-4 h-4 mr-2" />Add</Button>}>
            <div className="space-y-4">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="col-span-5">
                    <label className="block text-xs text-gray-600 mb-1">Product</label>
                    <select
                      className="w-full px-2 py-2 border rounded-lg text-sm"
                      value={it.productId}
                      onChange={(e) => updateItem(idx, { productId: e.target.value })}
                    >
                      <option value="">Select product</option>
                      {products
                        .filter((p) => p.isActive)
                        .map((p) => (
                          <option key={p.id} value={p.id} disabled={p.isExpired || p.quantityOnHand < 1}>
                            {p.sku} - {p.name} {p.isExpired ? '(EXPIRED)' : `(Stock: ${p.quantityOnHand})`}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Qty</label>
                    <input
                      type="number"
                      min={1}
                      className="w-full px-2 py-2 border rounded-lg text-sm"
                      value={it.quantity}
                      onChange={(e) => updateItem(idx, { quantity: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-2 py-2 border rounded-lg text-sm"
                      value={it.unitPrice}
                      onChange={(e) => updateItem(idx, { unitPrice: e.target.value })}
                      placeholder="auto"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Disc %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      className="w-full px-2 py-2 border rounded-lg text-sm"
                      value={it.discountPercent}
                      onChange={(e) => updateItem(idx, { discountPercent: e.target.value })}
                    />
                  </div>

                  <div className="col-span-1 flex items-end justify-end">
                    <button
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                      type="button"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Shipping & Notes">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Shipping Address</label>
                <textarea className="w-full px-3 py-2 border rounded-lg" rows={3} value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea className="w-full px-3 py-2 border rounded-lg" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Summary">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Tax</label>
                <input className="w-full px-3 py-2 border rounded-lg" type="number" step="0.01" min={0} value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount</label>
                <input className="w-full px-3 py-2 border rounded-lg" type="number" step="0.01" min={0} value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <Button className="w-full" loading={createMutation.isPending} onClick={submit}>
                Create Order
              </Button>
              <Button className="w-full" variant="secondary" onClick={() => navigate('/sales-orders')}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};