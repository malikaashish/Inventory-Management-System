import React from 'react';
import { Table } from '../common/Table';
import { Edit, Trash2 } from 'lucide-react';

export const SupplierList = ({ suppliers, onEdit, onDelete, loading }) => {
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Contact', dataIndex: 'contactPerson', key: 'contact' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => onEdit(row)} className="p-1 text-gray-600 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
          <button onClick={() => onDelete(row.id)} className="p-1 text-gray-600 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  return <Table columns={columns} data={suppliers} loading={loading} emptyMessage="No suppliers found" />;
};