import React from 'react';
import { Button } from './Button';

export const Pagination = ({ page, totalPages, onPrev, onNext }) => {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
      <p className="text-sm text-gray-500">
        Page {page + 1} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page === 0} onClick={onPrev}>
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
};