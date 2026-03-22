'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { NotificationBell } from './notification-bell';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/momentee_logo/momentee-logo-primary.svg" alt="Momentee" className="h-8" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/explore" className="text-sm font-medium text-gray-600 transition-colors hover:text-[var(--color-coral)]">
            Explore
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-gray-600 transition-colors hover:text-[var(--color-coral)]">
            Pricing
          </Link>
        </div>

        {/* Auth Buttons / User Menu */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <Link href="/dashboard" className="flex items-center gap-2 rounded-full bg-gray-50 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-gray-100">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-coral)] to-[var(--color-orange)] text-xs font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} className="text-gray-400 hover:text-gray-600">
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="!rounded-full">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="flex items-center md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/explore" className="text-sm font-medium text-gray-600 hover:text-[var(--color-coral)]" onClick={() => setMobileMenuOpen(false)}>
              Explore
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-[var(--color-coral)]" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </Link>
            <hr className="border-gray-100" />
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-coral)] to-[var(--color-orange)] text-sm font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">Login</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full !rounded-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
