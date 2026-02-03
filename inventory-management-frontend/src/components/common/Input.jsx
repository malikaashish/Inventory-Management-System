import React, { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, ...props }, ref) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input ref={ref} className={`input ₹{error ? 'input-error' : ''}`} {...props} />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
));