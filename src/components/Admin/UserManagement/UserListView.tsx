"use client"
import { IUser } from '@/types';
import { useState } from 'react';
import { 
  TrashIcon, 
  LockClosedIcon, 
  LockOpenIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface UserListViewProps {
  users: IUser[];
  onStatusUpdate: (userId: string, status: 'approved' | 'declined' | 'blocked', employeeId?: string, clientId?: string) => void;
  onUserDelete?: (userId: string) => void;
  onUserUnblock?: (userId: string) => void;
  actionLoading: string | null;
}

export default function UserListView({ 
  users, 
  onStatusUpdate, 
  onUserDelete, 
  onUserUnblock, 
  actionLoading 
}: UserListViewProps) {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserRole, setSelectedUserRole] = useState<string>('');
  const [employeeId, setEmployeeId] = useState('');
  const [clientId, setClientId] = useState('');

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      declined: 'bg-red-100 text-red-800 border-red-200',
      blocked: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return `px-3 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors] || colors.pending}`;
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      client: 'bg-blue-100 text-blue-800 border-blue-200',
      hr: 'bg-purple-100 text-purple-800 border-purple-200',
      employee: 'bg-teal-100 text-teal-800 border-teal-200'
    };
    return `px-3 py-1 rounded-full text-xs font-medium border ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'}`;
  };

  const handleApprove = (userId: string, userRole: string) => {
    setSelectedUserId(userId);
    setSelectedUserRole(userRole);
    setShowApproveModal(true);
  };

  const confirmApprove = () => {
    if (selectedUserRole === 'client' && !clientId) {
      alert('Client ID is required');
      return;
    }
    if ((selectedUserRole === 'hr' || selectedUserRole === 'employee') && !employeeId) {
      alert('Employee ID is required');
      return;
    }

    onStatusUpdate(selectedUserId, 'approved', employeeId, clientId);
    setShowApproveModal(false);
    setEmployeeId('');
    setClientId('');
    setSelectedUserId('');
    setSelectedUserRole('');
  };

  const handleDecline = (userId: string) => {
    if (confirm('Are you sure you want to decline this user?')) {
      onStatusUpdate(userId, 'declined');
    }
  };

  const handleBlock = (userId: string) => {
    if (confirm('Are you sure you want to block this user?')) {
      onStatusUpdate(userId, 'blocked');
    }
  };

  const handleUnblock = (userId: string) => {
    if (confirm('Are you sure you want to unblock this user?')) {
      onUserUnblock?.(userId);
    }
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      onUserDelete?.(userId);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Admin Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors duration-200">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900">{user.fullname}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.number}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={getRoleBadge(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={getStatusBadge(user.accountStatus)}>
                      {user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.employeeId || user.clientId || '-'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    {user.statusUpdatedByName && user.accountStatus !== 'pending' ? (
                      <div className="text-xs space-y-1">
                        <div className="text-gray-900 font-medium">{user.statusUpdatedByName}</div>
                        {user.statusUpdatedAt && (
                          <div className="text-gray-500">
                            {new Date(user.statusUpdatedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      {user.accountStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(user.id, user.role)}
                            disabled={actionLoading === user.id}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 disabled:opacity-50 p-2 rounded-lg transition-all duration-200"
                            title="Approve"
                          >
                            <CheckCircleIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDecline(user.id)}
                            disabled={actionLoading === user.id}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 disabled:opacity-50 p-2 rounded-lg transition-all duration-200"
                            title="Decline"
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      {user.accountStatus === 'blocked' ? (
                        <button
                          onClick={() => handleUnblock(user.id)}
                          disabled={actionLoading === user.id}
                          className="text-green-600 hover:text-green-800 hover:bg-green-50 disabled:opacity-50 p-2 rounded-lg transition-all duration-200"
                          title="Unblock"
                        >
                          <LockOpenIcon className="w-5 h-5" />
                        </button>
                      ) : user.accountStatus === 'approved' && (
                        <button
                          onClick={() => handleBlock(user.id)}
                          disabled={actionLoading === user.id}
                          className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 disabled:opacity-50 p-2 rounded-lg transition-all duration-200"
                          title="Block"
                        >
                          <LockClosedIcon className="w-5 h-5" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={actionLoading === user.id}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 disabled:opacity-50 p-2 rounded-lg transition-all duration-200"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-6 text-gray-900">Approve User</h3>
            
            {selectedUserRole === 'client' ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID *
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter client ID"
                />
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID *
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter employee ID"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                disabled={actionLoading === selectedUserId}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm"
              >
                {actionLoading === selectedUserId ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}