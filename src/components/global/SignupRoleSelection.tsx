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
  requirements: string[];
}

const roleOptions: RoleOption[] = [
  {
    role: 'admin',
    title: 'Admin',
    description: 'System administrator with full access',
    color: 'bg-red-500 hover:bg-red-600',
    icon: '👑',
    requirements: ['Direct registration', 'No approval needed', 'Full system access']
  },
  {
    role: 'hr',
    title: 'HR Manager',
    description: 'Human Resources management',
    color: 'bg-blue-500 hover:bg-blue-600',
    icon: '👥',
    requirements: ['Admin approval required', 'Employee management access', 'Hiring permissions']
  },
  {
    role: 'employee',
    title: 'Employee',
    description: 'Team member and staff',
    color: 'bg-green-500 hover:bg-green-600',
    icon: '👨‍💼',
    requirements: ['Admin/HR approval required', 'Employee portal access', 'Basic permissions']
  },
  {
    role: 'client',
    title: 'Client',
    description: 'External client or partner',
    color: 'bg-purple-500 hover:bg-purple-600',
    icon: '🤝',
    requirements: ['Admin/HR approval required', 'Client portal access', 'Project collaboration']
  }
];

export default function SignupRoleSelection() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Navigate to role-specific signup page
    if (role === 'admin') {
      router.push('/admin/(auth)/signup');
    } else {
      router.push(`/${role}/(auth)/signup`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
      <div className="max-w-6xl w-full mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join EurosHub
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Choose your role to get started
          </p>
          <p className="text-sm text-gray-500">
            Select the option that best describes your role in the organization
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {roleOptions.map((option) => (
            <div
              key={option.role}
              onClick={() => handleRoleSelect(option.role)}
              className={`
                cursor-pointer transform transition-all duration-200 hover:scale-102 hover:shadow-xl
                bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-transparent
                ${selectedRole === option.role ? 'ring-4 ring-blue-300' : ''}
              `}
            >
              <div className="flex items-start space-x-4">
                <div className="text-5xl">{option.icon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {option.description}
                  </p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      What you get:
                    </h4>
                    <ul className="space-y-1">
                      {option.requirements.map((req, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className={`
                      w-full py-4 px-6 rounded-lg text-white font-medium text-lg
                      transition-colors duration-200 ${option.color}
                      shadow-lg hover:shadow-xl
                    `}
                  >
                    Sign up as {option.title}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Log in here
            </button>
          </p>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="text-yellow-600 mr-3">ℹ️</div>
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">
                Registration Process
              </h4>
              <p className="text-sm text-yellow-700">
                <strong>Admin:</strong> Direct registration with immediate access. 
                <strong> HR/Employee/Client:</strong> Registration requires email verification and admin approval before account activation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}