import React from 'react';
import { Card } from '../common/Card';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/helpers';

export const RecentOrders = ({ orders = [] }) => {
  return (
    <Card title="Recent Orders">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-500 bg-gray-50">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.orderId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                <td className="px-4 py-3">{order.customerName}</td>
                <td className="px-4 py-3">{formatCurrency(order.totalAmount)}</td>
                <td className="px-4 py-3">{order.status}</td>
                <td className="px-4 py-3">{order.orderDate ? format(new Date(order.orderDate), 'MMM d, yyyy') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};