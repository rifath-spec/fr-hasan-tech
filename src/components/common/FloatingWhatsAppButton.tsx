import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageCircle, X } from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/whatsapp';

export const FloatingWhatsAppButton: React.FC = () => {
  const { settings } = useApp();
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Show gentle prompt after 2s if not manually dismissed
    const timer = setTimeout(() => {
      if (!hasDismissed) {
        setShowTooltip(true);
      }
    }, 2000);
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
      {showTooltip && (
        <div
          className="pointer-events-auto hidden md:flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-soft-lg border border-slate-700 mb-1 max-w-[210px]"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
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
        </div>
      )}

      {/* Main Floating WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto group relative flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-soft-xl border border-white/40 cursor-pointer"
        aria-label="Chat on WhatsApp"
        title="Direct WhatsApp Support"
      >
        <div className="relative flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-white text-[#25D366]" />
        </div>

        <span className="hidden sm:inline-block font-bold text-xs sm:text-sm tracking-wide pr-0.5">
          WhatsApp
        </span>
      </a>
    </div>
  );
};
