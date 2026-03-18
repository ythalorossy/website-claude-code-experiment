import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { AdminSignOutButton } from '@/components/AdminSignOutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin?callbackUrl=/admin');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-sm text-gray-400">{session.user.email}</p>
        </div>
        <nav className="px-4">
          <Link
            href="/admin"
            className="block rounded px-4 py-2 hover:bg-gray-800"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/posts"
            className="block rounded px-4 py-2 hover:bg-gray-800"
          >
            Posts
          </Link>
          <Link
            href="/admin/team"
            className="block rounded px-4 py-2 hover:bg-gray-800"
          >
            Team
          </Link>
          <Link
            href="/"
            className="block rounded px-4 py-2 hover:bg-gray-800 mt-4"
          >
            ← Back to Site
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <AdminSignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">{children}</main>
    </div>
  );
}