import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { useAuth } from '../context/AuthContext';
import { MetricsCard } from '../components/dashboard/MetricsCard';
import { LowStockAlert } from '../components/dashboard/LowStockAlert';
import { RecentOrders } from '../components/dashboard/RecentOrders';
import { SalesChart } from '../components/dashboard/SalesChart';
import { SalesPieChart } from '../components/dashboard/SalesPieChart';
import { ProductSalesChart } from '../components/dashboard/ProductSalesChart';
import { UnderPerformingChart } from '../components/dashboard/UnderPerformingChart';
// --- IMPORT NEW COMPONENTS ---
import { ExpiringAlert } from '../components/dashboard/ExpiringAlert';
import { DeadStockAlert } from '../components/dashboard/DeadStockAlert';
import { Package, DollarSign, ShoppingCart, AlertTriangle, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [range, setRange] = useState('year');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', range],
    queryFn: () => dashboardApi.getData(range),
    refetchOnWindowFocus: true, 
    staleTime: 0,
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (isError) return <div className="p-8 text-red-600">Error loading dashboard</div>;

  const dashboardData = data?.data;
  const { 
    inventoryMetrics, 
    salesMetrics, 
    lowStockItems, 
    recentOrders, 
    salesChart, 
    departmentSales,
    productSales,
    underPerformingProducts,
    expiringSoon, // <--- NEW
    deadStock     // <--- NEW
  } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your inventory today.</p>
        </div>
        
        <select 
            value={range} 
            onChange={(e) => setRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last 1 Year</option>
        </select>
      </div>

      {/* 1. METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard title="Total Products" value={inventoryMetrics?.totalProducts || 0} icon={Package} color="blue" />
        <MetricsCard title="Inventory Value" value={formatCurrency(inventoryMetrics?.totalInventoryValue)} icon={IndianRupee} color="green" />
        <MetricsCard title="Orders Today" value={salesMetrics?.totalOrdersToday || 0} icon={ShoppingCart} color="purple" />
        <MetricsCard title="Low Stock Items" value={inventoryMetrics?.lowStockCount || 0} icon={AlertTriangle} color="red" />
      </div>

      {/* 2. MAIN CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><SalesChart data={salesChart || []} range={range} /></div>
        <div className="lg:col-span-1"><SalesPieChart data={departmentSales || []} /></div>
      </div>

      {/* 3. PRODUCT PERFORMANCE ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProductSalesChart data={productSales || []} />
        <UnderPerformingChart data={underPerformingProducts || []} />
      </div>

      {/* 4. INVENTORY HEALTH ROW (NEW ROW) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Expiring Soon */}
        <ExpiringAlert items={expiringSoon || []} />
        
        {/* Right: Dead Stock */}
        <DeadStockAlert items={deadStock || []} />
      </div>

      {/* 5. ORDERS & ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><RecentOrders orders={recentOrders} /></div>
        <div className="lg:col-span-1"><LowStockAlert items={lowStockItems} /></div>
      </div>
    </div>
  );
};