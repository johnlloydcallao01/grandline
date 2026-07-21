"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AccountingSidebar, Header, Sidebar } from "@/components/layout";

interface AdminDashboardProps {
  children?: React.ReactNode;
}

// Dashboard context for managing layout state
interface DashboardContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within AdminDashboard');
  }
  return context;
}

/**
 * Admin Dashboard component - Main admin layout
 *
 * This component orchestrates the main admin layout with header, sidebar, and content areas.
 * It maintains layout state and provides a proper SPA experience.
 */
export function AdminDashboard({ children }: AdminDashboardProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Check if we are on the builder page
  const isBuilderPage = pathname?.startsWith('/certifications/builder');
  const isAccountingPage = pathname?.startsWith('/accounting');

  // Automatically close sidebar on builder page
  useEffect(() => {
    if (isBuilderPage) {
      setSidebarOpen(false);
    }
  }, [isBuilderPage]);

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when the mobile drawer is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileSidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(prev => !prev);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const handleSearch = (_query: string) => {
    // TODO: Implement admin search functionality
  };

  const dashboardValue: DashboardContextType = {
    sidebarOpen,
    toggleSidebar,
    mobileSidebarOpen,
    toggleMobileSidebar,
    closeMobileSidebar,
  };

  return (
    <DashboardContext.Provider value={dashboardValue}>
      <div className="min-h-screen bg-[var(--background)]">
        {!isBuilderPage && (
          <Header
            sidebarOpen={sidebarOpen}
            onToggleSidebar={toggleSidebar}
            onToggleMobileSidebar={toggleMobileSidebar}
            onSearch={handleSearch}
          />
        )}
        {!isBuilderPage && (
          isAccountingPage ? (
            <AccountingSidebar
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
              mobileOpen={mobileSidebarOpen}
              onCloseMobile={closeMobileSidebar}
            />
          ) : (
            <Sidebar
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
              mobileOpen={mobileSidebarOpen}
              onCloseMobile={closeMobileSidebar}
            />
          )
        )}
        <main className={`transition-all duration-300 ${!isBuilderPage && sidebarOpen ? 'lg:ml-60' : !isBuilderPage ? 'lg:ml-20' : ''}`}>
          <div className={`min-h-full ${!isBuilderPage ? (isAccountingPage ? 'overflow-x-hidden' : 'px-3 py-4 sm:px-[10px] sm:py-0') : ''}`}>
            {children || <DefaultDashboardContent />}
          </div>
        </main>
      </div>
    </DashboardContext.Provider>
  );
}

/**
 * Default dashboard content when no children are provided
 */
function DefaultDashboardContent() {
  return (
    <div className="p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-[var(--card-background)] rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Contacts</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">42</p>
        </div>
        <div className="bg-white dark:bg-[var(--card-background)] rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">New Contacts</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">7</p>
        </div>
        <div className="bg-white dark:bg-[var(--card-background)] rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Subscribers</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">156</p>
        </div>
        <div className="bg-white dark:bg-[var(--card-background)] rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Subscribers</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">134</p>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-white dark:bg-[var(--card-background)] rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Welcome to Admin Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Access your admin control panel and manage your content.
        </p>
      </div>
    </div>
  );
}




