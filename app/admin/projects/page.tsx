'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ProjectMember {
  memberId: string;
  name: string;
  image: string | null;
  role: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  image: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  status: boolean;
  startDate: string | null;
  endDate: string | null;
  technologies: string[];
  members: ProjectMember[];
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useState(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  });

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: !currentStatus }),
      });

      if (res.ok) {
        startTransition(() => {
          setProjects((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: !currentStatus } : p))
          );
        });
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });

      if (res.ok) {
        startTransition(() => {
          setProjects((prev) => prev.filter((p) => p.id !== id));
        });
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
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
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your projects</p>
        </div>
        <Link href="/admin/projects/new">
          <Button>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Project
          </Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-brand-500 to-accent-500 text-white">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Technologies</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Members</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No projects yet.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        {project.image ? (
                          <img src={project.image} alt="" className="h-10 w-10 rounded-lg object-cover ring-2 ring-brand-500/20" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white ring-2 ring-brand-500/20">
                            {project.title.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{project.title}</span>
                          <div className="flex gap-2">
                            {project.githubUrl && (
                              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600" aria-label="GitHub">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                </svg>
                              </a>
                            )}
                            {project.demoUrl && (
                              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600" aria-label="Demo">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button
                        onClick={() => toggleStatus(project.id, project.status)}
                        disabled={isPending}
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all ${
                          project.status
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${project.status ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {project.status ? 'Active' : 'Archived'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <span key={tech} className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex -space-x-2">
                        {project.members.slice(0, 3).map((m) => (
                          <div key={m.memberId} className="relative h-7 w-7 rounded-full border-2 border-white dark:border-slate-900" title={`${m.name} (${m.role})`}>
                            {m.image ? (
                              <img src={m.image} alt={m.name} className="h-full w-full rounded-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-[10px] font-bold text-white">
                                {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                              </div>
                            )}
                          </div>
                        ))}
                        {project.members.length > 3 && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-medium text-gray-600 dark:border-slate-900 dark:bg-gray-800 dark:text-gray-400">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/projects/${project.id}/edit`}
                          className="rounded-lg p-2 text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-colors"
                          title="Edit"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => deleteProject(project.id)}
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
