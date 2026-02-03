import React from 'react';
import { NavLink, Link } from 'react-router-dom'; // Import Link
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Truck, Users, BarChart3, Settings } from 'lucide-react';
import { clsx } from 'clsx';

export const Sidebar = () => {
  const { user } = useAuth();
  
  // Normalize role string (backend might send ROLE_ADMIN or ADMIN)
  const role = user?.role ? user.role.replace('ROLE_', '') : '';

  const allNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'INVENTORY_STAFF', 'SALES_EXECUTIVE'] },
    { to: '/products', icon: Package, label: 'Products', roles: ['ADMIN', 'INVENTORY_STAFF', 'SALES_EXECUTIVE'] },
    { to: '/inventory', icon: Package, label: 'Inventory', roles: ['ADMIN', 'INVENTORY_STAFF'] },
    { to: '/sales-orders', icon: ShoppingCart, label: 'Sales Orders', roles: ['ADMIN', 'SALES_EXECUTIVE'] },
    { to: '/purchase-orders', icon: Truck, label: 'Purchase Orders', roles: ['ADMIN', 'INVENTORY_STAFF'] },
    { to: '/suppliers', icon: Truck, label: 'Suppliers', roles: ['ADMIN'] },
    { to: '/customers', icon: Users, label: 'Customers', roles: ['ADMIN', 'SALES_EXECUTIVE'] },
    
    // Admin Only
    { to: '/users', icon: Users, label: 'All Users', roles: ['ADMIN'] },
    
    // Inventory Staff Only (Team Mgmt)
    { to: '/team', icon: Users, label: 'My Sales Team', roles: ['INVENTORY_STAFF'] },
    
    { to: '/reports', icon: BarChart3, label: 'Reports', roles: ['ADMIN', 'INVENTORY_STAFF', 'SALES_EXECUTIVE'] },
    { to: '/settings', icon: Settings, label: 'Settings', roles: ['ADMIN', 'INVENTORY_STAFF', 'SALES_EXECUTIVE'] },
  ];

  const visibleItems = allNavItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col transition-all duration-300">
      {/* Clickable Logo Section */}
      <Link to="/dashboard" className="h-16 flex items-center px-6 border-b border-gray-800 hover:bg-gray-800 transition-colors">
        <span className="text-xl font-bold text-blue-400">InventoryPro</span>
      </Link>
      
      <div className="px-4 py-4">
        <div className="bg-gray-800 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-400 uppercase font-semibold">Current Role</p>
          <p className="text-sm font-medium text-white">{role.replace('_', ' ')}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center px-3 py-2.5 rounded-lg transition-colors',
                isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};