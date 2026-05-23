'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Users, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Stats {
  total: number;
  draft: number;
  submitted: number;
  under_review: number;
  approved: number;
  rejected: number;
  correction_requested: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api<Stats>('/applications/stats');
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-surface-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-surface-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-error/10 text-error p-4 rounded-xl border border-error/20">
        {error || 'An unexpected error occurred.'}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.total,
      icon: Users,
      color: 'bg-brand-500',
      bg: 'bg-brand-50',
    },
    {
      title: 'Pending Review',
      value: stats.submitted + stats.under_review,
      icon: Clock,
      color: 'bg-warning',
      bg: 'bg-yellow-50',
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'bg-success',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Action Required',
      value: stats.correction_requested,
      icon: FileText,
      color: 'bg-error',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Dashboard Overview</h1>
        <p className="text-surface-500 mt-1">Summary of all admission applications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-xl ${card.bg}`}>
              <card.icon className={`w-8 h-8 ${card.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-500">{card.title}</p>
              <p className="text-3xl font-bold text-surface-900 mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
         <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Detailed Breakdown</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center pb-3 border-b border-surface-100">
                  <span className="text-surface-600 font-medium">Draft (Not Submitted)</span>
                  <span className="font-semibold text-surface-900">{stats.draft}</span>
               </div>
               <div className="flex justify-between items-center pb-3 border-b border-surface-100">
                  <span className="text-surface-600 font-medium">Submitted (Awaiting Review)</span>
                  <span className="font-semibold text-surface-900">{stats.submitted}</span>
               </div>
               <div className="flex justify-between items-center pb-3 border-b border-surface-100">
                  <span className="text-surface-600 font-medium">Currently Under Review</span>
                  <span className="font-semibold text-surface-900">{stats.under_review}</span>
               </div>
               <div className="flex justify-between items-center pb-3 border-b border-surface-100">
                  <span className="text-surface-600 font-medium">Rejected</span>
                  <span className="font-semibold text-surface-900">{stats.rejected}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
