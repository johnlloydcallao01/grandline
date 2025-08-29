"use client";

import React, { createContext, useContext, useState } from "react";
import { Header, Sidebar } from "@/components/layout";

interface AdminDashboardProps {
  children?: React.ReactNode;
}

// Dashboard context for managing layout state
interface DashboardContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleSearch = (_query: string) => {
    // TODO: Implement admin search functionality
  };

  const dashboardValue: DashboardContextType = {
    sidebarOpen,
    toggleSidebar,
  };

  return (
    <DashboardContext.Provider value={dashboardValue}>
      <div className="min-h-screen bg-gray-50">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          onSearch={handleSearch}
        />
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />
        <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-20'}`}>
          {children || <DefaultDashboardContent />}
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
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Contacts</h3>
          <p className="text-2xl font-bold text-gray-900">42</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">New Contacts</h3>
          <p className="text-2xl font-bold text-blue-600">7</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Subscribers</h3>
          <p className="text-2xl font-bold text-gray-900">156</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Subscribers</h3>
          <p className="text-2xl font-bold text-green-600">134</p>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Welcome to Admin Dashboard
        </h2>
        <p className="text-gray-600">
          You are now authenticated and have access to the admin control panel.
        </p>
      </div>
    </div>
  );
}




