import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { formatDateRange } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Github, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Explore our software projects and contributions',
};

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      members: {
        include: {
          member: {
            select: { id: true, name: true, image: true },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-fuchsia-50 to-transparent py-20 dark:from-violet-950/20 dark:via-fuchsia-950/20 dark:to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-200/40 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400 md:text-6xl">
              Our Projects
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-400">
              Explore our software projects, open-source contributions, and technical achievements
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No projects yet.</p>
            </div>
          ) : (
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="group relative overflow-hidden border-0 bg-white shadow-lg shadow-brand-500/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-500/10 dark:bg-slate-900"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-brand-500 to-accent-500">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-4xl font-bold text-white/30">
                          {project.title.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Hover Links */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
                          aria-label="View on GitHub"
                        >
                          <Github className="h-5 w-5 text-white" />
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
                          aria-label="View demo"
                        >
                          <ExternalLink className="h-5 w-5 text-white" />
                        </a>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute right-3 top-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          project.status
                            ? 'bg-green-500/90 text-white'
                            : 'bg-gray-500/90 text-white'
                        }`}
                      >
                        {project.status ? 'Active' : 'Archived'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                      {project.title}
                    </h3>
                    <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                      {project.description}
                    </p>

                    {/* Tech Stack Tags */}
                    {project.technologies.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            +{project.technologies.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer: Members + Date */}
                    <div className="flex items-center justify-between">
                      {/* Team Avatars */}
                      {project.members.length > 0 && (
                        <div className="flex items-center">
                          <div className="flex -space-x-2">
                            {project.members.slice(0, 3).map((pm) => (
                              <div
                                key={pm.memberId}
                                className="relative h-7 w-7 rounded-full border-2 border-white dark:border-slate-900"
                                title={pm.member.name}
                              >
                                {pm.member.image ? (
                                  <img
                                    src={pm.member.image}
                                    alt={pm.member.name}
                                    className="h-full w-full rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-[10px] font-bold text-white">
                                    {pm.member.name
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')
                                      .slice(0, 2)}
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
                        </div>
                      )}

                      {/* Date Range */}
                      {(project.startDate || project.endDate) && (
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatDateRange(project.startDate, project.endDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
