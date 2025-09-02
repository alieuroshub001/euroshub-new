import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';
import DeleteAccountButton from '@/components/auth/DeleteAccountButton';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // If user is not logged in, redirect to login
  if (!session) {
    redirect('/auth/login');
  }

  // If user is not admin, redirect to their appropriate dashboard
  if (session.user.role !== 'admin') {
    redirect(`/${session.user.role}`);
  }

  const user = session.user;

  return (
    <DashboardLayout>
      <div className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <LogoutButton />
          <DeleteAccountButton userId={session.user.id} />
        </div>
      </div>
      
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Username:</span> {user?.name}</p>
            <p><span className="font-medium">Full Name:</span> {user?.fullname}</p>
            <p><span className="font-medium">Phone:</span> {user?.number}</p>
          </div>
          <div>
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">Role:</span> Administrator</p>
            <p><span className="font-medium">Access Level:</span> Full System Access</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800">Admin Privileges:</h3>
          <ul className="mt-2 text-sm text-blue-700">
            <li>• Assign IDs to users</li>
            <li>• Manage all user accounts</li>
            <li>• View system analytics</li>
            <li>• System configuration</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/admin/users" 
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium">User Management</h3>
            <p className="text-sm text-gray-600 mt-1">View and manage all users</p>
          </a>
          <a 
            href="/admin/assign-ids" 
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium">ID Assignment</h3>
            <p className="text-sm text-gray-600 mt-1">Assign IDs to pending users</p>
          </a>
          <a 
            href="/admin/reports" 
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium">Reports</h3>
            <p className="text-sm text-gray-600 mt-1">View system reports</p>
          </a>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}