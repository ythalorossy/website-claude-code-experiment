'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  image: string | null;
  linkedin: string | null;
  github: string | null;
  email: string | null;
  order: number;
  isActive: boolean;
}

export default function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    image: '',
    linkedin: '',
    github: '',
    email: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`/api/team/${id}`)
        .then((res) => res.json())
        .then((data: TeamMember) => {
          setFormData({
            name: data.name,
            title: data.title,
            bio: data.bio || '',
            image: data.image || '',
            linkedin: data.linkedin || '',
            github: data.github || '',
            email: data.email || '',
            order: data.order,
            isActive: data.isActive,
          });
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load team member');
          setLoading(false);
        });
    });
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const { id } = await params;
      const res = await fetch(`/api/team/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to update team member');
      }

      router.push('/admin/team');
      router.refresh();
    } catch (err) {
      setError('Failed to update team member');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/team"
          className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Team
        </Link>
        <h1 className="text-3xl font-bold">Edit Team Member</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-slate-900">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Bio</label>
          <textarea
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Image URL</label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://example.com/photo.jpg"
            className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">LinkedIn URL</label>
            <input
              type="url"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">GitHub URL</label>
            <input
              type="url"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/team"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
