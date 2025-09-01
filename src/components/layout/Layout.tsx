import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { useSidebarCollapsed } from '../../store';
import { cn } from '../../utils/cn';

export const Layout: React.FC = () => {
  const sidebarCollapsed = useSidebarCollapsed();

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main
        className={cn(
          'transition-all duration-300 pt-16 pb-12',
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};