import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import axiosInstance from '../../api/axios';
import { clsx } from 'clsx';

const api = {
  unreadCount: async () => (await axiosInstance.get('/notifications/unread/count')).data,
  unread: async () => (await axiosInstance.get('/notifications/unread')).data,
  markRead: async (id) => (await axiosInstance.patch(`/notifications/${id}/read`)).data,
  markAll: async () => (await axiosInstance.patch('/notifications/read-all')).data,
};

const typeColors = {
  LOW_STOCK: 'bg-yellow-100 text-yellow-800',
  WARNING: 'bg-orange-100 text-orange-800',
  ERROR: 'bg-red-100 text-red-800',
  INFO: 'bg-gray-100 text-gray-800',
  SYSTEM: 'bg-purple-100 text-purple-800',
  ORDER_STATUS: 'bg-blue-100 text-blue-800',
};

export const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const qc = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: ['notificationCount'],
    queryFn: api.unreadCount,
    refetchInterval: 30_000,
  });

  const { data: listData, isLoading } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: api.unread,
    enabled: open,
  });

  const markRead = useMutation({
    mutationFn: api.markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['unreadNotifications'] });
      qc.invalidateQueries({ queryKey: ['notificationCount'] });
    },
  });

  const markAll = useMutation({
    mutationFn: api.markAll,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['unreadNotifications'] });
      qc.invalidateQueries({ queryKey: ['notificationCount'] });
    },
  });

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const unreadCount = countData?.data?.count || 0;
  const notifications = listData?.data || [];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAll.mutate()}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={clsx('px-2 py-0.5 text-xs font-medium rounded-full', typeColors[n.type] || 'bg-gray-100 text-gray-800')}>
                          {String(n.type || '').replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {n.createdAt ? format(new Date(n.createdAt), 'MMM d, h:mm a') : ''}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                    </div>
                    <button
                      onClick={() => markRead.mutate(n.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};