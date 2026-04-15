'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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

export default function AdminTeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useState(() => {
    fetch('/api/team')
      .then((res) => res.json())
      .then((data) => {
        setTeamMembers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  });

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/team/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });

      if (res.ok) {
        startTransition(() => {
          setTeamMembers((prev) =>
            prev.map((m) => (m.id === id ? { ...m, isActive: !currentActive } : m))
          );
        });
      }
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const moveMember = async (id: string, direction: 'up' | 'down') => {
    try {
      const res = await fetch('/api/team/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, direction }),
      });

      if (res.ok) {
        const { member1, member2 } = await res.json();
        startTransition(() => {
          setTeamMembers((prev) =>
            prev.map((m) =>
              m.id === member1.id ? member1 : m.id === member2.id ? member2 : m
            )
          );
        });
      }
    } catch (error) {
      console.error('Failed to reorder member:', error);
    }
  };

  const deleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;

    try {
      const res = await fetch(`/api/team/${id}`, { method: 'DELETE' });

      if (res.ok) {
        startTransition(() => {
          setTeamMembers((prev) => prev.filter((m) => m.id !== id));
        });
      }
    } catch (error) {
      console.error('Failed to delete team member:', error);
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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your team</p>
        </div>
        <Link href="/admin/team/new">
          <Button>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Team Member
          </Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-brand-500 to-accent-500 text-white">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {teamMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No team members yet.
                  </td>
                </tr>
              ) : (
                teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        {member.image ? (
                          <img src={member.image} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-500/20" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white ring-2 ring-brand-500/20">
                            {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{member.title}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{member.order}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button
                        onClick={() => toggleActive(member.id, member.isActive)}
                        disabled={isPending}
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all ${
                          member.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${member.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {member.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => moveMember(member.id, 'up')}
                          disabled={member.order === 1}
                          className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Up"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveMember(member.id, 'down')}
                          disabled={member.order === teamMembers.length}
                          className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Down"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <Link
                          href={`/admin/team/${member.id}/edit`}
                          className="rounded-lg p-2 text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-colors"
                          title="Edit"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => deleteMember(member.id)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
