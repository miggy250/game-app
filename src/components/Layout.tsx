import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Package, 
  Send, 
  PackagePlus, 
  Settings, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  Menu,
  Package2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink to={to}>
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent',
          isActive && 'bg-primary text-primary-foreground hover:bg-primary/90',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
      </div>
    </NavLink>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { profile, signOut, isAdmin, canManageInventory } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    ...(canManageInventory ? [
      { to: '/stock-entries', icon: PackagePlus, label: 'Stock Entries' },
    ] : []),
    { to: '/distributions', icon: Send, label: 'Distributions' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-3 py-4 border-b',
        collapsed && 'justify-center px-2'
      )}>
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Package2 className="w-6 h-6 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-lg truncate">RTB Inventory</h1>
            <p className="text-xs text-muted-foreground truncate">Management System</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className={cn(
        'border-t p-3 space-y-3',
        collapsed && 'px-2'
      )}>
        {!collapsed && (
          <div className="px-2">
            <p className="font-medium text-sm truncate">{profile?.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn('w-full', collapsed ? 'px-2' : 'justify-start')}
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-card border-r transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent />
        
        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 -right-3 h-6 w-6 rounded-full border bg-background shadow-sm hidden md:flex"
          style={{ left: collapsed ? '52px' : '248px' }}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b z-40 flex items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Package2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold">RTB Inventory</span>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-card border-r z-50 flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="md:hidden h-14" /> {/* Spacer for mobile header */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
