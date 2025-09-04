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
    console.log('handleSearchInputChange called with:', search);
    const newSearchValue = search;
    setSearchInput(newSearchValue);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout - the timeout will only fire for the last keystroke
    debounceTimeoutRef.current = setTimeout(() => {
      // This will be the search value from the last keystroke that set the timeout
      console.log('Timeout fired, sending to API:', newSearchValue);
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
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              console.log('Raw onChange fired:', e.target.value);
              handleSearchInputChange(e.target.value);
            }}
            placeholder="Search by name, email, or ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={filters.role || ''}
            onChange={(e) => handleRoleChange((e.target.value as 'client' | 'hr' | 'employee') || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="client">Client</option>
            <option value="hr">HR</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleStatusChange((e.target.value as 'pending' | 'approved' | 'declined' | 'blocked') || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{userCounts.total}</div>
          <div className="text-gray-600">Total Users</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-yellow-600">{userCounts.pending}</div>
          <div className="text-gray-600">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">{userCounts.approved}</div>
          <div className="text-gray-600">Approved</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">{userCounts.declined}</div>
          <div className="text-gray-600">Declined</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-600">{userCounts.blocked}</div>
          <div className="text-gray-600">Blocked</div>
        </div>
      </div>
    </div>
  );
}