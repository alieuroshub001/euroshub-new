"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  XMarkIcon,
  Bars3Icon,
  UserGroupIcon,
  BriefcaseIcon,
  ClipboardDocumentListIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: HomeIcon,
    roles: ['admin']
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: UsersIcon,
    roles: ['admin']
  },
  {
    name: 'System Settings',
    href: '/admin/settings',
    icon: CogIcon,
    roles: ['admin']
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: ChartBarIcon,
    roles: ['admin']
  },
  // Client Navigation
  {
    name: 'Dashboard',
    href: '/client',
    icon: HomeIcon,
    roles: ['client']
  },
  {
    name: 'Projects',
    href: '/client/projects',
    icon: BriefcaseIcon,
    roles: ['client']
  },
  {
    name: 'Documents',
    href: '/client/documents',
    icon: DocumentTextIcon,
    roles: ['client']
  },
  {
    name: 'Support',
    href: '/client/support',
    icon: UserGroupIcon,
    roles: ['client']
  },
  // HR Navigation
  {
    name: 'Dashboard',
    href: '/hr',
    icon: HomeIcon,
    roles: ['hr']
  },
  {
    name: 'Employees',
    href: '/hr/employees',
    icon: UsersIcon,
    roles: ['hr']
  },
  {
    name: 'Recruitment',
    href: '/hr/recruitment',
    icon: UserGroupIcon,
    roles: ['hr']
  },
  {
    name: 'Performance',
    href: '/hr/performance',
    icon: ChartBarIcon,
    roles: ['hr']
  },
  {
    name: 'Payroll',
    href: '/hr/payroll',
    icon: ClipboardDocumentListIcon,
    roles: ['hr']
  },
  // Employee Navigation
  {
    name: 'Dashboard',
    href: '/employee',
    icon: HomeIcon,
    roles: ['employee']
  },
  {
    name: 'My Tasks',
    href: '/employee/tasks',
    icon: ClipboardDocumentListIcon,
    roles: ['employee']
  },
  {
    name: 'Time Tracking',
    href: '/employee/timesheet',
    icon: ChartBarIcon,
    roles: ['employee']
  },
  {
    name: 'Documents',
    href: '/employee/documents',
    icon: DocumentTextIcon,
    roles: ['employee']
  },
  {
    name: 'Company',
    href: '/employee/company',
    icon: BuildingOfficeIcon,
    roles: ['employee']
  }
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !session?.user) {
    return null;
  }

  const userRole = session.user.role;
  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const isActivePath = (href: string) => {
    if (href === `/${userRole}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Euroshub</h1>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {session.user.fullname?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user.fullname}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)}
                </p>
                {(session.user.employeeId || session.user.clientId) && (
                  <p className="text-xs text-blue-600 truncate">
                    ID: {session.user.employeeId || session.user.clientId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => {
                    // Close mobile sidebar when navigation item is clicked
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
                >
                  <Icon
                    className={`w-5 h-5 mr-3 ${
                      isActive ? 'text-blue-700' : 'text-gray-400'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © 2024 Euroshub CRM
            </div>
          </div>
        </div>
      </div>
    </>
  );
}