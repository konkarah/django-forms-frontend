// src/components/AdminDashboard/NotificationPanel.tsx
'use client';

import React from 'react';
import { useApiClient } from '@/lib/api';
import { Notification } from '@/types';
import { formatDate } from '@/lib/utils';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface NotificationPanelProps {
  notifications: Notification[];
  onRefresh: () => void;
}

export default function NotificationPanel({ notifications, onRefresh }: NotificationPanelProps) {
  const apiClient = useApiClient();

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.post(`/notifications/${notificationId}/read/`);
      toast.success('Notification marked as read');
      onRefresh();
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.post('/notifications/mark-all-read/');
      toast.success('All notifications marked as read');
      onRefresh();
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              You'll see notifications here when forms are submitted.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-colors ${
                notification.is_read 
                  ? 'bg-white border-gray-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h3>
                    {!notification.is_read && (
                      <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span>{formatDate(notification.created_at)}</span>
                    <span className="mx-1">•</span>
                    <span className="capitalize">
                      {notification.notification_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="ml-4 flex items-center space-x-2">
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Mark as read"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                  {notification.related_object_id && notification.related_object_type === 'form_submission' && (
                    <button
                      onClick={() => {
                        // Navigate to submission
                        window.location.href = `/admin/submissions/${notification.related_object_id}`;
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}