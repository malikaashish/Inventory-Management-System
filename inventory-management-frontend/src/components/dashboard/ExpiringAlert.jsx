import React from 'react';
import { Card } from '../common/Card';
import { CalendarClock } from 'lucide-react';

export const ExpiringAlert = ({ items = [] }) => {
  return (
    <Card title="Expiring Soon (Next 30 Days)" className="h-full">
      {!items.length ? (
        <div className="p-4 text-center text-gray-500 text-sm">No items expiring soon.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full border border-orange-100">
                    <CalendarClock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                  <p className="text-xs text-orange-700">Expires: {item.expiryDate}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold px-2 py-1 bg-white rounded border border-orange-200 text-orange-800">
                  {item.daysRemaining} days left
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};