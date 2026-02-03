import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { salesOrderApi } from '../api/orderApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Plus, Eye, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/helpers';

const statusOptions = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];

export const SalesOrdersPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [page, setPage] = useState(0);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('PENDING');

  const { data, isLoading } = useQuery({
    queryKey: ['salesOrders', page],
    queryFn: () => salesOrderApi.getAll(page, 20),
    keepPreviousData: true,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => salesOrderApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated');
      qc.invalidateQueries({ queryKey: ['salesOrders'] });
      setShowStatusModal(false);
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to update status'),
  });

  const orders = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;

  const columns = [
    { title: 'Order #', dataIndex: 'orderNumber', key: 'orderNumber' },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (c) => c?.name || 'Walk-in Customer',
    },
    { title: 'Items', dataIndex: 'items', key: 'items', render: (items) => items?.length || 0 },
    { title: 'Total', dataIndex: 'totalAmount', key: 'total', render: (v) => formatCurrency(v) },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => navigate(`/sales-orders/${row.id}`)}>
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 hover:bg-green-50 text-green-700 rounded"
            onClick={() => {
              setSelectedOrder(row);
              setNewStatus(row.status);
              setShowStatusModal(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-gray-600 mt-1">Manage customer orders</p>
        </div>
        <Button onClick={() => navigate('/sales-orders/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      <Card padding={false}>
        <Table columns={columns} data={orders} loading={isLoading} emptyMessage="No orders found" />

        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Update Order Status" size="sm">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Order</p>
            <p className="font-medium">{selectedOrder?.orderNumber}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">New Status</label>
            <select className="w-full px-3 py-2 border rounded-lg" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
            <Button
              loading={statusMutation.isPending}
              onClick={() => selectedOrder && statusMutation.mutate({ id: selectedOrder.id, status: newStatus })}
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};