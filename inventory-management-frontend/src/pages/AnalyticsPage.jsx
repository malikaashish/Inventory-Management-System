import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios'; // Direct call since we didn't add to dashboardApi yet
import { Card } from '../components/common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrency } from '../utils/helpers';

const api = {
  getAnalytics: async (year) => (await axiosInstance.get('/analytics', { params: { year } })).data,
};

export const AnalyticsPage = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', year],
    queryFn: () => api.getAnalytics(year),
  });

  const stats = data?.data || {};
  const monthlySales = stats.monthlySales || [];
  const stockClearance = stats.stockClearance || [];
  const supplierPerf = stats.supplierPerformance || [];

  // Merge sales and clearance for the combo chart
  const mergedData = monthlySales.map(sale => {
    const clearance = stockClearance.find(c => c.month === sale.month);
    return {
      month: sale.month.substring(0, 3), // JAN, FEB
      revenue: sale.revenue,
      units: clearance ? clearance.unitsSold : 0
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
          <p className="text-gray-600 mt-1">Deep dive into sales trends and supply chain performance.</p>
        </div>
        <select 
          value={year} 
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
      </div>

      {isLoading ? (
        <div className="p-8 text-center">Loading Analytics...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sales & Stock Clearance Chart */}
          <Card title={`Sales & Stock Clearance (${year})`} className="col-span-2">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mergedData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                  <Tooltip formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : value, name]} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="units" name="Units Sold" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Supplier Lead Time */}
          <Card title="Supplier Lead Time (Avg Days)">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierPerf} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="supplier" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="avgDays" name="Avg Days to Receive" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              * Time taken from "Order Placed" to "Stock Received"
            </p>
          </Card>

          {/* Monthly Trend Line */}
          <Card title="Revenue Trend">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mergedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>
      )}
    </div>
  );
};