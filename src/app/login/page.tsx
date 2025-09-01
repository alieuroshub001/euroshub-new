'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '../../types/user-roles';

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  color: string;
  icon: string;
}

const roleOptions: RoleOption[] = [
  {
    role: 'admin',
    title: 'Admin',
    description: 'System administrator with full access',
    color: 'bg-red-500 hover:bg-red-600',
    icon: '👑'
  },
  {
    role: 'hr',
    title: 'HR Manager',
    description: 'Human Resources management',
    color: 'bg-blue-500 hover:bg-blue-600',
    icon: '👥'
  },
  {
    role: 'employee',
    title: 'Employee',
    description: 'Team member and staff',
    color: 'bg-green-500 hover:bg-green-600',
    icon: '👨‍💼'
  },
  {
    role: 'client',
    title: 'Client',
    description: 'External client or partner',
    color: 'bg-purple-500 hover:bg-purple-600',
    icon: '🤝'
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Navigate to role-specific login page
    router.push(`/${role}/(auth)/login`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to EurosHub
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Choose your role to continue logging in
          </p>
          <p className="text-sm text-gray-500">
            Select the option that best describes your role in the organization
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roleOptions.map((option) => (
            <div
              key={option.role}
              onClick={() => handleRoleSelect(option.role)}
              className={`
                cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg
                bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-transparent
                ${selectedRole === option.role ? 'ring-4 ring-blue-300' : ''}
              `}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{option.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {option.description}
                </p>
                <button
                  className={`
                    w-full py-3 px-4 rounded-lg text-white font-medium
                    transition-colors duration-200 ${option.color}
                  `}
                >
                  Continue as {option.title}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}