'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to localStorage
  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  // Close mobile sidebar when clicking outside
  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg-app">
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleMobileClose}
        />
      )}

      {/* Sidebar - hidden on mobile unless open */}
      <div className={cn(
        "lg:block",
        mobileOpen ? "block" : "hidden"
      )}>
        <Sidebar 
          collapsed={collapsed} 
          onToggle={handleToggle}
          onMobileClose={handleMobileClose}
          isMobile={mobileOpen}
        />
      </div>
      
      {/* Main content area - full width on mobile */}
      <main className={cn(
        "min-h-screen transition-all duration-300 ease-in-out",
        // On mobile: no margin (full width)
        // On desktop: respect sidebar width
        "ml-0 lg:ml-sidebar",
        collapsed && "lg:ml-sidebar-collapsed"
      )}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-bg-app backdrop-blur-sm border-b border-border px-4 lg:px-8 py-3 flex items-center justify-between">
          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-text-muted hover:text-text-primary hover:bg-bg-card-hover rounded-lg transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1" />
          
          <ThemeToggle />
        </div>
        
        {/* Page content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
