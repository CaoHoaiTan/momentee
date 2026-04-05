'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { Navbar } from '../../components/layout/navbar';
import { Footer } from '../../components/layout/footer';
import { Sidebar } from '../../components/layout/sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useCouple } from '../../hooks/useCouple';
import { REQUEST_EMAIL_VERIFICATION_MUTATION } from '../../graphql/mutations/auth.mutations';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { couple } = useCouple();
  const [resendVerification, { loading: resending, data: resent }] = useMutation<{ requestEmailVerification: boolean }>(REQUEST_EMAIL_VERIFICATION_MUTATION);

  const showSidebar =
    isAuthenticated &&
    couple &&
    pathname.startsWith('/dashboard');

  const showVerifyBanner = isAuthenticated && user && !user.emailVerified;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {showVerifyBanner && (
        <div className="border-b border-yellow-200 bg-yellow-50 px-4 py-2.5 text-center text-sm">
          <span className="text-yellow-800">
            Please verify your email address.
          </span>
          {resent?.requestEmailVerification ? (
            <span className="ml-2 font-medium text-green-600">Sent! Check your inbox.</span>
          ) : (
            <button
              onClick={() => resendVerification().catch(() => {})}
              disabled={resending}
              className="ml-2 font-medium text-[var(--color-coral)] hover:underline disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>
          )}
        </div>
      )}
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
