import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { reportApi } from '../api/dashboardApi';
import { Card } from '../components/common/Card';
import { Table } from '../components/common/Table';
import { subDays } from 'date-fns';
import { clsx } from 'clsx';
import { formatCurrency } from '../utils/helpers';

export const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState('inventory'); // inventory | lowStock | sales | expired
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30).toISOString(),
    endDate: new Date().toISOString(),
  });

  const inventoryQ = useQuery({
    queryKey: ['inventoryReport'],
    queryFn: () => reportApi.getInventoryReport(),
    enabled: activeReport === 'inventory',
  });

  const lowStockQ = useQuery({
    queryKey: ['lowStockReport'],
    queryFn: () => reportApi.getLowStockReport(),
    enabled: activeReport === 'lowStock',
  });

  const expiredQ = useQuery({
    queryKey: ['expiredStock'],
    queryFn: async () => (await axiosInstance.get('/products/expired')).data,
    enabled: activeReport === 'expired',
  });

  const salesQ = useQuery({
    queryKey: ['salesReport', dateRange.startDate, dateRange.endDate],
    queryFn: () => reportApi.getSalesReport(dateRange.startDate, dateRange.endDate),
    enabled: activeReport === 'sales',
  });

  const renderInventory = () => {
    const data = inventoryQ.data?.data;
    if (!data) return null;

    const columns = [
      { title: 'SKU', dataIndex: 'sku', key: 'sku' },
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Category', dataIndex: 'category', key: 'category' },
      { title: 'Qty', dataIndex: 'quantityOnHand', key: 'qty' },
      { title: 'Total Value', dataIndex: 'totalValue', key: 'value', render: (v) => formatCurrency(v) },
    ];

    return (
      <Card title="Inventory Report" padding={false}>
        <div className="p-4 border-b flex justify-between bg-gray-50">
            <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="font-bold">{data.totalQuantity}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="font-bold">{formatCurrency(data.totalValue)}</p>
            </div>
        </div>
        <Table columns={columns} data={data.items || []} loading={inventoryQ.isLoading} emptyMessage="No items" />
      </Card>
    );
  };

  const renderLowStock = () => {
    const data = lowStockQ.data?.data;
    if (!data) return null;

    const columns = [
      { title: 'SKU', dataIndex: 'sku', key: 'sku' },
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Current', dataIndex: 'currentStock', key: 'current', render: v => <span className="text-red-600 font-bold">{v}</span> },
      { title: 'Reorder', dataIndex: 'reorderPoint', key: 'rp' },
      { title: 'Shortfall', dataIndex: 'shortfall', key: 'sf' },
    ];

    return (
      <Card title="Low Stock Report" padding={false}>
        <Table columns={columns} data={data.items || []} loading={lowStockQ.isLoading} emptyMessage="No low stock items" />
      </Card>
    );
  };

  const renderExpired = () => {
    const data = expiredQ.data?.data || [];
    if (!data) return null;

    const columns = [
      { title: 'SKU', dataIndex: 'sku', key: 'sku' },
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { 
        title: 'Expiry Date', 
        dataIndex: 'expiryDate', 
        key: 'exp', 
        render: d => <span className="text-red-600 font-bold">{d}</span> 
      },
      { title: 'Stock', dataIndex: 'quantityOnHand', key: 'qty' },
      { title: 'Location', dataIndex: 'location', key: 'loc', render: v => v || '-' },
    ];

    return (
      <Card title="Expired Inventory" padding={false}>
        <div className="p-4 bg-red-50 text-red-700 text-sm">
          These items are expired and cannot be sold. Please remove from shelves.
        </div>
        <Table columns={columns} data={data} loading={expiredQ.isLoading} emptyMessage="No expired items found" />
      </Card>
    );
  };

  const renderSales = () => {
    const data = salesQ.data?.data;
    if (!data) return null;

    const columns = [
      { title: 'Date', dataIndex: 'date', key: 'date' },
      { title: 'Orders', dataIndex: 'orderCount', key: 'orderCount' },
      { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', render: (v) => formatCurrency(v) },
    ];

    return (
      <div className="space-y-4">
        <Card>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate.split('T')[0]}
                onChange={(e) => setDateRange((d) => ({ ...d, startDate: new Date(e.target.value).toISOString() }))}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.endDate.split('T')[0]}
                onChange={(e) => setDateRange((d) => ({ ...d, endDate: new Date(e.target.value).toISOString() }))}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </Card>

        <Card title="Sales Report" padding={false}>
          <div className="p-4 border-b flex justify-between bg-gray-50">
            <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="font-bold">{data.totalOrders}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="font-bold">{formatCurrency(data.totalRevenue)}</p>
            </div>
          </div>
          <Table columns={columns} data={data.dailySales || []} loading={salesQ.isLoading} emptyMessage="No sales data" />
        </Card>
      </div>
    );
  };

  const ReportTab = ({ id, label }) => (
    <button 
        className={clsx(
            "px-4 py-2 rounded-lg border font-medium transition-colors",
            activeReport === id 
                ? "bg-blue-600 text-white border-blue-600" 
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
        )}
        onClick={() => setActiveReport(id)}
    >
        {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-gray-600 mt-1">Generate inventory and sales reports</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <ReportTab id="inventory" label="Inventory" />
        <ReportTab id="lowStock" label="Low Stock" />
        <ReportTab id="expired" label="Expired Stock" />
        <ReportTab id="sales" label="Sales" />
      </div>

      {activeReport === 'inventory' && renderInventory()}
      {activeReport === 'lowStock' && renderLowStock()}
      {activeReport === 'expired' && renderExpired()}
      {activeReport === 'sales' && renderSales()}
    </div>
  );
};