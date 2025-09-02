import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  User,
  TrendingUp,
  Palette,
  Bell,
  Shield,
  Database,
  Smartphone,
  Settings as SettingsIcon,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../utils/cn';

interface SettingsLayoutProps {
  className?: string;
}

const settingsNavItems = [
  {
    id: 'account',
    label: 'Account Settings',
    icon: User,
    path: '/settings/account',
    description: 'Profile, password, and account management'
  },
  {
    id: 'mt5',
    label: 'MT5 Connections',
    icon: TrendingUp,
    path: '/settings/mt5',
    description: 'Trading platform connections and credentials'
  },
  {
    id: 'trading',
    label: 'Trading Preferences',
    icon: TrendingUp,
    path: '/settings/trading',
    description: 'Order defaults and risk management'
  },
  {
    id: 'ui',
    label: 'UI Customization',
    icon: Palette,
    path: '/settings/ui',
    description: 'Theme, layout, and display preferences'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    path: '/settings/notifications',
    description: 'Email, push, and alert settings'
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    path: '/settings/security',
    description: 'Login history and session management'
  },
  {
    id: 'data',
    label: 'Data & Backup',
    icon: Database,
    path: '/settings/data',
    description: 'Export, backup, and privacy settings'
  },
  {
    id: 'mobile',
    label: 'Mobile Settings',
    icon: Smartphone,
    path: '/settings/mobile',
    description: 'Haptic feedback, PWA, and mobile optimization'
  }
];

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ className }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className={cn('flex h-full bg-gray-50 dark:bg-gray-900', className)}>
      {/* Sidebar */}
      <div className={cn(
        'flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-80'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Settings
              </h1>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              'p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
              sidebarCollapsed && 'mx-auto'
            )}
          >
            <ChevronLeft className={cn(
              'w-4 h-4 text-gray-500 transition-transform',
              sidebarCollapsed && 'rotate-180'
            )} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                  sidebarCollapsed && 'justify-center'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5 flex-shrink-0',
                  sidebarCollapsed && 'w-6 h-6'
                )} />
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {item.description}
                    </div>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Settings are automatically saved
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your account preferences and trading configuration
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;