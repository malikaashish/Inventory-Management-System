import React from 'react';

export const Loading = ({ label = 'Loading...' }) => (
  <div className="flex items-center justify-center py-10">
    <div className="flex items-center gap-3 text-gray-600">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      <span className="text-sm">{label}</span>
    </div>
  </div>
);