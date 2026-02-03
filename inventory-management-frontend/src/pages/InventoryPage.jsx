import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { Card } from '../components/common/Card';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { StockAdjustment } from '../components/products/StockAdjustment';

export const InventoryPage = () => {
  const [filter, setFilter] = useState('all'); // all | low | out
  const [selected, setSelected] = useState(null);
  const [showAdjust, setShowAdjust] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['productsInventory'],
    queryFn: () => productApi.getAll(0, 200),
  });

  const products = data?.data?.content || [];

  const filtered = useMemo(() => {
    if (filter === 'low') return products.filter((p) => p.isLowStock);
    if (filter === 'out') return products.filter((p) => Number(p.quantityOnHand) === 0);
    return products;
  }, [products, filter]);

  const columns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Stock', dataIndex: 'quantityOnHand', key: 'stock' },
    { title: 'Reorder Point', dataIndex: 'reorderPoint', key: 'rp' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelected(row);
            setShowAdjust(true);
          }}
        >
          Adjust
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-gray-600 mt-1">Monitor and adjust stock</p>
      </div>

      <Card>
        <div className="flex gap-2">
          <Button variant={filter === 'all' ? 'primary' : 'secondary'} onClick={() => setFilter('all')}>All</Button>
          <Button variant={filter === 'low' ? 'primary' : 'secondary'} onClick={() => setFilter('low')}>Low Stock</Button>
          <Button variant={filter === 'out' ? 'primary' : 'secondary'} onClick={() => setFilter('out')}>Out of Stock</Button>
        </div>
      </Card>

      <Card padding={false}>
        <Table columns={columns} data={filtered} loading={isLoading} emptyMessage="No products found" />
      </Card>

      <Modal isOpen={showAdjust} onClose={() => setShowAdjust(false)} title="Adjust Stock" size="md">
        {selected && (
          <StockAdjustment
            product={selected}
            onSuccess={() => {
              setShowAdjust(false);
              setSelected(null);
              refetch();
            }}
            onCancel={() => setShowAdjust(false)}
          />
        )}
      </Modal>
    </div>
  );
};