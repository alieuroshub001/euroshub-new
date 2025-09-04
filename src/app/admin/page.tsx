import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>Admin dashboard placeholder. This is simplified to test the loading spinner functionality.</p>
          <div className="mt-4 space-y-2">
            <p>• User Management</p>
            <p>• ID Assignment</p>
            <p>• System Reports</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}