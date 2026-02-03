import React, { useState, useEffect } from 'react';
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

// API
const userApi = {
  getAll: async (page = 0, size = 20) => (await axiosInstance.get('/admin/users', { params: { page, size } })).data,
  create: async (data) => (await axiosInstance.post('/admin/users', data)).data,
  update: async (id, data) => (await axiosInstance.put(`/admin/users/${id}`, data)).data,
  delete: async (id) => (await axiosInstance.delete(`/admin/users/${id}`)).data,
};

// Role Constants
const ROLES = [
  // { id: 1, name: 'ADMIN', label: 'Admin' }, // Single Admin Policy
  { id: 2, name: 'INVENTORY_STAFF', label: 'Inventory Staff' },
  { id: 3, name: 'SALES_EXECUTIVE', label: 'Sales Executive' },
];

export const UsersPage = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', page],
    queryFn: () => userApi.getAll(page, 20),
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => {
      toast.success('User deleted');
      qc.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const openModal = (user = null) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  const users = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;

  const columns = [
    { title: 'Name', key: 'name', render: (_, row) => `${row.firstName} ${row.lastName}` },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Role', 
      key: 'role', 
      render: (_, row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold 
          ${row.role?.name === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
            row.role?.name === 'INVENTORY_STAFF' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
          {row.role?.name?.replace('_', ' ')}
        </span>
      ) 
    },
    { 
      title: 'Department', 
      dataIndex: 'department', 
      key: 'dept', 
      render: (v) => v || '-' 
    },
    { 
      title: 'Status', 
      key: 'status', 
      render: (_, row) => (
        <span className={row.isActive ? 'text-green-600' : 'text-red-600'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ) 
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => openModal(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit User"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { if(window.confirm('Delete user?')) deleteMutation.mutate(row.id) }} 
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            title="Delete User"
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
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system access, roles, and departments</p>
        </div>
        <Button onClick={() => openModal(null)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card padding={false}>
        <Table columns={columns} data={users} loading={isLoading} emptyMessage="No users found" />
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={showModal} onClose={closeModal} title={selectedUser ? 'Edit User' : 'Create New User'} size="lg">
        <UserForm 
          user={selectedUser} 
          onSuccess={() => { closeModal(); qc.invalidateQueries({ queryKey: ['adminUsers'] }); }} 
          onCancel={closeModal} 
        />
      </Modal>
    </div>
  );
};

const UserForm = ({ user, onSuccess, onCancel }) => {
  const isEdit = !!user;
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      roleId: '2', 
      department: '',
      teamSizeLimit: 4,
      password: '',
      confirmPassword: ''
    }
  });

  const roleId = watch('roleId');
  const password = watch('password');

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        roleId: user.role?.id || '',
        department: user.department || '', // Load existing department
        teamSizeLimit: user.teamSizeLimit || 4,
        password: '',
        confirmPassword: ''
      });
    } else {
      reset({
        firstName: '', lastName: '', email: '', phone: '', roleId: '2', department: '', teamSizeLimit: 4, password: '', confirmPassword: ''
      });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? userApi.update(user.id, data) : userApi.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'User updated successfully' : 'User created successfully');
      onSuccess();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Operation failed'),
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      roleId: Number(data.roleId),
      // FIX: Allow department for both Inventory Staff (2) AND Sales Executive (3)
      department: (Number(data.roleId) === 2 || Number(data.roleId) === 3) ? data.department : null,
      teamSizeLimit: Number(data.roleId) === 2 ? Number(data.teamSizeLimit) : null
    };

    if (isEdit && !data.password) {
      delete payload.password;
      delete payload.confirmPassword;
    }

    mutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" {...register('firstName', { required: 'Required' })} error={errors.firstName?.message} />
        <Input label="Last Name" {...register('lastName', { required: 'Required' })} error={errors.lastName?.message} />
      </div>

      <Input label="Email" type="email" {...register('email', { required: 'Required' })} error={errors.email?.message} />
      <Input label="Phone" {...register('phone')} />

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select 
              {...register('roleId', { required: 'Required' })} 
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLES.map(role => <option key={role.id} value={role.id}>{role.label}</option>)}
            </select>
        </div>
        
        {/* Only Inventory Staff gets Team Limit */}
        {String(roleId) === '2' && (
            <div>
                <label className="block text-sm font-medium mb-1">Team Limit</label>
                <input 
                  type="number" 
                  min="1" 
                  {...register('teamSizeLimit')} 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
            </div>
        )}
      </div>

      {/* Show Department Dropdown for Inventory Staff AND Sales Executive */}
      {(String(roleId) === '2' || String(roleId) === '3') && (
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <select 
            {...register('department', { required: 'Please select a department' })} 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Department...</option>
            <option value="Electronics">Electronics</option>
            <option value="FMCG">FMCG</option>
            <option value="Dairy & Groceries">Dairy & Groceries</option>
            <option value="Men & Women Wear">Men & Women Wear</option>
          </select>
          {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
        </div>
      )}

      {/* Password Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <Input 
            label={isEdit ? "New Password (Optional)" : "Password"} 
            type={showPwd ? "text" : "password"} 
            {...register('password', { 
              required: !isEdit && 'Required', 
              minLength: { value: 8, message: 'Min 8 chars' } 
            })} 
            error={errors.password?.message} 
          />
          <button type="button" className="absolute right-3 top-9 text-gray-500" onClick={() => setShowPwd(!showPwd)}>
            {showPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
          </button>
        </div>

        <div className="relative">
          <Input 
            label={isEdit ? "Confirm New Password" : "Confirm Password"} 
            type={showConfirmPwd ? "text" : "password"} 
            {...register('confirmPassword', { 
              required: (!isEdit || password) && 'Please confirm',
              validate: value => !password || value === password || "Passwords do not match"
            })} 
            error={errors.confirmPassword?.message} 
          />
          <button type="button" className="absolute right-3 top-9 text-gray-500" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
            {showConfirmPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button variant="secondary" onClick={onCancel} type="button">Cancel</Button>
        <Button type="submit" loading={mutation.isPending}>
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};