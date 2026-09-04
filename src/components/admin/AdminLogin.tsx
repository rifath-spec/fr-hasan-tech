import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight, ArrowLeft } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAdmin, navigate, settings } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await loginAdmin(email, password);
      if (success) {
        navigate('/admin/pos');
      } else {
        setError('Invalid email or password. Please verify your credentials or check connection.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4 sm:p-6">
      
      {/* Top back to public website */}
      <div className="w-full max-w-[420px] mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="text-xs font-semibold text-gray-600 hover:text-[#1E5AA8] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Public Website</span>
        </button>
        <span className="text-xs text-gray-400 font-mono">v1.0 Sri Lanka POS</span>
      </div>

      {/* Centered Login Card */}
      <div
        className="w-full max-w-[420px] bg-white rounded-xl shadow-soft-lg p-6 sm:p-8 border border-gray-200"
      >
        {/* Admin Logo 64x64px */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1E293B] text-white flex items-center justify-center shadow-md mb-4">
            <Shield className="w-8 h-8 text-[#F59E0B]" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Admin Login
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Sign in to manage your shop & point of sale
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lankaprint.lk"
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-md text-base text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors ${
                  error ? 'border-red-500 bg-red-50/20' : 'border-gray-300 focus:border-[#1E5AA8] focus:ring-1 focus:ring-[#1E5AA8]'
                }`}
              />
            </div>
          </div>

          {/* Password Field with show/hide toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate('/admin/forgot-password')}
                className="text-xs text-[#1E5AA8] hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-11 py-3 bg-white border rounded-md text-base text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors ${
                  error ? 'border-red-500 bg-red-50/20' : 'border-gray-300 focus:border-[#1E5AA8] focus:ring-1 focus:ring-[#1E5AA8]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Sign In Button (Full width, Primary) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-[#1E5AA8] hover:bg-[#164785] text-white font-bold rounded-md active-press shadow-soft-sm transition-all text-base flex items-center justify-center gap-2 min-h-[48px] mt-6"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Security Note */}
      <p className="text-xs text-gray-500 mt-6 text-center">
        Restricted Access • Authorized Shop Personnel Only
      </p>
    </div>
  );
};
