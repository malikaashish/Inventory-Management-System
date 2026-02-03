import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { SalesOrdersPage } from './pages/SalesOrdersPage';
import { SalesOrderFormPage } from './pages/SalesOrderFormPage';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage';
import { PurchaseOrderFormPage } from './pages/PurchaseOrderFormPage'; // <--- IMPORT THIS
import { SuppliersPage } from './pages/SuppliersPage';
import { CustomersPage } from './pages/CustomersPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage'; 
import { TeamPage } from './pages/TeamPage';   
import { AnalyticsPage } from './pages/AnalyticsPage'; 

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              <Route
                path="/inventory"
                element={<ProtectedRoute allowedRoles={['ADMIN', 'INVENTORY_STAFF']}><InventoryPage /></ProtectedRoute>}
              />
              <Route
                path="/purchase-orders"
                element={<ProtectedRoute allowedRoles={['ADMIN', 'INVENTORY_STAFF']}><PurchaseOrdersPage /></ProtectedRoute>}
              />
              
              {/* --- NEW ROUTE ADDED HERE --- */}
              <Route
                path="/purchase-orders/new"
                element={<ProtectedRoute allowedRoles={['ADMIN', 'INVENTORY_STAFF']}><PurchaseOrderFormPage /></ProtectedRoute>}
              />
              {/* --------------------------- */}

              <Route
                path="/sales-orders"
                element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES_EXECUTIVE']}><SalesOrdersPage /></ProtectedRoute>}
              />
              <Route
                path="/sales-orders/new"
                element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES_EXECUTIVE']}><SalesOrderFormPage /></ProtectedRoute>}
              />
              <Route
                path="/customers"
                element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES_EXECUTIVE']}><CustomersPage /></ProtectedRoute>}
              />
              
              {/* Admin Only Routes */}
              <Route
                path="/suppliers"
                element={<ProtectedRoute allowedRoles={['ADMIN']}><SuppliersPage /></ProtectedRoute>}
              />
              <Route
                path="/users"
                element={<ProtectedRoute allowedRoles={['ADMIN']}><UsersPage /></ProtectedRoute>}
              />
              <Route
                path="/analytics"
                element={<ProtectedRoute allowedRoles={['ADMIN']}><AnalyticsPage /></ProtectedRoute>}
              />

              {/* Staff Team Management */}
              <Route 
                path="/team"
                element={<ProtectedRoute allowedRoles={['INVENTORY_STAFF']}><TeamPage /></ProtectedRoute>}
              />

            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="top-right" autoClose={5000} theme="light" />
      </AuthProvider>
    </QueryClientProvider>
  );
}