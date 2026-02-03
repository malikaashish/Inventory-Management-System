import React from 'react';
import { Card } from '../common/Card';
import { Archive } from 'lucide-react';

export const DeadStockAlert = ({ items = [] }) => {
  return (
    <Card title="Dead Stock (No Sales > 30 Days)" className="h-full">
      {!items.length ? (
        <div className="p-4 text-center text-gray-500 text-sm">Inventory is moving fast!</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full border border-gray-200">
                    <Archive className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-700">{item.currentStock}</p>
                <p className="text-xs text-gray-500">In Stock</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};