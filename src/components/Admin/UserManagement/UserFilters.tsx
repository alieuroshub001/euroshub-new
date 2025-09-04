"use client"
import { IUserManagementFilters } from '@/types';
import { useState, useEffect, useRef, useCallback } from 'react';

interface UserFiltersProps {
  filters: IUserManagementFilters;
  onFiltersChange: (filters: IUserManagementFilters) => void;
  userCounts: {
    total: number;
    pending: number;
    approved: number;
    declined: number;
    blocked: number;
  };
}

export default function UserFilters({ filters, onFiltersChange, userCounts }: UserFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simple debounced search handler
  const handleSearchInputChange = (search: string) => {
    const newSearchValue = search;
    setSearchInput(newSearchValue);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout - the timeout will only fire for the last keystroke
    debounceTimeoutRef.current = setTimeout(() => {
      // This will be the search value from the last keystroke that set the timeout
      onFiltersChange({ ...filters, search: newSearchValue });
    }, 500);
  };

  // Update local search input when filters.search changes externally (like when clearing filters)  
  useEffect(() => {
    if (filters.search !== searchInput) {
      setSearchInput(filters.search || '');
    }
  }, [filters.search]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleRoleChange = (role: 'client' | 'hr' | 'employee' | undefined) => {
    onFiltersChange({ ...filters, role });
  };

  const handleStatusChange = (status: 'pending' | 'approved' | 'declined' | 'blocked' | undefined) => {
    onFiltersChange({ ...filters, status });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Filters Section */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search Users
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  console.log('Raw onChange fired:', e.target.value);
                  handleSearchInputChange(e.target.value);
                }}
                placeholder="Search by name, email, or ID"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Role
            </label>
            <select
              value={filters.role || ''}
              onChange={(e) => handleRoleChange((e.target.value as 'client' | 'hr' | 'employee') || undefined)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
            >
              <option value="">All Roles</option>
              <option value="client">Client</option>
              <option value="hr">HR</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleStatusChange((e.target.value as 'pending' | 'approved' | 'declined' | 'blocked') || undefined)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending ({userCounts.pending})</option>
              <option value="approved">Approved ({userCounts.approved})</option>
              <option value="declined">Declined ({userCounts.declined})</option>
              <option value="blocked">Blocked ({userCounts.blocked})</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchInput('');
                onFiltersChange({ search: '', role: '', status: '', idAssigned: '' });
              }}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="border-t border-gray-100 bg-gray-50 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-900 mb-1">{userCounts.total}</div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Users</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-yellow-100">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{userCounts.pending}</div>
            <div className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Pending</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-green-100">
            <div className="text-2xl font-bold text-green-600 mb-1">{userCounts.approved}</div>
            <div className="text-xs font-medium text-green-700 uppercase tracking-wide">Approved</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-red-100">
            <div className="text-2xl font-bold text-red-600 mb-1">{userCounts.declined}</div>
            <div className="text-xs font-medium text-red-700 uppercase tracking-wide">Declined</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-600 mb-1">{userCounts.blocked}</div>
            <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">Blocked</div>
          </div>
        </div>
      </div>
    </div>
  );
}