import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/layout/DashboardSidebar.jsx';
import DashboardNavbar from '../components/layout/DashboardNavbar.jsx';
import Footer from '../components/layout/Footer.jsx';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Sidebar for Desktop (fixed w-64) & Mobile (sliding drawer) */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main viewport offset by 64px left on large screens */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <DashboardNavbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
