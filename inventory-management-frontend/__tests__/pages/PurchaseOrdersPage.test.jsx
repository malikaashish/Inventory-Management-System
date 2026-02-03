import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import axiosInstance from '../../src/api/axios';
import { PurchaseOrdersPage } from '../../src/pages/PurchaseOrdersPage';

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

test('PurchaseOrdersPage renders and shows empty state', async () => {
  axiosInstance.get.mockImplementation((url) => {
    if (url.startsWith('/purchases/orders/pending')) {
      return Promise.resolve({ data: { success: true, data: [] } });
    }
    if (url.startsWith('/purchases/orders')) {
      return Promise.resolve({ data: { success: true, data: { content: [], totalPages: 0, totalElements: 0 } } });
    }
    return Promise.resolve({ data: { success: true, data: {} } });
  });

  render(wrap(<PurchaseOrdersPage />));

  expect(screen.getByText('Purchase Orders')).toBeInTheDocument();
  expect(screen.getByText('New Purchase Order')).toBeInTheDocument();
  expect(await screen.findByText('No purchase orders found')).toBeInTheDocument();
});