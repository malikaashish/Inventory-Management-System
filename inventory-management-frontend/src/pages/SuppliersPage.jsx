import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supplierApi } from '../api/supplierApi';
import { Card } from '../components/common/Card';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export const SuppliersPage = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', page],
    queryFn: () => supplierApi.getAll(page, 20),
    keepPreviousData: true,
  });

  const { register, handleSubmit, reset } = useForm();

  const createMutation = useMutation({
    mutationFn: (payload) => supplierApi.create(payload),
    onSuccess: () => {
      toast.success('Supplier created');
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      setShowModal(false);
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to create supplier'),
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => supplierApi.update(selected.id, payload),
    onSuccess: () => {
      toast.success('Supplier updated');
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      setShowModal(false);
      setSelected(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to update supplier'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => supplierApi.delete(id),
    onSuccess: () => {
      toast.success('Supplier deleted');
      qc.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to delete supplier'),
  });

  const suppliers = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;

  const openModal = (s = null) => {
    setSelected(s);
    reset(s || { name: '', email: '', phone: '', contactPerson: '' });
    setShowModal(true);
  };

  const onSubmit = (form) => {
    const payload = {
      name: form.name,
      contactPerson: form.contactPerson || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      country: form.country || null,
      postalCode: form.postalCode || null,
      website: form.website || null,
      notes: form.notes || null,
    };
    if (selected) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (v) => v || '-' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (v) => v || '-' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => openModal(row)}>
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-red-50 text-red-600 rounded" onClick={() => deleteMutation.mutate(row.id)}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage suppliers</p>
        </div>
        <Button onClick={() => openModal(null)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <Card padding={false}>
        <Table columns={columns} data={suppliers} loading={isLoading} emptyMessage="No suppliers found" />
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selected ? 'Edit Supplier' : 'Add Supplier'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name *" {...register('name')} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Contact Person" {...register('contactPerson')} />
            <Input label="Email" type="email" {...register('email')} />
          </div>
          <Input label="Phone" {...register('phone')} />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {selected ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};