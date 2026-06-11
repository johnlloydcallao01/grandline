"use client";

import React, { createContext, useContext, useState } from "react";
import { Header, Sidebar } from "@/components/layout";

interface InstructorDashboardProps {
  children?: React.ReactNode;
}

interface DashboardContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within InstructorDashboard');
  }
  return context;
}

export function InstructorDashboard({ children }: InstructorDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const dashboardValue: DashboardContextType = {
    sidebarOpen,
    toggleSidebar,
  };

  return (
    <DashboardContext.Provider value={dashboardValue}>
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <Sidebar />
        <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-60' : 'lg:ml-20'}`}>
          <div className="min-h-full px-[10px]">
            {children}
          </div>
        </main>
      </div>
    </DashboardContext.Provider>
  );
}
