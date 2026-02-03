import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Save, Bot, Shield, User, Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../api/axios';
import { useMutation } from '@tanstack/react-query';

const api = {
  updateProfile: async (data) => (await axiosInstance.put('/profile', data)).data,
  changePassword: async (data) => (await axiosInstance.post('/auth/change-password', data)).data,
  runBot: async () => (await axiosInstance.post('/inventory/bot/trigger')).data,
};

export const SettingsPage = () => {
  const { user, isAdmin, logout } = useAuth(); // Get logout
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // --- Profile Form ---
  const { register, handleSubmit } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '', // Email is now editable
      phone: user?.phone || '',
    }
  });

  const profileMutation = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: (_, variables) => {
        // Check if email was changed
        if (variables.email !== user.email) {
            toast.success('Email updated. Please log in again.');
            logout(); // Force logout
        } else {
            toast.success('Profile updated successfully');
        }
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to update profile'),
  });

  const onProfileSubmit = (data) => {
    profileMutation.mutate(data);
  };

  // --- Bot Trigger ---
  const botMutation = useMutation({
    mutationFn: api.runBot,
    onSuccess: () => toast.success('Bot scan completed successfully'),
    onError: () => toast.error('Failed to run bot'),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and system preferences</p>
      </div>
      
      <Card title="Profile Information" actions={<User className="w-5 h-5 text-gray-400" />}>
        <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="First Name" {...register('firstName')} />
            <Input label="Last Name" {...register('lastName')} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Enabled Email Input */}
            <Input 
                label="Email (User ID)" 
                {...register('email', { required: 'Required' })} 
            />
            <Input label="Phone" {...register('phone')} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={profileMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Security" actions={<Shield className="w-5 h-5 text-gray-400" />}>
        <div className="flex justify-between items-center p-2">
          <div>
            <p className="font-medium text-gray-900">Password</p>
            <p className="text-sm text-gray-500">Secure your account with a strong password.</p>
          </div>
          <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
            Change Password
          </Button>
        </div>
      </Card>

      {isAdmin && (
        <Card title="System Automation" actions={<Bot className="w-5 h-5 text-blue-500" />}>
          <div className="flex justify-between items-center p-2">
            <div>
              <p className="font-medium text-gray-900">Inventory Reorder Bot</p>
              <p className="text-sm text-gray-500 max-w-md">
                Manually trigger the low-stock scanner. Checks all products with "Auto-Reorder" enabled.
              </p>
            </div>
            <Button onClick={() => botMutation.mutate()} loading={botMutation.isPending} variant="secondary">
              Run Now
            </Button>
          </div>
        </Card>
      )}

      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password" size="md">
        <ChangePasswordForm 
            onSuccess={() => {
                setShowPasswordModal(false);
                logout(); // Logout after password change
            }} 
            onCancel={() => setShowPasswordModal(false)} 
        />
      </Modal>
    </div>
  );
};

// ... ChangePasswordForm sub-component (Same as before) ...
const ChangePasswordForm = ({ onSuccess, onCancel }) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  
  const newPassword = watch('newPassword');

  const passwordMutation = useMutation({
    mutationFn: api.changePassword,
    onSuccess: () => {
      toast.success('Password changed. Please log in again.');
      reset();
      onSuccess();
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to change password'),
  });

  const onSubmit = (data) => {
    passwordMutation.mutate(data);
  };

  // Helper for consistent password fields
  const PasswordField = ({ label, name, show, toggle, validation = {} }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 ${
            errors[name] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          {...register(name, validation)}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={toggle}
          onMouseDown={(e) => e.preventDefault()} 
          tabIndex={-1} 
        >
          {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
        </button>
      </div>
      {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
      <PasswordField 
        label="Current Password" 
        name="currentPassword" 
        show={showCurrent} 
        toggle={() => setShowCurrent(!showCurrent)}
        validation={{ required: 'Required' }}
      />

      <PasswordField 
        label="New Password" 
        name="newPassword" 
        show={showNew} 
        toggle={() => setShowNew(!showNew)}
        validation={{ 
          required: 'Required', 
          minLength: { value: 8, message: 'Min 8 chars' } 
        }}
      />

      <PasswordField 
        label="Confirm New Password" 
        name="confirmPassword" 
        show={showConfirm} 
        toggle={() => setShowConfirm(!showConfirm)}
        validation={{ 
          required: 'Required', 
          validate: val => val === newPassword || "Passwords do not match" 
        }}
      />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="secondary" onClick={onCancel} type="button">Cancel</Button>
        <Button type="submit" loading={passwordMutation.isPending}>Update Password</Button>
      </div>
    </form>
  );
};