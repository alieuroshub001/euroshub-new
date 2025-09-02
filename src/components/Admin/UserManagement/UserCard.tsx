"use client"
import { IUser } from '@/types';
import { useState } from 'react';

interface UserCardProps {
  user: IUser;
  onStatusUpdate: (userId: string, status: 'approved' | 'declined' | 'blocked', employeeId?: string, clientId?: string) => void;
  isLoading?: boolean;
}

export default function UserCard({ user, onStatusUpdate, isLoading }: UserCardProps) {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [clientId, setClientId] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'blocked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client': return 'bg-blue-100 text-blue-800';
      case 'hr': return 'bg-purple-100 text-purple-800';
      case 'employee': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = () => {
    if (user.role === 'client' && !clientId) {
      alert('Client ID is required');
      return;
    }
    if ((user.role === 'hr' || user.role === 'employee') && !employeeId) {
      alert('Employee ID is required');
      return;
    }

    onStatusUpdate(user.id, 'approved', employeeId, clientId);
    setShowApproveModal(false);
    setEmployeeId('');
    setClientId('');
  };

  const handleDecline = () => {
    if (confirm('Are you sure you want to decline this user?')) {
      onStatusUpdate(user.id, 'declined');
    }
  };

  const handleBlock = () => {
    if (confirm('Are you sure you want to block this user?')) {
      onStatusUpdate(user.id, 'blocked');
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.fullname}</h3>
            <p className="text-sm text-gray-600">@{user.name}</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.accountStatus)}`}>
              {user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm"><span className="font-medium">Email:</span> {user.email}</p>
          <p className="text-sm"><span className="font-medium">Phone:</span> {user.number}</p>
          {user.employeeId && (
            <p className="text-sm"><span className="font-medium">Employee ID:</span> {user.employeeId}</p>
          )}
          {user.clientId && (
            <p className="text-sm"><span className="font-medium">Client ID:</span> {user.clientId}</p>
          )}
          <p className="text-sm"><span className="font-medium">Created:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>

        {user.accountStatus === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowApproveModal(true)}
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={handleDecline}
              disabled={isLoading}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
            >
              Decline
            </button>
          </div>
        )}

        {user.accountStatus === 'approved' && (
          <button
            onClick={handleBlock}
            disabled={isLoading}
            className="w-full bg-gray-600 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-700 disabled:opacity-50"
          >
            Block User
          </button>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Approve User - {user.fullname}</h3>
            
            {user.role === 'client' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID *
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter client ID"
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID *
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter employee ID"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}