'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '../../components/layout/navbar';
import { Footer } from '../../components/layout/footer';
import { Sidebar } from '../../components/layout/sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useCouple } from '../../hooks/useCouple';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { couple } = useCouple();

  const showSidebar =
    isAuthenticated &&
    couple &&
    pathname.startsWith('/dashboard');

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {showSidebar ? (
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      ) : (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      )}
      <Footer />
    </div>
  );
}
