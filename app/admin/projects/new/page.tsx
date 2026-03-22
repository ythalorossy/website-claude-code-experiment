'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TeamMemberOption {
  id: string;
  name: string;
  title: string;
  image: string | null;
}

interface MemberInput {
  memberId: string;
  role: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingTeam, setFetchingTeam] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    githubUrl: '',
    demoUrl: '',
    status: true,
    startDate: '',
    endDate: '',
    technologies: '',
  });

  const [members, setMembers] = useState<MemberInput[]>([]);

  useEffect(() => {
    fetch('/api/team')
      .then((res) => res.json())
      .then((data) => {
        setTeamMembers(data);
        setFetchingTeam(false);
      })
      .catch(() => setFetchingTeam(false));
  }, []);

  const addMember = () => {
    setMembers([...members, { memberId: '', role: '' }]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: 'memberId' | 'role', value: string) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const technologies = formData.technologies
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const validMembers = members.filter((m) => m.memberId && m.role);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          technologies,
          members: validMembers,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create project');
      }

      router.push('/admin/projects');
      router.refresh();
    } catch (err) {
      setError('Failed to create project');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/projects"
          className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>
        <h1 className="text-3xl font-bold">Add Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-slate-900">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Description *</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/project-image.jpg"
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">GitHub URL</label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              placeholder="https://github.com/..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Demo URL</label>
            <input
              type="url"
              value={formData.demoUrl}
              onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
              placeholder="https://example.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Technologies</label>
            <input
              type="text"
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              placeholder="Next.js, PostgreSQL, Tailwind CSS (comma-separated)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Team Members</label>
              <button
                type="button"
                onClick={addMember}
                className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                + Add Member
              </button>
            </div>

            {members.length > 0 && (
              <div className="mt-3 space-y-3">
                {members.map((member, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <select
                      value={member.memberId}
                      onChange={(e) => updateMember(index, 'memberId', e.target.value)}
                      disabled={fetchingTeam}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
                    >
                      <option value="">Select team member...</option>
                      {teamMembers.map((tm) => (
                        <option key={tm.id} value={tm.id}>
                          {tm.name} - {tm.title}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => updateMember(index, 'role', e.target.value)}
                      placeholder="Role (e.g. Lead Developer)"
                      className="w-40 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="rounded-md p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/projects"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
