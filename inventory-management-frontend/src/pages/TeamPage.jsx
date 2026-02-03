import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { Card } from '../components/common/Card';
import { Table } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Plus, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const staffApi = {
  getTeam: async () => (await axiosInstance.get('/staff/team')).data,
  addMember: async (data) => (await axiosInstance.post('/staff/team', data)).data,
  updateMember: async (id, data) => (await axiosInstance.put(`/staff/team/${id}`, data)).data,
  deleteMember: async (id) => (await axiosInstance.delete(`/staff/team/${id}`)).data,
};

export const TeamPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['myTeam'],
    queryFn: staffApi.getTeam,
  });

  const deleteMutation = useMutation({
    mutationFn: staffApi.deleteMember,
    onSuccess: () => {
      toast.success('Member removed');
      qc.invalidateQueries({ queryKey: ['myTeam'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to remove member'),
  });

  const members = data?.data || [];
  const limit = user?.teamSizeLimit || 4;
  const activeCount = members.filter(m => m.isActive).length;
  const canAdd = activeCount < limit;

  const openModal = (m = null) => {
    setSelectedMember(m);
    setShowModal(true);
  };

  const columns = [
    { title: 'Name', key: 'name', render: (_, r) => `${r.firstName} ${r.lastName}` },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { 
      title: 'Status', 
      key: 'status', 
      render: (_, r) => <span className={r.isActive ? 'text-green-600' : 'text-red-600'}>{r.isActive ? 'Active' : 'Inactive'}</span> 
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => (
        <div className="flex gap-2">
          <button onClick={() => openModal(r)} className="p-1 hover:bg-blue-50 text-blue-600 rounded">
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { if(window.confirm('Remove member?')) deleteMutation.mutate(r.id) }} 
            className="p-1 hover:bg-red-50 text-red-600 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Sales Team</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-gray-600">Dept: <span className="font-semibold text-blue-600">{user?.department || 'Unassigned'}</span></p>
            <span className={`text-xs px-2 py-1 rounded-full ${canAdd ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              Capacity: {activeCount} / {limit}
            </span>
          </div>
        </div>
        <Button onClick={() => openModal(null)} disabled={!canAdd && !selectedMember}>
          <Plus className="w-4 h-4 mr-2" /> Add Sales Executive
        </Button>
      </div>

      <Card padding={false}>
        <Table columns={columns} data={members} loading={isLoading} emptyMessage="No team members yet." />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedMember ? 'Edit Member' : 'Add Sales Executive'}>
        <MemberForm 
            member={selectedMember} 
            onSuccess={() => { setShowModal(false); qc.invalidateQueries({ queryKey: ['myTeam'] }); }} 
            onCancel={() => setShowModal(false)} 
        />
      </Modal>
    </div>
  );
};

const MemberForm = ({ member, onSuccess, onCancel }) => {
  const isEdit = !!member;
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: member ? { ...member, password: '', confirmPassword: '' } : {}
  });

  const password = watch('password');

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? staffApi.updateMember(member.id, data) : staffApi.addMember(data),
    onSuccess: () => { toast.success('Saved successfully'); onSuccess(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Operation failed'),
  });

  const onSubmit = (data) => {
    // Remove confirmPassword before sending to API
    const payload = { ...data, roleId: 0 };
    delete payload.confirmPassword;
    mutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" {...register('firstName', { required: 'Required' })} error={errors.firstName?.message} />
        <Input label="Last Name" {...register('lastName', { required: 'Required' })} error={errors.lastName?.message} />
      </div>
      
      <Input label="Email" type="email" disabled={isEdit} {...register('email', { required: 'Required' })} error={errors.email?.message} />
      <Input label="Phone" {...register('phone')} />
      
      {!isEdit && (
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <Input 
              label="Password" 
              type={showPwd ? "text" : "password"} 
              {...register('password', { required: 'Required', minLength: { value: 8, message: "Min 8 chars" } })} 
              error={errors.password?.message}
            />
            <button type="button" className="absolute right-3 top-9 text-gray-500" onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
            </button>
          </div>

          <div className="relative">
            <Input 
              label="Confirm Password" 
              type={showConfirmPwd ? "text" : "password"} 
              {...register('confirmPassword', { 
                required: 'Please confirm', 
                validate: val => !password || val === password || "Passwords do not match" 
              })} 
              error={errors.confirmPassword?.message}
            />
            <button type="button" className="absolute right-3 top-9 text-gray-500" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
              {showConfirmPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
            </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button variant="secondary" onClick={onCancel} type="button">Cancel</Button>
        <Button type="submit" loading={mutation.isPending}>{isEdit ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};