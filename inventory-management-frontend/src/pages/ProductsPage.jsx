import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ProductForm } from '../components/products/ProductForm';
import { ProductList } from '../components/products/ProductList';
import { Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export const ProductsPage = () => {
  // 1. Extract isInventoryStaff
  const { isAdmin, isInventoryStaff } = useAuth(); 
  const qc = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, pageSize, search],
    queryFn: () => search 
      ? productApi.search(search, page, pageSize) 
      : productApi.getAll(page, pageSize),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      toast.success('Deleted');
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const products = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;
  const totalElements = data?.data?.totalElements || 0;

  // Helper to determine if user can edit
  const canEdit = isAdmin || isInventoryStaff;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        
        {/* 2. UPDATE CONDITION: Show button for Staff too */}
        {(isAdmin || isInventoryStaff) && (
          <Button onClick={() => { setSelected(null); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      <Card>
        <div className="flex justify-between items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-3 py-2 border rounded-lg"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </div>
          
          <select 
            value={pageSize} 
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </Card>

      <Card padding={false}>
        <ProductList 
            products={products} 
            loading={isLoading} 
            isAdmin={isAdmin}
            // Staff can edit, but only Admin can delete
            onEdit={(row) => { 
                if (canEdit) {
                    setSelected(row); 
                    setShowModal(true); 
                }
            }}
            onDelete={(id) => { 
                if(isAdmin && window.confirm('Delete product?')) {
                    deleteMutation.mutate(id); 
                }
            }}
        />
        
        <div className="flex justify-between items-center px-6 py-4 border-t">
            <span className="text-sm text-gray-500">
                Showing {products.length} of {totalElements} results (Page {page + 1} of {totalPages})
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
        </div>
      </Card>

      <Modal 
        isOpen={showModal} 
        onClose={() => { setShowModal(false); setSelected(null); }} 
        title={selected ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <ProductForm
          product={selected}
          onSuccess={() => {
            setShowModal(false);
            setSelected(null);
            qc.invalidateQueries({ queryKey: ['products'] });
          }}
          onCancel={() => { setShowModal(false); setSelected(null); }}
        />
      </Modal>
    </div>
  );
};