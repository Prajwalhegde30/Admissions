'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import Link from 'next/link';
import { Search, Filter, ChevronRight, FileText, Download } from 'lucide-react';

interface ApplicationSummary {
  id: string;
  status: string;
  admissionType: string;
  category: string;
  updatedAt: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ApiResponse {
  data: ApplicationSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function ApplicationsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchApps() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.append('search', search);
        if (status) query.append('status', status);
        query.append('page', page.toString());
        
        const response = await api<ApiResponse>(`/applications?${query.toString()}`);
        setData(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    
    // Debounce search
    const timer = setTimeout(fetchApps, 300);
    return () => clearTimeout(timer);
  }, [search, status, page]);

  const handleExport = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1'}/admin/reports/export-applications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'applications_report.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Applications</h1>
          <p className="text-surface-500 mt-1">Review and manage student applications.</p>
        </div>
        <button 
          onClick={handleExport}
          className="inline-flex items-center gap-2 bg-white border border-surface-200 hover:border-brand-500 hover:text-brand-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-surface-200">
        <div className="p-4 border-b border-surface-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-sm font-medium text-surface-700"
            >
              <option value="">All Statuses</option>
              <option value="payment_pending">Payment Pending</option>
              <option value="paid">Paid (Awaiting Review)</option>
              <option value="submitted">Submitted (Old)</option>
              <option value="under_review">Under Review</option>
              <option value="correction_requested">Correction Requested</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft (Not Submitted)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-surface-600">
            <thead className="bg-surface-50 text-surface-900 border-b border-surface-200">
              <tr>
                <th className="px-6 py-3 font-medium">Applicant</th>
                <th className="px-6 py-3 font-medium">Admission Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Last Updated</th>
                <th className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     <td className="px-6 py-4"><div className="h-4 bg-surface-200 rounded w-32 mb-2" /><div className="h-3 bg-surface-200 rounded w-48" /></td>
                     <td className="px-6 py-4"><div className="h-4 bg-surface-200 rounded w-24" /></td>
                     <td className="px-6 py-4"><div className="h-6 bg-surface-200 rounded-full w-24" /></td>
                     <td className="px-6 py-4"><div className="h-4 bg-surface-200 rounded w-24" /></td>
                     <td className="px-6 py-4 text-right"><div className="h-8 bg-surface-200 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                    <p className="text-surface-500 font-medium">No applications found</p>
                  </td>
                </tr>
              ) : (
                data?.data.map((app) => (
                  <tr key={app.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-surface-900">
                        {app.student.firstName} {app.student.lastName}
                      </p>
                      <p className="text-xs text-surface-500">{app.student.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize">{app.admissionType}</span>
                      {app.category && <span className="text-xs text-surface-500 ml-2 border border-surface-200 px-1.5 py-0.5 rounded uppercase">{app.category}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        app.status === 'approved' ? 'bg-success/10 text-success' :
                        app.status === 'rejected' ? 'bg-error/10 text-error' :
                        app.status === 'submitted' ? 'bg-warning/10 text-warning-700' :
                        'bg-surface-100 text-surface-600'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(app.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/applications/${app.id}`}
                        className="inline-flex items-center justify-center bg-brand-50 hover:bg-brand-100 text-brand-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-surface-200 flex items-center justify-between">
             <p className="text-sm text-surface-500">
                Page {data.meta.page} of {data.meta.totalPages}
             </p>
             <div className="flex gap-2">
                <button 
                  disabled={data.meta.page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 border border-surface-200 rounded text-sm font-medium hover:bg-surface-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button 
                  disabled={data.meta.page === data.meta.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 border border-surface-200 rounded text-sm font-medium hover:bg-surface-50 disabled:opacity-50"
                >
                  Next
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
