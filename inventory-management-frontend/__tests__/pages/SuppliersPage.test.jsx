import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import axiosInstance from '../../src/api/axios';
import { SuppliersPage } from '../../src/pages/SuppliersPage';

jest.mock('../../src/api/axios');
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

function wrap(ui) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

test('SuppliersPage renders and shows empty table state', async () => {
  axiosInstance.get.mockResolvedValueOnce({
    data: { success: true, data: { content: [], totalPages: 0 } },
  });

  render(wrap(<SuppliersPage />));

  expect(screen.getByText('Suppliers')).toBeInTheDocument();
  expect(screen.getByText('Add Supplier')).toBeInTheDocument();
  expect(await screen.findByText('No suppliers found')).toBeInTheDocument();
});
