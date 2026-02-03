import React from 'react';
import { Table } from '../common/Table';
import { Edit } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrderApi } from '../../api/orderApi';
import { toast } from 'react-toastify';
import { clsx } from 'clsx';

const PO_STATUSES = ['DRAFT', 'PENDING', 'APPROVED', 'ORDERED', 'SHIPPED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'];

export const PurchaseOrderList = ({ orders, loading }) => {
  const qc = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => purchaseOrderApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      qc.invalidateQueries({ queryKey: ['purchaseOrders'] });
      qc.invalidateQueries({ queryKey: ['pendingPurchaseOrders'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Update failed'),
  });

  const handleStatusChange = (id, newStatus) => {
    if (window.confirm(`Change status to ${newStatus}?`)) {
        statusMutation.mutate({ id, status: newStatus });
    }
  };

  const columns = [
    { title: 'PO #', dataIndex: 'orderNumber', key: 'orderNumber' },
    { title: 'Supplier', dataIndex: 'supplier', key: 'supplier', render: s => s?.name || '-' },
    { title: 'Date', dataIndex: 'orderDate', key: 'orderDate', render: d => new Date(d).toLocaleDateString() },
    
    // Status Badge
    { 
        title: 'Status', 
        dataIndex: 'status', 
        key: 'status',
        render: (status) => {
            const colors = {
                DRAFT: 'bg-gray-100 text-gray-800',
                PENDING: 'bg-yellow-100 text-yellow-800',
                APPROVED: 'bg-blue-100 text-blue-800',
                ORDERED: 'bg-purple-100 text-purple-800',
                SHIPPED: 'bg-indigo-100 text-indigo-800',
                PARTIALLY_RECEIVED: 'bg-orange-100 text-orange-800',
                RECEIVED: 'bg-green-100 text-green-800',
                CANCELLED: 'bg-red-100 text-red-800',
            };
            return (
                <span className={clsx("px-2 py-1 rounded text-xs font-bold", colors[status] || 'bg-gray-100')}>
                    {status}
                </span>
            );
        }
    },
    
    { title: 'Total', dataIndex: 'totalAmount', key: 'total', render: v => `$${Number(v).toFixed(2)}` },
    
    // Actions: Only Dropdown
    {
      title: 'Update Status',
      key: 'actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
            {!['RECEIVED', 'CANCELLED'].includes(row.status) ? (
                <div className="relative group">
                    <select
                        className="appearance-none bg-white border border-gray-300 text-gray-700 py-1 pl-2 pr-6 rounded text-xs leading-tight focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
                        value={row.status}
                        onChange={(e) => handleStatusChange(row.id, e.target.value)}
                    >
                        {PO_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-700">
                        <Edit className="w-3 h-3" />
                    </div>
                </div>
            ) : (
                <span className="text-xs text-gray-400">Finalized</span>
            )}
        </div>
      )
    }
  ];

  return <Table columns={columns} data={orders} loading={loading} emptyMessage="No purchase orders found" />;
};