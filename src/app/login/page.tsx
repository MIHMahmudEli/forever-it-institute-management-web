'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { api, ApiError } from '@/lib/api/api-client';
import BrandLogo from '@/components/ui/BrandLogo';
import CornerRibbons from '@/components/ui/CornerRibbons';
import { Lock, Mail, ArrowRight, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col justify-center items-center p-4 relative select-none">
      {/* Decorative Brand Corner Ribbons */}
      <CornerRibbons position="all" />

      {/* Main Login Card - Compact & Fitting 100vh */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xl shadow-slate-200/60 relative overflow-hidden">
          {/* Top Brand Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#006838]" />

          {/* Header Branding */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="mb-2">
              <BrandLogo variant="full" theme="light" />
            </div>
            <div className="mt-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-[10px] text-[#006838] font-bold border border-emerald-200 tracking-wide">
                দক্ষতা গড়ুন, গড়ুন সফল ভবিষ্যৎ
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-800 uppercase tracking-wider mt-3">
              Management Portal Login
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized Staff &amp; Administrator Access
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 flex items-start space-x-2.5 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-[#D81A22] shrink-0 mt-0.5" />
              <span className="leading-tight">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@foreveritbd.com"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#006838] focus:border-[#006838] transition-smooth-fast"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#006838] focus:border-[#006838] transition-smooth-fast"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center py-2.5 px-4 rounded-lg text-xs font-bold text-white bg-[#006838] hover:bg-[#015333] active:bg-[#004225] shadow-md shadow-emerald-900/10 focus:outline-hidden focus:ring-2 focus:ring-[#006838] focus:ring-offset-1 transition-smooth disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credentials for Evaluation */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] text-center font-medium text-slate-500 mb-2 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3 text-[#006838]" /> Quick Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="py-1.5 px-2 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100/80 text-[#006838] border border-emerald-200/80 text-center transition-smooth-fast"
              >
                Admin (Full Access)
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('staff')}
                className="py-1.5 px-2 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-center transition-smooth-fast"
              >
                Staff (Officer)
              </button>
            </div>
          </div>
        </div>

        {/* Corporate Address Footer */}
        <div className="mt-4 text-center text-[11px] text-slate-400 space-y-0.5">
          <p>
            <span className="font-semibold text-slate-600">Forever IT Institute</span> • Banasree, Dhaka
          </p>
          <p>
            <a
              href="https://www.foreveritbd.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#006838] hover:underline font-medium"
            >
              www.foreveritbd.com
            </a>{' '}
            • Helpline: <span className="font-medium text-slate-600">+8801762367001</span>
          </p>
        </div>
      </div>
    </div>
  );
}
