import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgClass = "bg-white border-l-4 border-[#10B981] text-[#1A202C]";
          let Icon = CheckCircle2;
          let iconColor = "text-[#10B981]";

          if (toast.type === 'error') {
            bgClass = "bg-white border-l-4 border-[#EF4444] text-[#1A202C]";
            Icon = AlertCircle;
            iconColor = "text-[#EF4444]";
          } else if (toast.type === 'warning') {
            bgClass = "bg-white border-l-4 border-[#F59E0B] text-[#1A202C]";
            Icon = AlertTriangle;
            iconColor = "text-[#F59E0B]";
          } else if (toast.type === 'info') {
            bgClass = "bg-white border-l-4 border-[#1E5AA8] text-[#1A202C]";
            Icon = Info;
            iconColor = "text-[#1E5AA8]";
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto p-4 rounded-md shadow-soft-lg flex items-start gap-3 border border-gray-100 ${bgClass}`}
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                {toast.title && <p className="font-semibold text-sm leading-tight mb-0.5">{toast.title}</p>}
                <p className="text-sm text-gray-700 leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1 rounded transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
