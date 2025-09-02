import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';
import DeleteAccountButton from '@/components/auth/DeleteAccountButton';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // If user is not logged in, redirect to login
  if (!session) {
    redirect('/auth/login');
  }

  const user = session.user;
  const getDashboardTitle = () => {
    switch (user.role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'client':
        return 'Client Dashboard';
      case 'hr':
        return 'HR Dashboard';
      case 'employee':
        return 'Employee Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const getRoleSpecificInfo = () => {
    if (user.role === 'admin') {
      return (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800">Admin Features:</h3>
          <ul className="mt-2 text-sm text-blue-700">
            <li>• Assign IDs to users</li>
            <li>• Manage all user accounts</li>
            <li>• View system analytics</li>
          </ul>
        </div>
      );
    }

    if (!user.idAssigned && user.role !== 'admin') {
      return (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Pending ID Assignment</h3>
          <p className="mt-2 text-sm text-yellow-700">
            Your account is waiting for admin to assign your {user.role === 'client' ? 'client' : 'employee'} ID. 
            You'll receive an email notification once it's assigned.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{getDashboardTitle()}</h1>
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
            <p><span className="font-medium">Role:</span> {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</p>
            {user.employeeId && (
              <p><span className="font-medium">Employee ID:</span> {user.employeeId}</p>
            )}
            {user.clientId && (
              <p><span className="font-medium">Client ID:</span> {user.clientId}</p>
            )}
          </div>
        </div>
        
        {getRoleSpecificInfo()}
      </div>

      {user.role === 'admin' && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>
      )}
    </div>
  );
}