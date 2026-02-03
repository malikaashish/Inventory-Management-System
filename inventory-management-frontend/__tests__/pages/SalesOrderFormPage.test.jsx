import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import axiosInstance from '../../src/api/axios';
import { SalesOrderFormPage } from '../../src/pages/SalesOrderFormPage';

jest.mock('../../src/api/axios');
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

function wrap(ui) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/sales-orders/new']}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

test('SalesOrderFormPage renders and loads dropdown data', async () => {
  // customers/active
  axiosInstance.get.mockImplementation((url) => {
    if (url.startsWith('/customers/active')) {
      return Promise.resolve({ data: { success: true, data: [] } });
    }
    if (url.startsWith('/products')) {
      return Promise.resolve({ data: { success: true, data: { content: [] } } });
    }
    return Promise.resolve({ data: { success: true, data: {} } });
  });

  render(wrap(<SalesOrderFormPage />));

  expect(screen.getByText('New Sales Order')).toBeInTheDocument();
  expect(await screen.findByText('Order Items')).toBeInTheDocument();
  expect(screen.getByText('Create Order')).toBeInTheDocument();
});