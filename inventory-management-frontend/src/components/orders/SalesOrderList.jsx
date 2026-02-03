import React from 'react';
import { Table } from '../common/Table';
import { clsx } from 'clsx';

export const SalesOrderList = ({ orders, loading }) => {
  const columns = [
    { title: 'Order #', dataIndex: 'orderNumber', key: 'orderNumber' },
    { title: 'Customer', dataIndex: 'customer', key: 'customer', render: c => c?.name || 'Walk-in' },
    { title: 'Date', dataIndex: 'orderDate', key: 'orderDate', render: d => new Date(d).toLocaleDateString() },
    
    // Status Badge
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
          const colors = {
              PENDING: 'bg-yellow-100 text-yellow-800',
              CONFIRMED: 'bg-blue-100 text-blue-800',
              PROCESSING: 'bg-purple-100 text-purple-800',
              SHIPPED: 'bg-indigo-100 text-indigo-800',
              DELIVERED: 'bg-green-100 text-green-800',
              COMPLETED: 'bg-green-100 text-green-800',
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
    
    // Removed Actions Column since View was the only action
    // If you want to keep the column for future actions, uncomment below:
    /*
    {
      title: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex gap-2">
           // Add other buttons here if needed
        </div>
      )
    }
    */
  ];

  return <Table columns={columns} data={orders} loading={loading} emptyMessage="No sales orders found" />;
};