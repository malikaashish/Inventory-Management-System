import React from 'react';
import { clsx } from 'clsx';

export const Button = ({ children, variant = 'primary', className, loading, ...props }) => {
  return (
    <button
      className={clsx(
        variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-danger',
        loading && 'opacity-70 cursor-not-allowed',
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};