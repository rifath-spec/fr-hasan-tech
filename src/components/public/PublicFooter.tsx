import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageCircle, Phone, MapPin, Mail, ArrowUpRight, Share2, Users } from 'lucide-react';
import { FRHasanLogo } from '../common/FRHasanLogo';
import { ShareLocationModal } from '../common/ShareLocationModal';
import { openWhatsAppChat } from '../../utils/whatsapp';

export const PublicFooter: React.FC = () => {
  const { navigate, settings } = useApp();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleWhatsAppClick = () => {
    openWhatsAppChat(
      settings.whatsappNumber || '076 859 7800',
      `Hello ${settings.shopName}, I would like to inquire about your services.`
    );
  };

  return (
    <footer className="bg-[#1A202C] text-white pt-12 pb-8 border-t border-slate-700">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        
        {/* 4-column layout on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 inline-block backdrop-blur-xs">
              <FRHasanLogo 
                size="md" 
                variant="badge" 
                customSrc={settings.logoUrl} 
                className="w-20 h-20 mx-auto"
              />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight">{settings.shopName}</span>
              <p className="text-slate-400 text-xs font-semibold mt-0.5">529, Siraj Nagar, Thampalagamam (Mullipotana)</p>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              {settings.description}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Open: 7 AM – 10 PM (Fri: 3 PM – 9 PM)</span>
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services')} className="hover:text-white transition-colors flex items-center gap-1">
                  <span>All Services</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors flex items-center gap-1">
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Contact & Location</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4">
              Our Services
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <button onClick={() => navigate('/services/photocopy')} className="hover:text-white transition-colors">
                  Black & White / Colour Photocopy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services/printing')} className="hover:text-white transition-colors">
                  Laser & High-Gloss Photo Printing
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services/sims')} className="hover:text-white transition-colors">
                  Dialog, Mobitel, Hutch, Airtel SIMs
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services/packages')} className="hover:text-white transition-colors">
                  Mobile Reloads & Data Packages
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4">
              Contact Info
            </h3>
            <div className="space-y-2.5 text-sm text-gray-300">
              <div 
                onClick={handleWhatsAppClick}
                className="flex items-center gap-2.5 cursor-pointer hover:text-amber-300 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span>WhatsApp: {settings.whatsappNumber}</span>
              </div>
              <a
                href={settings.whatsappGroupUrl || 'https://chat.whatsapp.com/Gn3gKNe98zeLMzwVYsETNn?s=cl&p=a&ilr=4'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-emerald-400 transition-colors"
              >
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Join WhatsApp Group</span>
              </a>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Phone: {settings.phoneNumber}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-1" />
                <div className="text-xs leading-relaxed">
                  <p>{settings.address}</p>
                  <p className="text-slate-400 text-[11px] font-mono mt-0.5">Plus Code: {settings.plusCode || 'F37F+49 Mullipotana'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>© 2026 {settings.shopName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Sri Lanka Local Business Platform</span>
            <span>•</span>
            <button onClick={() => navigate('/admin/dashboard')} className="hover:text-white transition-colors underline">
              Dashboard
            </button>
          </div>
        </div>

      </div>

      {/* Share Location Modal */}
      <ShareLocationModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </footer>
  );
};
