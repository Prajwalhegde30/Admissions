'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { Bell, Check, Circle } from 'lucide-react';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchNotifications() {
    try {
      const data = await api<any[]>('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  }

  async function markAsRead(id: string) {
    try {
      await api(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {}
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 text-surface-500 hover:text-surface-900 transition-colors rounded-lg hover:bg-surface-100"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-surface-200 shadow-lg rounded-xl overflow-hidden z-50 animate-fade-in">
          <div className="p-3 border-b border-surface-200 bg-surface-50 flex justify-between items-center">
            <h3 className="font-semibold text-surface-900">Notifications</h3>
            {unreadCount > 0 && <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-surface-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-surface-100">
                {notifications.map(n => (
                  <div key={n.id} className={`p-4 flex gap-3 transition-colors ${!n.isRead ? 'bg-brand-50/30' : 'hover:bg-surface-50'}`}>
                    <div className="shrink-0 mt-0.5">
                      {!n.isRead ? <Circle className="w-2.5 h-2.5 fill-brand-500 text-brand-500" /> : <Check className="w-3 h-3 text-surface-300" />}
                    </div>
                    <div className="flex-1 cursor-pointer" onClick={() => !n.isRead && markAsRead(n.id)}>
                      <h4 className={`text-sm ${!n.isRead ? 'font-semibold text-surface-900' : 'font-medium text-surface-700'}`}>{n.title}</h4>
                      <p className="text-xs text-surface-500 mt-1 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-surface-400 mt-2">{new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
