import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminResetPassword: React.FC = () => {
  const { navigate, resetAdminPassword } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Password Requirement checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValid) {
      setError('Please satisfy all password security criteria');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const success = resetAdminPassword(newPassword);
    if (success) {
      setIsSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white rounded-xl shadow-soft-lg p-6 sm:p-8 border border-gray-200"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F0FE] text-[#1E5AA8] flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Create New Password
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Choose a strong password for your admin dashboard
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Password Updated Successfully</h3>
              <p className="text-xs text-gray-600 mt-1">
                You can now log in using your newly configured password.
              </p>
            </div>

            <button
              onClick={() => navigate('/admin/login')}
              className="w-full py-3 bg-[#1E5AA8] hover:bg-[#164785] text-white text-sm font-bold rounded-md active-press shadow-sm"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-md text-base text-gray-900 focus:border-[#1E5AA8] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-md text-base text-gray-900 focus:border-[#1E5AA8] focus:outline-none"
                />
              </div>
            </div>

            {/* Password Requirements Checklist (Section 3.4) */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                Password Requirements:
              </span>
              
              <div className="flex items-center gap-2 text-xs">
                {hasMinLength ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={hasMinLength ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                  At least 8 characters
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {hasUppercase ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={hasUppercase ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                  One uppercase letter
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {hasLowercase ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={hasLowercase ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                  One lowercase letter
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {hasNumber ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={hasNumber ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                  One number
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {hasSpecial ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={hasSpecial ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                  One special character (@, #, $, etc.)
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isValid}
              className={`w-full py-3.5 text-white font-bold rounded-md active-press shadow-sm transition-all text-sm min-h-[48px] flex items-center justify-center gap-2 ${
                isValid
                  ? 'bg-[#1E5AA8] hover:bg-[#164785]'
                  : 'bg-gray-400 cursor-not-allowed opacity-70'
              }`}
            >
              <span>Update Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
