import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Fetch Roles for Dropdown
  const { data: rolesData } = useQuery({
    queryKey: ['publicRoles'],
    queryFn: async () => (await axiosInstance.get('/public/roles')).data
  });

  const roles = rolesData?.data || [];

  const onSubmit = async (data) => {
    try {
      const res = await login({ 
        email: data.email, 
        password: data.password, 
        role: data.roleName 
      });
      
      if (res.success) {
        navigate('/dashboard');
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Invalid credentials';
      toast.error(msg, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Role Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Login As</label>
            <select 
              {...register('roleName', { required: 'Please select your role' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Role...</option>
              {roles.length > 0 ? (
                roles.map(role => (
                  <option key={role.id} value={role.name}>
                    {role.name.replace('_', ' ')}
                  </option>
                ))
              ) : (
                <>
                  <option value="ADMIN">Admin</option>
                  <option value="INVENTORY_STAFF">Inventory Staff</option>
                  <option value="SALES_EXECUTIVE">Sales Executive</option>
                </>
              )}
            </select>
            {errors.roleName && <p className="text-red-500 text-xs mt-1">{errors.roleName.message}</p>}
          </div>

          <Input label="Email" {...register('email', { required: 'Required' })} error={errors.email?.message} />
          
          {/* Password Field with Eye Toggle */}
          <div className="relative">
            <Input 
              label="Password" 
              type={showPassword ? "text" : "password"} 
              {...register('password', { required: 'Required' })} 
              error={errors.password?.message} 
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
              // Prevent form submission on click
              onMouseDown={(e) => e.preventDefault()}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <Button type="submit" className="w-full" loading={isSubmitting}>Sign In</Button>
        </form>
        <p className="text-center text-sm">
          No account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};