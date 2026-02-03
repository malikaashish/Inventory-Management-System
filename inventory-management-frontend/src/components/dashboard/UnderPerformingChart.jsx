import React from 'react';
import { Card } from '../common/Card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Warm/Danger colors for "Slow Moving" items
const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16'];

export const UnderPerformingChart = ({ data }) => {
  return (
    <Card title="Under-Performing Products (Least Sold)" className="h-full">
      <div className="h-72 w-full">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="totalSold"
                nameKey="productName"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} units`, 'Sold']} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            No sales data available
          </div>
        )}
      </div>
    </Card>
  );
};