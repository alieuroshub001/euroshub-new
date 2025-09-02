import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';
import DeleteAccountButton from '@/components/auth/DeleteAccountButton';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);

  // If user is not logged in, redirect to login
  if (!session) {
    redirect('/auth/login');
  }

  // If user is not client, redirect to their appropriate dashboard
  if (session.user.role !== 'client') {
    redirect(`/${session.user.role}`);
  }

  const user = session.user;

  const getIdStatusMessage = () => {
    if (!user.idAssigned) {
      return (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Pending Client ID Assignment</h3>
          <p className="mt-2 text-sm text-yellow-700">
            Your account is waiting for admin to assign your client ID. 
            You&apos;ll receive an email notification once it&apos;s assigned.
          </p>
        </div>
      );
    }

    return (
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-800">Account Active</h3>
        <p className="text-sm text-green-700 mt-1">
          Your client account is fully activated and ready to use.
        </p>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Client Dashboard</h1>
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
            <p><span className="font-medium">Role:</span> Client</p>
            {user.clientId && (
              <p><span className="font-medium">Client ID:</span> {user.clientId}</p>
            )}
          </div>
        </div>
        
        {getIdStatusMessage()}
      </div>

      {user.idAssigned && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Client Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="/client/projects" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">My Projects</h3>
              <p className="text-sm text-gray-600 mt-1">View and manage your projects</p>
            </a>
            <a 
              href="/client/invoices" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Invoices</h3>
              <p className="text-sm text-gray-600 mt-1">View billing and invoices</p>
            </a>
            <a 
              href="/client/support" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Support</h3>
              <p className="text-sm text-gray-600 mt-1">Contact support team</p>
            </a>
            <a 
              href="/client/profile" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Profile Settings</h3>
              <p className="text-sm text-gray-600 mt-1">Update your profile</p>
            </a>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}