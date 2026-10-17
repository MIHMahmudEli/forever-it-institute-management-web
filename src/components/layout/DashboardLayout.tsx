'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export default function DashboardLayout({
  children,
  title,
  showBack,
  backHref,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Desktop Sidebar (visible on lg screens and up) */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer (visible on screens below lg) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer Panel */}
          <div className="relative flex w-68 sm:w-72 max-w-[80vw] flex-1 flex-col shadow-2xl animate-in slide-in-from-left duration-200 z-10">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          title={title}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          showBack={showBack}
          backHref={backHref}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7 pb-24 sm:pb-24 lg:pb-7 scroll-smooth">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed at bottom on < lg screens) */}
      <BottomNav onOpenMenu={() => setMobileMenuOpen(true)} />
    </div>
  );
}
