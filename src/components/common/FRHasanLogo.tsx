import React from 'react';

interface FRHasanLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  variant?: 'badge' | 'icon' | 'horizontal';
  showLocation?: boolean;
  showContact?: boolean;
  customSrc?: string;
  theme?: 'light' | 'dark';
}

export const FRHasanLogo: React.FC<FRHasanLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
  showLocation = true,
  customSrc,
  theme = 'light'
}) => {
  // Dimension mapping
  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-36 h-36',
    custom: ''
  };

  const isDark = theme === 'dark';

  // If a custom image source (uploaded logo URL or data URL) is provided, render it directly
  if (customSrc) {
    if (variant === 'icon' || variant === 'badge') {
      return (
        <div className={`relative rounded-full overflow-hidden shrink-0 border-2 border-red-500/80 shadow-soft-sm bg-white p-0.5 ${sizeClasses[size]} ${className}`}>
          <img
            src={customSrc}
            alt="FR.HASAN TECH Logo"
            className="w-full h-full object-contain rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`relative rounded-full overflow-hidden shrink-0 border-2 border-red-500/80 shadow-soft-sm bg-white p-0.5 ${sizeClasses[size]}`}>
          <img
            src={customSrc}
            alt="FR.HASAN TECH Logo"
            className="w-full h-full object-contain rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col text-left min-w-0">
          <span className={`font-extrabold tracking-tight text-base sm:text-lg leading-tight whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
            FR.HASAN <span className={isDark ? 'text-sky-400' : 'text-[#1E5AA8]'}>TECH</span>
          </span>
          {showLocation && (
            <span className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:block truncate max-w-[180px] md:max-w-none ${isDark ? 'text-blue-200/80' : 'text-slate-500'}`}>
              529, Siraj Nagar, Thampalagamam
            </span>
          )}
        </div>
      </div>
    );
  }

  // Pure SVG Circular Badge representation (Exact Replica of uploaded logo)
  if (variant === 'badge') {
    return (
      <div className={`relative shrink-0 ${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-sm select-none">
          {/* Background Circle with Red/Navy Border */}
          <circle cx="250" cy="250" r="240" fill="#FFFFFF" stroke="#E11D48" strokeWidth="6"/>
          <circle cx="250" cy="250" r="232" fill="none" stroke="#0F2B48" strokeWidth="8"/>

          {/* Circuit Nodes & FR Tech Icon */}
          <g transform="translate(175, 95) scale(0.92)">
            {/* Red Circuit traces */}
            <path d="M 50 15 L 15 15" stroke="#E11D48" strokeWidth="8" strokeLinecap="round"/>
            <circle cx="10" cy="15" r="9.5" fill="#E11D48"/>

            <path d="M 50 45 L -5 45" stroke="#E11D48" strokeWidth="8" strokeLinecap="round"/>
            <circle cx="-10" cy="45" r="9.5" fill="#E11D48"/>

            <path d="M 50 75 L 10 75" stroke="#E11D48" strokeWidth="8" strokeLinecap="round"/>
            <circle cx="5" cy="75" r="9.5" fill="#E11D48"/>

            <path d="M 50 105 L 25 105 L 25 145" stroke="#E11D48" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="25" cy="150" r="9.5" fill="#E11D48"/>

            {/* FR Letterforms */}
            <path d="M 50 12 L 155 12 L 142 34 L 50 34 Z" fill="#0F2B48"/>
            <path d="M 50 34 L 148 34 C 165 34 165 75 148 75 L 82 75 L 82 118 L 50 118 Z" fill="#E11D48"/>
            <path d="M 92 75 L 144 75 C 156 75 160 88 148 102 L 112 118 L 86 118 Z" fill="#0F2B48"/>
            <circle cx="168" cy="115" r="9.5" fill="#E11D48"/>
          </g>

          {/* Brand Typography */}
          <text x="250" y="278" fontFamily="'Plus Jakarta Sans', Arial, sans-serif" fontWeight="900" fontSize="36" fill="#0F2B48" textAnchor="middle" letterSpacing="3">
            FR.HASAN TECH
          </text>

          {/* Location Subtext */}
          <text x="250" y="304" fontFamily="'Plus Jakarta Sans', Arial, sans-serif" fontWeight="700" fontSize="13" fill="#0F2B48" textAnchor="middle" letterSpacing="1.5">
            529,SIRAJ NAGAR, THAMPALAGAMAM
          </text>

          {/* Divider Curve */}
          <path d="M 70 345 Q 250 365 430 345" stroke="#0F2B48" strokeWidth="1.5" strokeDasharray="3 3" fill="none" opacity="0.35"/>

          {/* WhatsApp Contact Section */}
          <g transform="translate(250, 395)">
            <text x="0" y="-12" fontFamily="'Plus Jakarta Sans', Arial, sans-serif" fontWeight="800" fontSize="21" fill="#0F2B48" textAnchor="middle" letterSpacing="1">
              WhatsApp
            </text>
            <g transform="translate(-112, 6)">
              <circle cx="14" cy="14" r="13" fill="none" stroke="#0F2B48" strokeWidth="2.5"/>
              <path d="M 9 9 C 8.5 10 8.5 12 10.5 14.5 C 12.5 17 14.5 18 17 18 C 19 18 19.5 16.5 19.5 15.5 C 19.5 15 18.5 14 17.5 13.5 C 16.8 13.2 16.2 13.5 15.8 14 C 15.4 14.4 14.8 14.5 14.2 14 C 13.2 13 12.5 12.2 11.5 11.2 C 11 10.5 11.2 10.2 11.5 9.8 C 11.8 9.5 12.2 9 11.8 8.2 C 11.4 7.5 10.5 6.5 10 6.5 C 9.5 6.5 9 7.8 9 9 Z" fill="#0F2B48"/>
            </g>
            <text x="16" y="27" fontFamily="'Plus Jakarta Sans', Arial, sans-serif" fontWeight="900" fontSize="26" fill="#0F2B48" textAnchor="middle" letterSpacing="1.5">
              0768597800
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // Icon only
  if (variant === 'icon') {
    return (
      <div className={`relative shrink-0 rounded-full bg-white border-2 border-red-500/80 shadow-soft-xs p-1 flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <g transform="translate(10, 15) scale(0.95)">
            <path d="M 50 15 L 15 15" stroke="#E11D48" strokeWidth="10" strokeLinecap="round"/>
            <circle cx="10" cy="15" r="11" fill="#E11D48"/>
            <path d="M 50 45 L -5 45" stroke="#E11D48" strokeWidth="10" strokeLinecap="round"/>
            <circle cx="-10" cy="45" r="11" fill="#E11D48"/>
            <path d="M 50 75 L 10 75" stroke="#E11D48" strokeWidth="10" strokeLinecap="round"/>
            <circle cx="5" cy="75" r="11" fill="#E11D48"/>
            <path d="M 50 105 L 25 105 L 25 145" stroke="#E11D48" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="25" cy="150" r="11" fill="#E11D48"/>

            <path d="M 50 12 L 155 12 L 142 34 L 50 34 Z" fill="#0F2B48"/>
            <path d="M 50 34 L 148 34 C 165 34 165 75 148 75 L 82 75 L 82 118 L 50 118 Z" fill="#E11D48"/>
            <path d="M 92 75 L 144 75 C 156 75 160 88 148 102 L 112 118 L 86 118 Z" fill="#0F2B48"/>
            <circle cx="168" cy="115" r="11" fill="#E11D48"/>
          </g>
        </svg>
      </div>
    );
  }

  // Default: Horizontal Brandlock (Icon + Typography + Subtitle)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative shrink-0 rounded-full bg-white border-2 border-red-500/80 shadow-soft-xs p-1 flex items-center justify-center ${sizeClasses[size]}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <g transform="translate(10, 15) scale(0.95)">
            <path d="M 50 15 L 15 15" stroke="#E11D48" strokeWidth="10" strokeLinecap="round"/>
            <circle cx="10" cy="15" r="11" fill="#E11D48"/>
            <path d="M 50 45 L -5 45" stroke="#E11D48" strokeWidth="10" strokeLinecap="round"/>
            <circle cx="-10" cy="45" r="11" fill="#E11D48"/>
            <path d="M 50 75 L 10 75" stroke="#E11D48" strokeWidth="10" strokeLinecap="round"/>
            <circle cx="5" cy="75" r="11" fill="#E11D48"/>
            <path d="M 50 105 L 25 105 L 25 145" stroke="#E11D48" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="25" cy="150" r="11" fill="#E11D48"/>

            <path d="M 50 12 L 155 12 L 142 34 L 50 34 Z" fill="#0F2B48"/>
            <path d="M 50 34 L 148 34 C 165 34 165 75 148 75 L 82 75 L 82 118 L 50 118 Z" fill="#E11D48"/>
            <path d="M 92 75 L 144 75 C 156 75 160 88 148 102 L 112 118 L 86 118 Z" fill="#0F2B48"/>
            <circle cx="168" cy="115" r="11" fill="#E11D48"/>
          </g>
        </svg>
      </div>
      <div className="flex flex-col text-left min-w-0">
        <div className={`flex items-center gap-1.5 font-extrabold tracking-tight text-base sm:text-lg leading-tight whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <span>FR.HASAN</span>
          <span className={isDark ? 'text-[#19A7E8]' : 'text-[#1E5AA8]'}>TECH</span>
        </div>
        {showLocation && (
          <span className={`text-[10px] font-semibold tracking-wide hidden sm:block truncate max-w-[180px] md:max-w-none ${isDark ? 'text-blue-100/80' : 'text-slate-500'}`}>
            529, Siraj Nagar, Thampalagamam
          </span>
        )}
      </div>
    </div>
  );
};
