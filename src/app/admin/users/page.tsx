import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserList from '@/components/Admin/UserManagement/UserList';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  // If user is not logged in, redirect to login
  if (!session) {
    redirect('/auth/login');
  }

  // If user is not admin, redirect to their appropriate dashboard
  if (session.user.role !== 'admin') {
    redirect(`/${session.user.role}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user registrations, approve/decline accounts, and assign IDs
          </p>
        </div>

        <div className="mb-4">
          <nav className="flex space-x-4">
            <a 
              href="/admin" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Dashboard
            </a>
          </nav>
        </div>

        <UserList />
      </div>
    </div>
  );
}