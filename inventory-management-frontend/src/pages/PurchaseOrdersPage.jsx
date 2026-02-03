import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { purchaseOrderApi } from '../api/orderApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Plus, Eye, Truck, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/helpers';

export const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [page, setPage] = useState(0);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receivedItems, setReceivedItems] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['purchaseOrders', page],
    queryFn: () => purchaseOrderApi.getAll(page, 20),
    keepPreviousData: true,
  });

  const { data: pendingData } = useQuery({
    queryKey: ['pendingPurchaseOrders'],
    queryFn: () => purchaseOrderApi.getPending(),
  });

  const receiveMutation = useMutation({
    mutationFn: ({ id, items }) => purchaseOrderApi.receive(id, items),
    onSuccess: () => {
      toast.success('Items received');
      qc.invalidateQueries({ queryKey: ['purchaseOrders'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      setShowReceiveModal(false);
      setSelectedOrder(null);
      setReceivedItems({});
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to receive items'),
  });

  const orders = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;
  const pendingCount = pendingData?.data?.length || 0;

  const columns = [
    { title: 'PO Number', dataIndex: 'orderNumber', key: 'orderNumber' },
    { title: 'Supplier', dataIndex: 'supplier', key: 'supplier', render: (s) => s?.name || '-' },
    { title: 'Items', dataIndex: 'items', key: 'items', render: (items) => items?.length || 0 },
    { title: 'Total', dataIndex: 'totalAmount', key: 'total', render: (v) => formatCurrency(v) },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => navigate(`/purchase-orders/${row.id}`)}>
            <Eye className="w-4 h-4" />
          </button>
          {['ORDERED', 'PARTIALLY_RECEIVED'].includes(row.status) && (
            <button
              className="p-1.5 hover:bg-green-50 text-green-700 rounded"
              onClick={() => {
                setSelectedOrder(row);
                const init = {};
                row.items?.forEach((it) => { init[it.id] = 0; });
                setReceivedItems(init);
                setShowReceiveModal(true);
              }}
            >
              <Truck className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const confirmReceive = () => {
    const items = Object.entries(receivedItems)
      .filter(([_, qty]) => Number(qty) > 0)
      .map(([itemId, quantity]) => ({ itemId: Number(itemId), quantity: Number(quantity) }));

    if (items.length === 0) {
      toast.error('Enter quantities to receive');
      return;
    }
    receiveMutation.mutate({ id: selectedOrder.id, items });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-1">Manage supplier orders</p>
        </div>
        <Button onClick={() => navigate('/purchase-orders/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Purchase Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><div className="text-center"><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold">{pendingCount}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-gray-500">Total Orders</p><p className="text-2xl font-bold">{data?.data?.totalElements || 0}</p></div></Card>
      </div>

      <Card padding={false}>
        <Table columns={columns} data={orders} loading={isLoading} emptyMessage="No purchase orders found" />
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={showReceiveModal} onClose={() => setShowReceiveModal(false)} title="Receive Items" size="lg">
        {selectedOrder && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 flex justify-between">
              <div>
                <p className="text-sm text-gray-500">PO</p>
                <p className="font-medium">{selectedOrder.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-medium">{selectedOrder.supplier?.name}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ordered</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Received</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Receive Now</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedOrder.items?.map((it) => {
                    const pending = Number(it.quantityOrdered) - Number(it.quantityReceived);
                    return (
                      <tr key={it.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium">{it.product?.name}</p>
                          <p className="text-sm text-gray-500">{it.product?.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-center">{it.quantityOrdered}</td>
                        <td className="px-4 py-3 text-center">{it.quantityReceived}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={pending}
                            disabled={pending <= 0}
                            value={receivedItems[it.id] ?? 0}
                            onChange={(e) => setReceivedItems((prev) => ({ ...prev, [it.id]: e.target.value }))}
                            className="w-20 px-2 py-1 border rounded-lg text-center"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowReceiveModal(false)}>Cancel</Button>
              <Button loading={receiveMutation.isPending} onClick={confirmReceive}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};