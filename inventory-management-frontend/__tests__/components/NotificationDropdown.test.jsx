import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import axiosInstance from '../../src/api/axios';
import { NotificationDropdown } from '../../src/components/layout/NotificationDropdown';

jest.mock('../../src/api/axios');

function wrap(ui) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe('NotificationDropdown', () => {
  afterEach(() => jest.clearAllMocks());

  test('shows unread badge and loads notifications when opened', async () => {
    axiosInstance.get.mockImplementation((url) => {
      if (url === '/notifications/unread/count') {
        return Promise.resolve({ data: { success: true, data: { count: 2 } } });
      }
      if (url === '/notifications/unread') {
        return Promise.resolve({
          data: {
            success: true,
            data: [{ id: 1, type: 'LOW_STOCK', title: 'Low Stock', message: 'Test', createdAt: new Date().toISOString() }],
          },
        });
      }
      return Promise.resolve({ data: { success: true, data: {} } });
    });

    render(wrap(<NotificationDropdown />));

    expect(await screen.findByText('2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByText('Notifications')).toBeInTheDocument();
    expect(await screen.findByText('Low Stock')).toBeInTheDocument();
  });
});