import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Info } from 'lucide-react'; // Import icons

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { 
    register, 
    handleSubmit, 
    watch, 
    formState: { errors, isSubmitting } 
  } = useForm();

  // Watch password to validate confirm password
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      // Default to Role ID 3 (SALES_EXECUTIVE)
      const res = await registerUser({ 
        ...data, 
        roleId: 3 
      }); 

      if (res.success) {
        toast.success('Registration successful! Please log in.');
        navigate('/login');
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (e) {
      toast.error('Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        
        <h1 className="text-2xl font-bold text-center">Create Account</h1>
        
        {/* Default Message Banner */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            Note: This public registration page is for <strong>Sales Executives</strong> only. 
            Admins and Inventory Staff must be added by a System Administrator.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" {...register('firstName', { required: 'Required' })} error={errors.firstName?.message} />
            <Input label="Last Name" {...register('lastName', { required: 'Required' })} error={errors.lastName?.message} />
          </div>
          
          <Input label="Email" type="email" {...register('email', { required: 'Required' })} error={errors.email?.message} />
          <Input label="Phone" {...register('phone')} />
          
          {/* Password Field with Eye Toggle */}
          <div className="relative">
            <Input 
              label="Password" 
              type={showPassword ? "text" : "password"} 
              {...register('password', { 
                required: 'Required', 
                minLength: { value: 8, message: 'Min 8 chars' } 
              })} 
              error={errors.password?.message} 
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Confirm Password Field with Eye Toggle */}
          <div className="relative">
            <Input 
              label="Confirm Password" 
              type={showConfirmPassword ? "text" : "password"} 
              {...register('confirmPassword', { 
                required: 'Please confirm password',
                validate: value => value === password || "Passwords do not match"
              })} 
              error={errors.confirmPassword?.message} 
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <Button type="submit" className="w-full" loading={isSubmitting}>Sign Up</Button>
        </form>
        
        <p className="text-center text-sm">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};