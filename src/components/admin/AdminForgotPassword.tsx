import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminForgotPassword: React.FC = () => {
  const { navigate } = useApp();
  const [email, setEmail] = useState('admin@frhasantech.com');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] bg-white rounded-xl shadow-soft-lg p-6 sm:p-8 border border-gray-200"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F0FE] text-[#1E5AA8] flex items-center justify-center mb-3">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Enter your email and we’ll send you a password reset link
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Check Your Email</h3>
              <p className="text-xs text-gray-600 mt-1">
                We sent instructions to <span className="font-semibold text-gray-800">{email}</span>
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => navigate('/admin/reset-password')}
                className="w-full py-3 bg-[#1E5AA8] hover:bg-[#164785] text-white text-sm font-bold rounded-md"
              >
                Proceed to Set New Password
              </button>
              <button
                onClick={() => navigate('/admin/login')}
                className="text-xs text-gray-600 hover:text-gray-900 py-2 font-medium"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Admin Email
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
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-md text-base text-gray-900 focus:border-[#1E5AA8] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#1E5AA8] hover:bg-[#164785] text-white font-bold rounded-md active-press shadow-sm transition-all text-sm min-h-[48px]"
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="w-full text-center text-xs text-gray-600 hover:text-gray-900 font-semibold py-2 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
