import React from 'react';
import {
  ShieldCheck,
  Clock,
  ThumbsUp,
  MapPin,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

interface FeatureCardData {
  id: string;
  icon: React.ReactNode;
  title: string;
  tag: string;
  statValue: string;
  statLabel: string;
  description: string;
  highlights: string[];
  image: string;
  accentColor: string;
  lightBg: string;
  tagBadge: string;
  iconColor: string;
}

const features: FeatureCardData[] = [
  {
    id: 'professional',
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'Professional Precision',
    tag: '100% Quality Guaranteed',
    statValue: '99.9%',
    statLabel: 'Accuracy Rating',
    description: 'Exacting optical standards in high-resolution printing, vivid photocopying, and official biometric SIM registration.',
    highlights: ['Laser optical alignment for crisp micro-text', 'ISO standard authentic toner & heavyweight paper', 'Authorized biometric KYC registration agent'],
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
    accentColor: '#1E5AA8',
    lightBg: 'bg-blue-50/70',
    tagBadge: 'bg-blue-50 text-[#1E5AA8] border-blue-200/80',
    iconColor: 'bg-[#1E5AA8] text-white',
  },
  {
    id: 'turnaround',
    icon: <Clock className="w-5 h-5" />,
    title: 'Express Fast Turnaround',
    tag: 'Lightning Speed',
    statValue: '< 3 Mins',
    statLabel: 'Average Turnaround',
    description: 'Rapid turnaround workflows designed to get you back to your study, office, or commute with zero waiting delays.',
    highlights: ['< 2 min express photocopy queue', 'WhatsApp send-ahead document queue', 'Instant multi-carrier SIM activation on spot'],
    image: 'https://images.unsplash.com/photo-1508873696983-2df570464756?auto=format&fit=crop&w=800&q=80',
    accentColor: '#F59E0B',
    lightBg: 'bg-amber-50/70',
    tagBadge: 'bg-amber-50 text-amber-800 border-amber-200/80',
    iconColor: 'bg-[#F59E0B] text-white',
  },
  {
    id: 'quality',
    icon: <ThumbsUp className="w-5 h-5" />,
    title: 'Ultra HD Lab Standards',
    tag: 'Lab Standard DPI',
    statValue: '15,000+',
    statLabel: 'Satisfied Customers',
    description: 'Consistent, vibrant photo color grading, razor-sharp documents, and rock-solid network signal reloads.',
    highlights: ['Smudge-proof glossy & matte photo papers', 'Official Dialog, Mobitel & Airtel registered dealer', 'Dual-side duplex auto-alignment technology'],
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    accentColor: '#059669',
    lightBg: 'bg-emerald-50/70',
    tagBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    iconColor: 'bg-emerald-600 text-white',
  },
  {
    id: 'location',
    icon: <MapPin className="w-5 h-5" />,
    title: 'Prime Accessible Location',
    tag: 'Easy Walk-in',
    statValue: '7 Days / Wk',
    statLabel: 'Walk-in Hours',
    description: 'Prime neighborhood location with quick stopping bays, customer air-conditioned lounge, and extended daily hours.',
    highlights: ['Main road prime accessibility', 'Dedicated customer parking & waiting area', 'Open 7 days morning till late evening'],
    image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
    accentColor: '#7C3AED',
    lightBg: 'bg-purple-50/70',
    tagBadge: 'bg-purple-50 text-purple-800 border-purple-200/80',
    iconColor: 'bg-purple-600 text-white',
  },
];

export const RotatableWhyChooseUs: React.FC = () => {
  return (
    <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Why Choose Us
        </h2>
      </div>

      {/* Responsive Feature Cards Grid - 1 col (<768px), 2 cols (md), 4 cols (lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {features.map((feature, idx) => (
          <div
            key={feature.id}
            className="group bento-card bg-white border border-slate-200/90 hover:border-slate-300 shadow-soft-sm hover:shadow-soft-lg transition-all duration-200 rounded-3xl overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Photo Area with Strong Dark Gradient Scrim for WCAG AA Contrast */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                {/* Guaranteed contrast scrim (WCAG AA Compliant) */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/45 to-slate-950/95" />

                {/* Top Badge & Metric Counter with High Contrast */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-white border border-white/30 shadow-md">
                    {feature.tag}
                  </span>
                  <div className="px-2.5 py-1 rounded-lg bg-slate-950/90 backdrop-blur-md border border-white/25 text-white flex items-center gap-1 font-mono text-[11px] font-bold shadow-md">
                    <span className="text-amber-400">{feature.statValue}</span>
                  </div>
                </div>

                {/* Floating Title & Icon directly over photo base */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center gap-3 pointer-events-none">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${feature.iconColor} shrink-0`}>
                    {feature.icon}
                  </div>
                  <div className="text-white drop-shadow-md min-w-0">
                    <h3 className="text-base font-bold leading-tight truncate text-white">
                      {feature.title}
                    </h3>
                    <p className="text-[11px] text-blue-200 font-semibold truncate mt-0.5">
                      {feature.statLabel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Body & Features with WCAG AA compliant text contrast */}
              <div className="p-5">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Bullet Points Checklist */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  {feature.highlights.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Card Footer with Subtle Accent Bar */}
            <div className="px-5 py-3.5 bg-slate-50/90 border-t border-slate-150 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px]">Active Service Guarantee</span>
              </div>
              <span className="text-[11px] font-extrabold text-[#1E5AA8] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                <span>0{idx + 1}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1E5AA8]" />
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
