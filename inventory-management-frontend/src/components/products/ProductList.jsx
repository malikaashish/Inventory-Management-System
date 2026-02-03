import React from 'react';
import { Table } from '../common/Table';
import { Edit, Trash2, Bot } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export const ProductList = ({ products, onEdit, onDelete, isAdmin, loading }) => {
  const columns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    
    // Barcode Column
    { 
      title: 'Barcode', 
      dataIndex: 'barcode', 
      key: 'barcode', 
      render: v => <span className="font-mono text-xs text-gray-600">{v || '-'}</span> 
    },
    
    { 
      title: 'Auto', 
      key: 'auto',
      render: (_, row) => (
        row.autoReorderEnabled ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800" title="Auto-Reorder Active">
            <Bot className="w-3 h-3 mr-1" /> On
          </span>
        ) : (
          <span className="text-xs text-gray-400">Off</span>
        )
      )
    },
    { title: 'Category', dataIndex: 'categoryName', key: 'category', render: v => v || '-' },
    
    // Expiry Date Column
    { 
      title: 'Expiry', 
      dataIndex: 'expiryDate', 
      key: 'expiry', 
      render: (date, row) => {
        if (!date) return <span className="text-gray-400">-</span>;
        return (
          <span className={row.isExpired ? 'text-red-600 font-bold' : 'text-gray-700'}>
            {date}
          </span>
        );
      }
    },

    { title: 'Price', dataIndex: 'unitPrice', key: 'price', render: v => formatCurrency(v) },
    { 
      title: 'Stock', 
      dataIndex: 'quantityOnHand', 
      key: 'stock', 
      render: (v, row) => (
        <span className={row.isLowStock ? 'text-red-600 font-bold' : 'text-green-600'}>
          {v}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(row)} 
            className="p-1 text-gray-600 hover:text-blue-600 rounded hover:bg-blue-50"
            title="Edit Product"
          >
            <Edit className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button 
              onClick={() => onDelete(row.id)} 
              className="p-1 text-gray-600 hover:text-red-600 rounded hover:bg-red-50"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return <Table columns={columns} data={products} loading={loading} emptyMessage="No products found" />;
};