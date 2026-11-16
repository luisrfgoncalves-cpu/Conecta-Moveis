import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBrandConfig } from '@/lib/config/brand';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  href?: string;
  variant?: 'image' | 'vector' | 'auto';
}

export function BrandLogo({
  className = '',
  size = 'md',
  showText = true,
  href,
  variant = 'auto',
}: BrandLogoProps) {
  const brand = getBrandConfig();

  const useImage = (variant === 'image' || variant === 'auto') && Boolean(brand.logoUrl);

  const imageSizes = {
    sm: 'h-9 sm:h-11 w-auto max-w-[190px] sm:max-w-[240px]',
    md: 'h-12 sm:h-16 md:h-18 w-auto max-w-[240px] sm:max-w-[320px] md:max-w-[380px]',
    lg: 'h-16 sm:h-20 md:h-24 w-auto max-w-[280px] sm:max-w-[380px] md:max-w-[460px]',
  };

  const iconSizes = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11 sm:w-13 sm:h-13',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
  };

  const textSizes = {
    sm: 'text-lg font-extrabold',
    md: 'text-2xl sm:text-3xl font-black',
    lg: 'text-3xl sm:text-4xl font-black',
  };

  let content: React.ReactNode;

  if (useImage && brand.logoUrl) {
    content = (
      <div className={`inline-flex items-center group shrink-0 ${className}`}>
        <div className="relative flex items-center">
          <Image
            src={brand.logoUrl}
            alt={brand.name}
            width={580}
            height={200}
            priority
            unoptimized
            className={`${imageSizes[size]} object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] group-hover:scale-[1.02] transition-transform duration-200`}
          />
        </div>
      </div>
    );
  } else {
    content = (
      <div className={`inline-flex items-center gap-2.5 sm:gap-3 group ${className}`}>
        {/* Símbolo estilizado de marcenaria/encaixe e conexão em madeira */}
        <div
          className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-amber-600 to-orange-700 shadow-lg shadow-orange-500/20 border border-orange-400/30 flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3/5 h-3/5 text-white"
          >
            <path
              d="M6 8C6 6.89543 6.89543 6 8 6H24C25.1046 6 26 6.89543 26 8V12C26 13.1046 25.1046 14 24 14H8C6.89543 14 6 13.1046 6 12V8Z"
              fill="currentColor"
              fillOpacity="0.95"
            />
            <path
              d="M6 16C6 14.8954 6.89543 14 8 14H24C25.1046 14 26 14.8954 26 16V20C26 21.1046 25.1046 22 24 22H8C6.89543 22 6 21.1046 6 20V16Z"
              fill="currentColor"
              fillOpacity="0.75"
            />
            <circle cx="16" cy="18" r="1.5" fill="#0f172a" />
            <path
              d="M10 24C10 23.4477 10.4477 23 11 23H21C21.5523 23 22 23.4477 22 24V26H10V24Z"
              fill="currentColor"
              fillOpacity="0.5"
            />
          </svg>
        </div>

        {showText && (
          <div className="flex flex-col leading-none">
            <span
              className={`${textSizes[size]} tracking-tight text-white group-hover:text-orange-400 transition-colors`}
            >
              {brand.name}
            </span>
            <span className="text-[10px] tracking-widest uppercase text-slate-400 font-semibold mt-1">
              {brand.focusRegion}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-xl p-1 transition flex-shrink-0"
        aria-label={brand.name}
      >
        {content}
      </Link>
    );
  }

  return content;
}
