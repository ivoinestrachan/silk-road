'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Globe3D from '@/components/Globe3D';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      if (isAuthenticated === 'true') {
        router.push('/map');
      } else {
        router.push('/login');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0d2020] flex flex-col">
      {/* Globe Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Globe3D />
      </div>

      {/* Main Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title Section - Matches Element Information style */}
          <div className="bg-gradient-to-br from-[#18503B]/20 to-[#2b6563]/20 border border-[#2b6563]/30 rounded-lg backdrop-blur-sm p-8 mb-8"
            style={{
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            {/* Decorative top line */}
            <div className="flex items-center justify-center mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-teal-700/40 to-transparent w-64"></div>
            </div>

            {/* Main title */}
            <h1
              className="font-serif text-6xl md:text-8xl text-teal-100 mb-6 tracking-wider"
              style={{
                textShadow: '0 2px 8px rgba(0,0,0,0.5)'
              }}
            >
              TELOS LEAGUE
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-teal-300/80 mb-4 uppercase tracking-widest font-light">
              Trad-Digital Network
            </p>

            {/* Quote */}
            <div className="mt-8 mb-8">
              <p className="text-sm md:text-base text-teal-400/70 italic font-serif max-w-2xl mx-auto">
                "The journey of a thousand miles begins with a single step"
              </p>
            </div>

            {/* Decorative bottom line */}
            <div className="flex items-center justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-teal-700/40 to-transparent w-64"></div>
            </div>
          </div>

          {/* Loading indicator */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#18503B]/40 to-[#2b6563]/40 backdrop-blur-sm rounded-lg border border-teal-700/30">
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-teal-200 uppercase tracking-wide">Loading</span>
          </div>
        </div>
      </div>
    </div>
  );
}
