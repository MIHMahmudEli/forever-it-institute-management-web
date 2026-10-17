'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { X } from 'lucide-react';

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
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-full max-w-[280px] sm:max-w-xs flex-1 flex-col bg-[#015333] shadow-2xl animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-3.5 right-3.5 z-10 p-2 text-emerald-200 hover:text-white rounded-xl bg-emerald-900/50 hover:bg-emerald-900 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
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
