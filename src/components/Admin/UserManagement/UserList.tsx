"use client"
import { IUser, IUserManagementFilters } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import UserCard from './UserCard';
import UserFilters from './UserFilters';

export default function UserList() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState<IUserManagementFilters>({});
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalCount: 0
  });
  const [userCounts, setUserCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    declined: 0,
    blocked: 0
  });

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/admin/users/manage?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      } else {
        console.error('Failed to fetch users:', data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchUserCounts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users/manage');
      const data = await response.json();

      if (data.success) {
        const allUsers = data.data.users;
        setUserCounts({
          total: allUsers.length,
          pending: allUsers.filter((u: IUser) => u.accountStatus === 'pending').length,
          approved: allUsers.filter((u: IUser) => u.accountStatus === 'approved').length,
          declined: allUsers.filter((u: IUser) => u.accountStatus === 'declined').length,
          blocked: allUsers.filter((u: IUser) => u.accountStatus === 'blocked').length,
        });
      }
    } catch (error) {
      console.error('Error fetching user counts:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchUserCounts();
  }, [fetchUsers, fetchUserCounts]);

  const handleStatusUpdate = async (userId: string, status: 'approved' | 'declined' | 'blocked', employeeId?: string, clientId?: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          status,
          employeeId,
          clientId
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the users list
        await fetchUsers(pagination.current);
        await fetchUserCounts();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div>
      <UserFilters
        filters={filters}
        onFiltersChange={setFilters}
        userCounts={userCounts}
      />

      {users.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">No users found matching the current filters.</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {users.map((user) => (
              <UserCard
                key={user._id || user.id}
                user={user}
                onStatusUpdate={handleStatusUpdate}
                isLoading={actionLoading === user.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {pagination.current} of {pagination.total}
                ({pagination.totalCount} total users)
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current === pagination.total}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}