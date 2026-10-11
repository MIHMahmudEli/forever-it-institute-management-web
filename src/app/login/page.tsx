'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { api, ApiError } from '@/lib/api/api-client';
import BrandLogo from '@/components/ui/BrandLogo';
import CornerRibbons from '@/components/ui/CornerRibbons';
import { Lock, Mail, ArrowRight, AlertCircle, Shield } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.auth.login({ email, password });
      login(res.accessToken, res.user);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials and server connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role: 'admin' | 'staff') => {
    if (role === 'admin') {
      setEmail('admin@foreveritbd.com');
      setPassword('Admin123456!');
    } else {
      setEmail('staff@foreveritbd.com');
      setPassword('Staff123456!');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#015333] via-slate-900 to-black">
      {/* Brand Corner Ribbons */}
      <CornerRibbons position="all" />

      {/* Center Container */}
      <div className="relative z-20 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Card */}
        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl relative overflow-hidden">
          {/* Subtle top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D81A22] via-[#006838] to-[#D81A22]" />

          {/* Official Brand Logo */}
          <div className="mb-6 flex justify-center">
            <BrandLogo variant="full" theme="light" />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">
              Management Portal Login
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure Staff &amp; Administrator Access
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-start space-x-3 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-[#D81A22] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@foreveritbd.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#006838] focus:border-[#006838] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#006838] focus:border-[#006838] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#006838] hover:bg-[#015333] active:bg-[#004225] shadow-lg shadow-emerald-950/20 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] text-center font-medium text-slate-500 mb-2 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3 text-[#006838]" /> Quick Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="py-1.5 px-2 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#006838] border border-emerald-200 text-center transition-colors"
              >
                Admin (Full Access)
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('staff')}
                className="py-1.5 px-2 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#006838] border border-emerald-200 text-center transition-colors"
              >
                Staff (Officer)
              </button>
            </div>
          </div>
        </div>

        {/* Corporate Details Footer */}
        <div className="mt-6 text-center text-xs text-white/70 space-y-1">
          <p>
            <span className="font-semibold text-white">Forever IT Institute</span> • Banasree, Dhaka
          </p>
          <p>
            Official Website:{' '}
            <a
              href="https://www.foreveritbd.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-300 hover:underline font-medium"
            >
              www.foreveritbd.com
            </a>{' '}
            • Helpline: <span className="text-emerald-300 font-medium">+8801762367001</span>
          </p>
        </div>
      </div>
    </div>
  );
}
