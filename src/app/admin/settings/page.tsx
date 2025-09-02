import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StorageMonitor from '@/components/Admin/Settings/StorageMonitor';

export default async function AdminSettingsPage() {
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
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-1">
              Monitor system resources and manage application settings
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

          {/* Storage Monitoring Section */}
          <div className="grid grid-cols-1 gap-6">
            <StorageMonitor />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}