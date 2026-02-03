import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { Card } from '../components/common/Card';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const customerApi = {
  getAll: async (page = 0, size = 20) => (await axiosInstance.get('/customers', { params: { page, size } })).data,
  create: async (payload) => (await axiosInstance.post('/customers', payload)).data,
  update: async (id, payload) => (await axiosInstance.put(`/customers/${id}`, payload)).data,
  delete: async (id) => (await axiosInstance.delete(`/customers/${id}`)).data,
};

export const CustomersPage = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page],
    queryFn: () => customerApi.getAll(page, 20),
    keepPreviousData: true,
  });

  const { register, handleSubmit, reset } = useForm();

  const createMutation = useMutation({
    mutationFn: (payload) => customerApi.create(payload),
    onSuccess: () => {
      toast.success('Customer created');
      qc.invalidateQueries({ queryKey: ['customers'] });
      setShowModal(false);
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to create customer'),
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => customerApi.update(selected.id, payload),
    onSuccess: () => {
      toast.success('Customer updated');
      qc.invalidateQueries({ queryKey: ['customers'] });
      setShowModal(false);
      setSelected(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to update customer'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => customerApi.delete(id),
    onSuccess: () => {
      toast.success('Customer deleted');
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to delete customer'),
  });

  const customers = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;

  const openModal = (c = null) => {
    setSelected(c);
    reset(
      c || {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      }
    );
    setShowModal(true);
  };

  const onSubmit = (form) => {
    const payload = {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      country: form.country || null,
      postalCode: form.postalCode || null,
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
          <button
            className="p-1.5 hover:bg-red-50 text-red-600 rounded"
            onClick={() => deleteMutation.mutate(row.id)}
          >
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
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customers</p>
        </div>
        <Button onClick={() => openModal(null)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Card padding={false}>
        <Table columns={columns} data={customers} loading={isLoading} emptyMessage="No customers found" />

        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelected(null);
        }}
        title={selected ? 'Edit Customer' : 'Add Customer'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name *" {...register('name')} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Email" type="email" {...register('email')} />
            <Input label="Phone" {...register('phone')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea className="w-full px-3 py-2 border rounded-lg" rows={2} {...register('address')} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="City" {...register('city')} />
            <Input label="State" {...register('state')} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Country" {...register('country')} />
            <Input label="Postal Code" {...register('postalCode')} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {selected ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};