'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Mail, Plus, Upload, Trash2, RotateCw } from 'lucide-react';

export default function InvitesPage() {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [file, setFile] = useState<File | null>(null);

  async function fetchInvites() {
    setLoading(true);
    try {
      const res = await api<any>('/invites');
      setInvites(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInvites();
  }, []);

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api('/invites', {
        method: 'POST',
        body: JSON.stringify({ email, firstName, lastName }),
      });
      setEmail('');
      setFirstName('');
      setLastName('');
      fetchInvites();
    } catch (err) {
      alert('Failed to create invite');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleBulkUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('http://localhost:3001/v1/invites/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!res.ok) throw new Error('Bulk upload failed');
      
      setFile(null);
      fetchInvites();
      alert('Bulk invites processed successfully');
    } catch (err) {
      alert('Failed to bulk upload invites');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend(id: string) {
    try {
      await api(`/invites/${id}/resend`, { method: 'POST' });
      alert('Invite resent successfully');
    } catch (err) {
      alert('Failed to resend invite');
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm('Are you sure you want to revoke this invite?')) return;
    try {
      await api(`/invites/${id}`, { method: 'DELETE' });
      fetchInvites();
    } catch (err) {
      alert('Failed to revoke invite');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Invite Students</h1>
        <p className="text-surface-500 mt-1">Manage admission invitations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Invite Form */}
        <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-500" />
            Single Invite
          </h2>
          <form onSubmit={handleCreateInvite} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">First Name</label>
                <input 
                  required value={firstName} onChange={e => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Last Name</label>
                <input 
                  required value={lastName} onChange={e => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Email Address</label>
              <input 
                required type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>
            <button 
              disabled={isSubmitting}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              Send Invitation
            </button>
          </form>
        </div>

        {/* Bulk Invite */}
        <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand-500" />
            Bulk CSV Upload
          </h2>
          <p className="text-sm text-surface-500 mb-4">
            Upload a CSV file with columns: <code>email, firstName, lastName</code>.
          </p>
          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div className="border-2 border-dashed border-surface-200 rounded-xl p-8 text-center hover:bg-surface-50 transition-colors">
              <input 
                type="file" 
                accept=".csv"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-surface-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
              />
            </div>
            <button 
              disabled={!file || isSubmitting}
              className="w-full bg-surface-900 hover:bg-surface-800 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              Process CSV
            </button>
          </form>
        </div>
      </div>

      {/* Invites List */}
      <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden">
        <div className="p-4 border-b border-surface-200">
          <h2 className="font-semibold text-surface-900">Recent Invitations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-surface-600">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
              ) : invites.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center">No invites found.</td></tr>
              ) : invites.map(invite => (
                <tr key={invite.id}>
                  <td className="px-6 py-3 font-medium text-surface-900">{invite.firstName} {invite.lastName}</td>
                  <td className="px-6 py-3">{invite.email}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invite.status === 'accepted' ? 'bg-success/10 text-success' :
                      invite.status === 'revoked' ? 'bg-error/10 text-error' :
                      'bg-warning/10 text-warning-700'
                    }`}>
                      {invite.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">{new Date(invite.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleResend(invite.id)} className="p-1.5 text-surface-400 hover:text-brand-500" title="Resend">
                        <RotateCw className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRevoke(invite.id)} className="p-1.5 text-surface-400 hover:text-error" title="Revoke">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
