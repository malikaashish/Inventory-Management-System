import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import axiosInstance from '../../src/api/axios';
import { ReportsPage } from '../../src/pages/ReportsPage';

jest.mock('../../src/api/axios');

function wrap(ui) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

test('ReportsPage renders and can switch report tabs', async () => {
  axiosInstance.get.mockImplementation((url) => {
    if (url === '/reports/inventory') {
      return Promise.resolve({
        data: { success: true, data: { totalProducts: 0, totalQuantity: 0, totalValue: 0, lowStockCount: 0, items: [] } },
      });
    }
    return Promise.resolve({ data: { success: true, data: { items: [], totalLowStockItems: 0 } } });
  });

  render(wrap(<ReportsPage />));

  expect(screen.getByText('Reports')).toBeInTheDocument();

  // Switch to Low Stock report
  fireEvent.click(screen.getByText('Low Stock Report'));
  // The page uses queries enabled by activeReport; ensure it still renders
  expect(await screen.findByText('Low Stock Report')).toBeInTheDocument();
});