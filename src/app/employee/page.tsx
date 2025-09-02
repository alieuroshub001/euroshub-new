import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';
import DeleteAccountButton from '@/components/auth/DeleteAccountButton';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions);

  // If user is not logged in, redirect to login
  if (!session) {
    redirect('/auth/login');
  }

  // If user is not employee, redirect to their appropriate dashboard
  if (session.user.role !== 'employee') {
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
        <h3 className="font-semibold text-green-800">Employee Account Active</h3>
        <p className="text-sm text-green-700 mt-1">
          Your employee account is fully activated and ready to use.
        </p>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Employee Dashboard</h1>
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
            <p><span className="font-medium">Role:</span> Employee</p>
            {user.employeeId && (
              <p><span className="font-medium">Employee ID:</span> {user.employeeId}</p>
            )}
          </div>
        </div>
        
        {getIdStatusMessage()}
      </div>

      {user.idAssigned && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Employee Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/employee/tasks" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">My Tasks</h3>
              <p className="text-sm text-gray-600 mt-1">View and manage assigned tasks</p>
            </a>
            <a 
              href="/employee/timesheet" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Timesheet</h3>
              <p className="text-sm text-gray-600 mt-1">Log work hours and attendance</p>
            </a>
            <a 
              href="/employee/leave" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Leave Requests</h3>
              <p className="text-sm text-gray-600 mt-1">Request time off and sick leave</p>
            </a>
            <a 
              href="/employee/payslips" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Payslips</h3>
              <p className="text-sm text-gray-600 mt-1">View salary and payment history</p>
            </a>
            <a 
              href="/employee/training" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Training</h3>
              <p className="text-sm text-gray-600 mt-1">Access training materials</p>
            </a>
            <a 
              href="/employee/profile" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Profile Settings</h3>
              <p className="text-sm text-gray-600 mt-1">Update personal information</p>
            </a>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}