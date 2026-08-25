import React, { useState } from 'react';
import { 
  Share2, 
  MapPin, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  MessageCircle, 
  Navigation, 
  QrCode, 
  Sparkles,
  Compass
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ShareLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareLocationModal: React.FC<ShareLocationModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFullInfo, setCopiedFullInfo] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const mapsUrl = settings.googleMapsUrl || 'https://maps.google.com/?q=FR+HASAN+TECH+Mullipotana+F37F%2B49';
  const plusCode = settings.plusCode || 'F37F+49 Mullipotana';
  const shareText = `📍 *${settings.shopName}*\n🏢 ${settings.address}\n🗺️ Plus Code: ${plusCode}\n⏰ Hours: 7 AM – 10 PM (Fri: 3 PM – 9 PM)\n📞 Contact: ${settings.phoneNumber}\n\n📌 Google Maps Location:\n${mapsUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(mapsUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleCopyFullInfo = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedFullInfo(true);
      setTimeout(() => setCopiedFullInfo(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${settings.shopName} - Store Location`,
          text: `Find ${settings.shopName} in Mullipotana (Plus Code: ${plusCode})`,
          url: mapsUrl,
        });
      } catch (err) {
        // user cancelled share
      }
    } else {
      handleCopyFullInfo();
    }
  };

  // Google Chart API QR Code for easy scanning
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(mapsUrl)}&bgcolor=ffffff&color=164785&margin=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-white to-amber-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1E5AA8] text-white flex items-center justify-center shadow-sm">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Share Store Location
              </h3>
              <p className="text-xs text-slate-500">
                Help customers & visitors navigate to FR.HASAN TECH
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Location Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-[#1E5AA8] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{settings.shopName}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{settings.address}</p>
                </div>
              </div>

              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-[#1E5AA8] border border-blue-200/80 shrink-0 font-mono">
                {plusCode}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span>🕒 Open 7:00 AM – 10:00 PM (Fri: 3–9 PM)</span>
              <span className="text-emerald-700 font-semibold">● Open Daily</span>
            </div>
          </div>

          {/* Quick Share Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp Share Button */}
            <button
              onClick={handleShareWhatsApp}
              className="w-full p-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Share via WhatsApp</span>
            </button>

            {/* Native / Direct Device Share */}
            <button
              onClick={handleNativeShare}
              className="w-full p-3.5 rounded-xl bg-[#1E5AA8] hover:bg-[#164785] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via Apps / SMS</span>
            </button>
          </div>

          {/* Copy Action Options */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-slate-800">Full Store Info & Location</p>
                <p className="text-[11px] text-slate-500 truncate">Includes address, Plus code, hours & map link</p>
              </div>
              <button
                onClick={handleCopyFullInfo}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copiedFullInfo ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Info</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-slate-800">Google Maps Direct Link</p>
                <p className="text-[11px] text-slate-500 font-mono truncate">{mapsUrl}</p>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Toggle QR Code for in-person sharing / scanning */}
          <div className="pt-2">
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/80 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <QrCode className="w-4 h-4 text-[#1E5AA8]" />
              <span>{showQR ? 'Hide Location QR Code' : 'Show Location QR Code for Instant Mobile Scan'}</span>
            </button>

            {showQR && (
              <div className="mt-3 p-4 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-150">
                <img 
                  src={qrCodeUrl} 
                  alt="Location QR Code" 
                  className="w-40 h-40 rounded-lg shadow-sm border border-slate-100 p-1 bg-white"
                  loading="lazy"
                />
                <p className="text-xs font-bold text-slate-800 mt-2.5">Scan to open on phone</p>
                <p className="text-[11px] text-slate-500">Opens exact GPS location directly in Google Maps</p>
              </div>
            )}
          </div>

          {/* External Map Navigation Link */}
          <div className="flex items-center justify-between pt-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#1E5AA8] hover:text-[#164785] flex items-center gap-1 hover:underline"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open in Google Maps App</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
