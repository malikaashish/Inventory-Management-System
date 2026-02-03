import React from 'react';
import { Card } from '../common/Card';
import { AlertTriangle } from 'lucide-react';

export const LowStockAlert = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <Card title="Low Stock Alerts">
      <div className="space-y-3">
        {items.slice(0, 5).map((item) => (
          <div key={item.productId} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-xs text-red-600">SKU: {item.sku}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-red-700">{item.currentStock} left</p>
              <p className="text-xs text-gray-500">Reorder: {item.reorderPoint}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};