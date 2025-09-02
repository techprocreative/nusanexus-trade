import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Brain, 
  PieChart, 
  Settings, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Wrench,
  MessageSquare,
  BookOpen,
  Lightbulb,
  Hammer
} from 'lucide-react';
import { useSidebarCollapsed, useUIStore } from '../../store';
import { cn } from '../../utils/cn';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Live Trading',
    href: '/trading',
    icon: TrendingUp,
  },
  {
    name: 'Strategies',
    href: '/strategies',
    icon: Brain,
  },
  {
    name: 'Strategy Builder',
    href: '/strategies/builder',
    icon: Hammer,
  },
  {
    name: 'AI Analysis',
    href: '/ai-analysis',
    icon: Activity,
  },
  {
    name: 'Interactive Tools',
    href: '/interactive-tools',
    icon: Wrench,
  },
  {
    name: 'Portfolio',
    href: '/portfolio',
    icon: PieChart,
  },
  {
    name: 'User Feedback',
    href: '/feedback',
    icon: MessageSquare,
  },
  {
    name: 'Educational Hub',
    href: '/education',
    icon: BookOpen,
  },
  {
    name: 'Implementation',
    href: '/implementation',
    icon: Lightbulb,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export const Sidebar: React.FC = () => {
  const sidebarCollapsed = useSidebarCollapsed();
  const { toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-background-secondary border-r border-gray-700 transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-700">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">NusaNexus</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                  'hover:bg-gray-700 hover:text-white',
                  isActive
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-300',
                  sidebarCollapsed ? 'justify-center' : 'justify-start'
                )
              }
              title={sidebarCollapsed ? item.name : undefined}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0', !sidebarCollapsed && 'mr-3')} />
              {!sidebarCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        {!sidebarCollapsed && (
          <div className="text-xs text-gray-500">
            <p>Version 1.0.0</p>
            <p className="mt-1">© 2024 NusaNexus</p>
          </div>
        )}
      </div>
    </aside>
  );
};