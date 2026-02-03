import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const SupplierForm = ({ onSubmit, initialData, loading, onCancel }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initialData || { name: '', email: '', phone: '', contactPerson: '' }
  });

  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Name *" {...register('name', { required: 'Required' })} error={errors.name?.message} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Contact Person" {...register('contactPerson')} />
        <Input label="Phone" {...register('phone')} />
      </div>
      <Input label="Email" type="email" {...register('email')} />
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>Save</Button>
      </div>
    </form>
  );
};