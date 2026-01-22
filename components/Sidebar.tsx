'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Users, GitCompare, Upload, PanelLeftClose, PanelLeftOpen, HelpCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState, createContext, useContext } from 'react';

// Create context for sidebar state
const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}>({
  collapsed: false,
  setCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

const navItems = [
  {
    label: 'Competitors',
    href: '/competitors',
    icon: Users,
  },
  {
    label: 'Comparison Matrix',
    href: '/comparison-matrix',
    icon: GitCompare,
  },
  {
    label: 'Import CSV',
    href: '/import-csv',
    icon: Upload,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ collapsed, onToggle, onMobileClose, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which logo to show
  const logoSrc = mounted && resolvedTheme === 'light' ? '/logo-dark.png' : '/logo-light.png';

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 bottom-0 bg-bg-sidebar border-r border-border flex flex-col transition-all duration-300 ease-in-out z-50",
        // On mobile: always full width sidebar
        // On desktop: respect collapsed state
        isMobile ? "w-sidebar" : (collapsed ? "w-sidebar-collapsed" : "w-sidebar")
      )}
    >
      {/* Mobile close button */}
      {isMobile && onMobileClose && (
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary hover:bg-bg-card-hover rounded-lg transition-all lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Logo Section */}
      <div className={cn(
        "border-b border-border transition-all duration-300",
        (collapsed && !isMobile) ? "px-3 pt-6 pb-4" : "px-6 pt-6 pb-4"
      )}>
        <div className="flex items-center justify-center">
          {(collapsed && !isMobile) ? (
            // Show just "EH" or icon when collapsed (desktop only)
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EH</span>
            </div>
          ) : (
            <Image
              src={logoSrc}
              alt="Escape Hatch"
              width={180}
              height={45}
              className="object-contain"
              style={{ width: 'auto', height: '32px' }}
              priority
            />
          )}
        </div>
        {(!collapsed || isMobile) && (
          <p className="mt-5 text-[10px] uppercase tracking-[0.2em] text-text-muted font-medium text-center">
            Competitor Intelligence
          </p>
        )}
      </div>

      {/* Collapse button - hidden on mobile */}
      <div className={cn(
        "py-2 border-b border-border hidden lg:block",
        (collapsed && !isMobile) ? "px-2" : "px-3"
      )}>
        <button 
          onClick={onToggle}
          className={cn(
            "p-2 text-text-muted hover:text-text-primary hover:bg-bg-card-hover rounded-md transition-all duration-150",
            (collapsed && !isMobile) && "w-full flex justify-center"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {(collapsed && !isMobile) ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 py-4",
        (collapsed && !isMobile) ? "px-2" : "px-3"
      )}>
        {(!collapsed || isMobile) && (
          <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.15em] text-text-muted font-semibold">
            Research
          </p>
        )}
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            const showCollapsed = collapsed && !isMobile;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={showCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center rounded-lg transition-all duration-150',
                  showCollapsed 
                    ? 'justify-center p-3' 
                    : 'gap-3 px-3 py-2.5',
                  isActive
                    ? showCollapsed
                      ? 'text-text-primary bg-bg-card shadow-sm'
                      : 'text-text-primary bg-bg-card border-l-2 border-primary ml-0 pl-[10px] shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
                )}
              >
                <Icon className={cn(
                  showCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
                )} />
                {!showCollapsed && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Help box - Only show when expanded */}
      {(!collapsed || isMobile) && (
        <div className="p-3 mx-3 mb-4 bg-bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-text-secondary leading-relaxed">
              Add competitors, attach source URLs, extract claims, and compare against Escape Hatch's baseline.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
