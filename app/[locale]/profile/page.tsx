import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              Account Settings
            </span>
          </h1>

          {/* Profile Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || 'Profile'}
                      className="w-20 h-20 rounded-full object-cover border-4 border-brand-500"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-brand-500">
                      {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                </div>

                {/* User Info */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {user.name || 'No name set'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium rounded-full">
                    {user.role === 'ADMIN' ? 'Administrator' : 'User'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Additional account information</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <dt className="text-gray-500 dark:text-gray-400">Email</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{user.email}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <dt className="text-gray-500 dark:text-gray-400">Account Type</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {user.role === 'ADMIN' ? 'Administrator' : 'Standard User'}
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-gray-500 dark:text-gray-400">Signed in via</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {session.account?.provider === 'google' ? 'Google' : 'Email'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900/50">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Sign out of your account</p>
                  <p className="text-sm text-gray-500">You will need to sign in again to access your account.</p>
                </div>
                <form action="/api/auth/signout" method="POST">
                  <Button type="submit" variant="danger" size="sm">
                    Sign Out
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
