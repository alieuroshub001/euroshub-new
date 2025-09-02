import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';
import DeleteAccountButton from '@/components/auth/DeleteAccountButton';

export default async function HRDashboard() {
  const session = await getServerSession(authOptions);

  // If user is not logged in, redirect to login
  if (!session) {
    redirect('/auth/login');
  }

  // If user is not hr, redirect to their appropriate dashboard
  if (session.user.role !== 'hr') {
    redirect(`/${session.user.role}`);
  }

  const user = session.user;

  const getIdStatusMessage = () => {
    if (!user.idAssigned) {
      return (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Pending Employee ID Assignment</h3>
          <p className="mt-2 text-sm text-yellow-700">
            Your account is waiting for admin to assign your employee ID. 
            You'll receive an email notification once it's assigned.
          </p>
        </div>
      );
    }

    return (
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-800">HR Account Active</h3>
        <p className="text-sm text-green-700 mt-1">
          Your HR account is fully activated with employee management privileges.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">HR Dashboard</h1>
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
            <p><span className="font-medium">Role:</span> Human Resources</p>
            {user.employeeId && (
              <p><span className="font-medium">Employee ID:</span> {user.employeeId}</p>
            )}
          </div>
        </div>
        
        {getIdStatusMessage()}
      </div>

      {user.idAssigned && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">HR Management Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/hr/employees" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Employee Management</h3>
              <p className="text-sm text-gray-600 mt-1">Manage employee records</p>
            </a>
            <a 
              href="/hr/recruitment" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Recruitment</h3>
              <p className="text-sm text-gray-600 mt-1">Manage job postings and applications</p>
            </a>
            <a 
              href="/hr/attendance" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Attendance</h3>
              <p className="text-sm text-gray-600 mt-1">Track employee attendance</p>
            </a>
            <a 
              href="/hr/payroll" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Payroll</h3>
              <p className="text-sm text-gray-600 mt-1">Manage payroll and benefits</p>
            </a>
            <a 
              href="/hr/performance" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Performance</h3>
              <p className="text-sm text-gray-600 mt-1">Employee evaluations and reviews</p>
            </a>
            <a 
              href="/hr/reports" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">HR Reports</h3>
              <p className="text-sm text-gray-600 mt-1">Generate HR analytics</p>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}