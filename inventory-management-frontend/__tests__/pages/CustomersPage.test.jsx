import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import axiosInstance from '../../src/api/axios';
import { CustomersPage } from '../../src/pages/CustomersPage';

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

test('CustomersPage renders and shows table empty state', async () => {
  axiosInstance.get.mockResolvedValueOnce({
    data: { success: true, data: { content: [], totalPages: 0 } },
  });

  render(wrap(<CustomersPage />));

  expect(screen.getByText('Customers')).toBeInTheDocument();
  expect(screen.getByText('Add Customer')).toBeInTheDocument();
  expect(await screen.findByText('No customers found')).toBeInTheDocument();
});