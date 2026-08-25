import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getWhatsAppUrl } from '../../utils/whatsapp';

export const FloatingWhatsAppButton: React.FC = () => {
  const { settings } = useApp();
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Show gentle prompt after 2.5s if not manually dismissed
    const timer = setTimeout(() => {
      if (!hasDismissed) {
        setShowTooltip(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [hasDismissed]);

  const shopName = settings.shopName || 'FR.HASAN TECH';
  const whatsappUrl = getWhatsAppUrl(
    settings.whatsappNumber || '076 859 7800',
    `Hello ${shopName}, I would like to inquire about your services.`
  );

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 pointer-events-none flex flex-col items-end gap-2 select-none print:hidden">
      {/* Quick helper tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto hidden md:flex items-center gap-2 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-soft-lg border border-slate-700/80 mb-1 max-w-[210px]"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="truncate">Need quick help? Chat now</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
                setHasDismissed(true);
              }}
              className="text-slate-400 hover:text-white ml-0.5 p-0.5 rounded transition-colors cursor-pointer"
              aria-label="Dismiss message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating WhatsApp Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="pointer-events-auto group relative flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-soft-xl hover:shadow-2xl transition-all duration-200 border border-white/40 active:scale-95 cursor-pointer"
        aria-label="Chat on WhatsApp"
        title="Direct WhatsApp Support"
      >
        {/* Glow / Pulse ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-pulse pointer-events-none" />

        <div className="relative flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-white text-[#25D366]" />
        </div>

        <span className="hidden sm:inline-block font-bold text-xs sm:text-sm tracking-wide pr-0.5">
          WhatsApp
        </span>
      </motion.a>
    </div>
  );
};
