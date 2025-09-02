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
  BuildingOfficeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
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
    name: 'Project Management',
    href: '/admin/projects',
    icon: BriefcaseIcon,
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
    name: 'Project Management',
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
    name: 'Project Management',
    href: '/hr/projects',
    icon: BriefcaseIcon,
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
    name: 'Project Management',
    href: '/employee/projects',
    icon: BriefcaseIcon,
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
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !session?.user) {
    return (
      <div
        className={`bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-72'
        } ${
          isOpen ? 'fixed inset-y-0 left-0 z-50 translate-x-0' : 'fixed inset-y-0 left-0 z-50 -translate-x-full'
        } lg:relative lg:translate-x-0 lg:z-auto`}
      >
        <div className="flex flex-col h-full min-h-0 animate-pulse">
          {/* Loading Header */}
          <div className={`flex items-center border-b border-gray-200 transition-all duration-300 ${
            isCollapsed ? 'justify-center p-4' : 'justify-between p-6'
          }`}>
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
              </div>
            )}
            <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Loading User Info */}
          <div className={`border-b border-gray-200 transition-all duration-300 ${
            isCollapsed ? 'p-3' : 'p-6'
          }`}>
            <div className={`flex items-center transition-all duration-300 ${
              isCollapsed ? 'justify-center' : 'space-x-3'
            }`}>
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              {!isCollapsed && (
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              )}
            </div>
          </div>

          {/* Loading Navigation */}
          <nav className={`flex-1 py-6 space-y-1 transition-all duration-300 ${
            isCollapsed ? 'px-2' : 'px-4'
          }`}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex items-center rounded-xl transition-all duration-200 ${
                  isCollapsed ? 'justify-center p-3 w-12 h-12 mx-auto' : 'px-4 py-3'
                }`}
              >
                <div className={`bg-gray-200 rounded ${
                  isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'
                }`}></div>
                {!isCollapsed && <div className="h-4 bg-gray-200 rounded flex-1"></div>}
              </div>
            ))}
          </nav>
        </div>
      </div>
    );
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
        className={`bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-72'
        } ${
          isOpen ? 'fixed inset-y-0 left-0 z-50 translate-x-0' : 'fixed inset-y-0 left-0 z-50 -translate-x-full'
        } lg:relative lg:translate-x-0 lg:z-auto`}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className={`flex items-center border-b border-gray-200 transition-all duration-300 ${
            isCollapsed ? 'justify-center p-4' : 'justify-between p-6'
          }`}>
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Euroshub
                </h1>
              </div>
            )}
            
            {/* Collapse/Expand Button - Desktop only */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRightIcon className="w-5 h-5" />
              ) : (
                <ChevronLeftIcon className="w-5 h-5" />
              )}
            </button>
            
            {/* Close Button - Mobile only */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className={`border-b border-gray-200 transition-all duration-300 ${
            isCollapsed ? 'p-3' : 'p-6'
          }`}>
            <div className={`flex items-center transition-all duration-300 ${
              isCollapsed ? 'justify-center' : 'space-x-3'
            }`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center ring-2 ring-blue-200 shadow-sm">
                <span className="text-blue-600 font-semibold text-sm">
                  {session.user.fullname?.charAt(0).toUpperCase()}
                </span>
              </div>
              {!isCollapsed && (
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
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 py-6 space-y-1 transition-all duration-300 min-h-0 ${
            isCollapsed ? 'px-2 overflow-hidden' : 'px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'
          }`}>
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center text-sm font-medium rounded-xl transition-all duration-200 relative ${
                    isCollapsed ? 'justify-center p-3 w-12 h-12 mx-auto flex-shrink-0' : 'px-4 py-3'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                  onClick={() => {
                    // Close mobile sidebar when navigation item is clicked
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
                >
                  <Icon
                    className={`transition-all duration-200 ${
                      isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'
                    } ${
                      isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                      {item.name}
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                © 2025 Euroshub CRM
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}