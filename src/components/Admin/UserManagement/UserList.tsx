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
  }, [fetchUsers, fetchUserCounts, pagination.current]);

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

  // Create refs for stable function references
  const fetchUsersRef = useRef(fetchUsers);
  const fetchUserCountsRef = useRef(fetchUserCounts);
  const startAutoRefreshRef = useRef(startAutoRefresh);
  const stopAutoRefreshRef = useRef(stopAutoRefresh);

  // Update refs when functions change
  useEffect(() => {
    fetchUsersRef.current = fetchUsers;
  }, [fetchUsers]);

  useEffect(() => {
    fetchUserCountsRef.current = fetchUserCounts;
  }, [fetchUserCounts]);

  useEffect(() => {
    startAutoRefreshRef.current = startAutoRefresh;
  }, [startAutoRefresh]);

  useEffect(() => {
    stopAutoRefreshRef.current = stopAutoRefresh;
  }, [stopAutoRefresh]);

  // Initial load
  useEffect(() => {
    fetchUsersRef.current();
    fetchUserCountsRef.current();
    startAutoRefreshRef.current();

    // Cleanup on unmount
    return () => {
      stopAutoRefreshRef.current();
    };
  }, []); // Empty dependency array for initial load only

  // Handle filter changes
  useEffect(() => {
    fetchUsersRef.current(1); // Reset to page 1 when filters change
  }, [filters.search, filters.role, filters.status, filters.idAssigned]);

  // Handle visibility change to pause/resume auto-refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoRefreshRef.current();
      } else {
        startAutoRefreshRef.current();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty dependency array since we use refs

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
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">Manage user registrations and account statuses</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Auto-sync every 30s
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setViewMode('card')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'card'
                    ? 'bg-blue-500 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <ListBulletIcon className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      <UserFilters
        filters={filters}
        onFiltersChange={setFilters}
        userCounts={userCounts}
      />

      {users.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500 max-w-sm mx-auto">No users match the current filters. Try adjusting your search criteria or clearing filters.</p>
        </div>
      ) : (
        <>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <UserListView
                users={users}
                onStatusUpdate={handleStatusUpdate}
                onUserDelete={handleUserDelete}
                onUserUnblock={handleUserUnblock}
                actionLoading={actionLoading}
              />
            </div>
          )}

          {/* Modern Pagination */}
          {pagination.total > 1 && (
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{Math.min((pagination.current - 1) * 10 + 1, pagination.totalCount)}</span> to{' '}
                  <span className="font-medium">{Math.min(pagination.current * 10, pagination.totalCount)}</span> of{' '}
                  <span className="font-medium">{pagination.totalCount}</span> users
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
                      const pageNum = pagination.current <= 3 ? i + 1 : pagination.current - 2 + i;
                      if (pageNum > pagination.total) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            pageNum === pagination.current
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current === pagination.total}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}