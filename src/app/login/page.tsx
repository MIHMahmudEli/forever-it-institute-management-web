'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { api, ApiError } from '@/lib/api/api-client';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0d5c3a]/40 via-slate-900 to-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand Logo & Title */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-black text-2xl shadow-lg shadow-emerald-950/50 mb-4">
          FIT
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
          Forever IT Institute
        </h1>
        <p className="mt-1 text-sm font-bangla text-emerald-400 font-medium">
          দক্ষতা গড়ুন, গড়ুন সফল ভবিষ্যৎ
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Institute Management & Digital Registration System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-800/90 border border-slate-700/80 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl">
          {error && (
            <div className="mb-6 rounded-lg bg-red-950/60 border border-red-800/60 p-3.5 flex items-start space-x-3 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@foreveritbd.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-lg shadow-emerald-900/40 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 transition-all disabled:opacity-50"
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

          {/* Demo Quick Fill Helper */}
          <div className="mt-6 pt-6 border-t border-slate-700/60">
            <p className="text-[11px] text-center font-medium text-slate-400 mb-2.5">
              Quick Test Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="py-1.5 px-2 text-xs font-medium rounded-md bg-slate-700/70 hover:bg-slate-700 text-emerald-300 border border-slate-600 text-center transition-colors"
              >
                Fill Admin (Full)
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('staff')}
                className="py-1.5 px-2 text-xs font-medium rounded-md bg-slate-700/70 hover:bg-slate-700 text-emerald-300 border border-slate-600 text-center transition-colors"
              >
                Fill Staff (Officer)
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Official Portal: <span className="text-slate-400">www.foreveritbd.com</span> • Timezone: Asia/Dhaka
        </p>
      </div>
    </div>
  );
}
