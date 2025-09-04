"use client"
import { IUser, IUserManagementFilters } from '@/types';
import { useState, useEffect, useCallback, useRef } from 'react';
import UserCard from './UserCard';
import UserListView from './UserListView';
import UserFilters from './UserFilters';
import { ArrowPathIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

export default function UserList() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUsers = useCallback(async (page = 1, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
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
      setRefreshing(false);
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

  // Auto-refresh functionality
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      fetchUsers(pagination.current, true);
      fetchUserCounts();
    }, 30000); // Refresh every 30 seconds
  }, [pagination.current]); // Only depend on current page

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleManualRefresh = async () => {
    await fetchUsers(pagination.current, true);
    await fetchUserCounts();
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
    fetchUserCounts();
    startAutoRefresh();

    // Cleanup on unmount
    return () => {
      stopAutoRefresh();
    };
  }, []); // Empty dependency array for initial load only

  // Handle filter changes
  useEffect(() => {
    fetchUsers(1); // Reset to page 1 when filters change
  }, [filters]);

  // Handle visibility change to pause/resume auto-refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoRefresh();
      } else {
        startAutoRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startAutoRefresh, stopAutoRefresh]);

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

  const handleUserUpdate = async (userId: string, updates: Partial<IUser>) => {
    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          updates
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchUsers(pagination.current);
        await fetchUserCounts();
        alert('User updated successfully');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUserDelete = async (userId: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchUsers(pagination.current);
        await fetchUserCounts();
        alert('User deleted successfully');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUserUnblock = async (userId: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/users/unblock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchUsers(pagination.current);
        await fetchUserCounts();
        alert('User unblocked successfully');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user');
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
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            User Management Dashboard
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Auto-refreshing every 30s
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'card'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ListBulletIcon className="w-4 h-4" />
              List
            </button>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
      </div>

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
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {users.map((user) => (
                <UserCard
                  key={user._id || user.id}
                  user={user}
                  onStatusUpdate={handleStatusUpdate}
                  onUserUpdate={handleUserUpdate}
                  onUserDelete={handleUserDelete}
                  onUserUnblock={handleUserUnblock}
                  isLoading={actionLoading === user.id}
                />
              ))}
            </div>
          ) : (
            <div className="mb-6">
              <UserListView
                users={users}
                onStatusUpdate={handleStatusUpdate}
                onUserUpdate={handleUserUpdate}
                onUserDelete={handleUserDelete}
                onUserUnblock={handleUserUnblock}
                actionLoading={actionLoading}
              />
            </div>
          )}

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