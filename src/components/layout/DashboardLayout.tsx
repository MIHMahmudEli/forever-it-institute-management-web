'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { X } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar (visible on lg screens and up) */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer (visible on screens below lg) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-[#08442a] shadow-2xl animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 text-emerald-200 hover:text-white rounded-lg cursor-pointer"
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
        <Header title={title} onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-7">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
