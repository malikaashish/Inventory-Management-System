import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-500">
      <p>&copy; {new Date().getFullYear()} InventoryPro. All rights reserved.</p>
    </footer>
  );
};