import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getWhatsAppUrl } from '../../utils/whatsapp';

export const FloatingWhatsAppButton: React.FC = () => {
  const { settings } = useApp();
  const [showTooltip, setShowTooltip] = useState(true);

  const shopName = settings.shopName || 'FR.HASAN TECH';
  const whatsappUrl = getWhatsAppUrl(
    settings.whatsappNumber || '076 859 7800',
    `Hello ${shopName}, I would like to inquire about your services.`
  );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 select-none print:hidden">
      {/* Quick helper tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="hidden sm:flex items-center gap-2 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-soft-lg border border-slate-700/80 mb-1 max-w-[220px]"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="truncate">Need quick help? Chat with us!</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-slate-400 hover:text-white ml-1 p-0.5 rounded transition-colors"
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
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="group relative flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-soft-xl hover:shadow-2xl transition-all duration-200 border-2 border-[#0b0101] active:scale-95"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        {/* Glow / Pulse ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-pulse pointer-events-none" />

        <div className="relative flex items-center justify-center shrink-0">
          <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
        </div>

        <span className="hidden sm:inline-block font-bold text-sm tracking-wide pr-1">
          WhatsApp
        </span>
      </motion.a>
    </div>
  );
};
