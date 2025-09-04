"use client"
import { IUser } from '@/types';
import { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  LockClosedIcon, 
  LockOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

interface UserCardProps {
  user: IUser;
  onStatusUpdate: (userId: string, status: 'approved' | 'declined' | 'blocked', employeeId?: string, clientId?: string) => void;
  onUserUpdate?: (userId: string, updates: Partial<IUser>) => void;
  onUserDelete?: (userId: string) => void;
  onUserUnblock?: (userId: string) => void;
  isLoading?: boolean;
}

export default function UserCard({ user, onStatusUpdate, onUserUpdate, onUserDelete, onUserUnblock, isLoading }: UserCardProps) {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [clientId, setClientId] = useState('');
  const [editData, setEditData] = useState({
    fullname: user.fullname,
    email: user.email,
    number: user.number,
    role: user.role
  });

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

  const handleUnblock = () => {
    if (confirm('Are you sure you want to unblock this user?')) {
      onUserUnblock?.(user.id);
    }
  };

  const handleEdit = () => {
    if (onUserUpdate) {
      onUserUpdate(user.id, editData);
      setShowEditModal(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      onUserDelete?.(user.id);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{user.fullname}</h3>
              <p className="text-sm text-gray-600">@{user.name}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.accountStatus)} shadow-sm`}>
                  {user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)} shadow-sm`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            
              {/* Actions Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
                
                {showActionsMenu && (
                  <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10 min-w-[150px]">
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setShowActionsMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit User
                    </button>
                    
                    {user.accountStatus === 'blocked' ? (
                      <button
                        onClick={() => {
                          handleUnblock();
                          setShowActionsMenu(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50"
                      >
                        <LockOpenIcon className="w-4 h-4" />
                        Unblock User
                      </button>
                    ) : user.accountStatus === 'approved' && (
                      <button
                        onClick={() => {
                          handleBlock();
                          setShowActionsMenu(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                      >
                        <LockClosedIcon className="w-4 h-4" />
                        Block User
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowActionsMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete User
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Email:</span>
                <span className="text-gray-600 break-all">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Phone:</span>
                <span className="text-gray-600">{user.number}</span>
              </div>
              {user.employeeId && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Employee ID:</span>
                  <span className="text-gray-600">{user.employeeId}</span>
                </div>
              )}
              {user.clientId && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Client ID:</span>
                  <span className="text-gray-600">{user.clientId}</span>
                </div>
              )}
              <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                <span className="font-medium text-gray-700">Created:</span>
                <span className="text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* Admin Action Details */}
            {user.statusUpdatedByName && user.accountStatus !== 'pending' && (
              <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 -mx-6 px-6 py-3">
                <p className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">Last action by:</span> {user.statusUpdatedByName}
                </p>
                {user.statusUpdatedAt && (
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Date:</span> {new Date(user.statusUpdatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {user.accountStatus === 'pending' && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(true)}
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm"
              >
                <CheckCircleIcon className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={handleDecline}
                disabled={isLoading}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm"
              >
                <XCircleIcon className="w-4 h-4" />
                Decline
              </button>
            </div>
          )}

          {user.accountStatus === 'blocked' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-800 text-sm font-medium mb-3">This user is blocked</p>
              <button
                onClick={handleUnblock}
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto transition-colors duration-200 shadow-sm"
              >
                <LockOpenIcon className="w-4 h-4" />
                Unblock User
              </button>
            </div>
          )}

          {user.accountStatus === 'declined' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-800 text-sm font-medium">This user was declined</p>
            </div>
          )}

          {user.accountStatus === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-800 text-sm font-medium">✓ User is active and approved</p>
            </div>
          )}
      </div>

        {/* Approve Modal */}
        {showApproveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Approve User - {user.fullname}</h3>
              
              {user.role === 'client' ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client ID *
                  </label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm"
                >
                  {isLoading ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-200">
              <h3 className="text-lg font-semibold mb-6 text-gray-900">Edit User - {user.fullname}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editData.fullname}
                    onChange={(e) => setEditData({...editData, fullname: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    value={editData.number}
                    onChange={(e) => setEditData({...editData, number: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData({...editData, role: e.target.value as 'client' | 'hr' | 'employee'})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="client">Client</option>
                    <option value="hr">HR</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
