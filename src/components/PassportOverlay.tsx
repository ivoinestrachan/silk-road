'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

interface PassportOverlayProps {
  passportId: string;
  isAdmin: boolean;
  onLogout: () => void;
}

export default function PassportOverlay({ passportId, isAdmin, onLogout }: PassportOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const coverRef = useRef<HTMLDivElement>(null);
  const leftPageRef = useRef<HTMLDivElement>(null);
  const rightPageRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const tl = gsap.timeline();

      tl.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: 'power2.out' }
      );

      tl.fromTo(
        containerRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.2)' },
        '-=0.1'
      );

      tl.set(leftPageRef.current, { rotateY: 0, opacity: 0 });
      tl.set(rightPageRef.current, { rotateY: 0, opacity: 0 });
      tl.set(coverRef.current, { rotateY: 0, opacity: 1, zIndex: 20 });

      tl.to({}, { duration: 0.15 });

      tl.to(
        coverRef.current,
        {
          rotateY: -180,
          duration: 1,
          ease: 'power2.inOut',
          transformOrigin: 'left center',
        }
      );

      tl.to(
        [leftPageRef.current, rightPageRef.current],
        {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        },
        '-=0.5'
      );

      tl.to(
        leftPageRef.current,
        {
          rotateY: -2,
          duration: 0.25,
          ease: 'power1.out',
        },
        '-=0.15'
      );

      tl.to(
        rightPageRef.current,
        {
          rotateY: 2,
          duration: 0.25,
          ease: 'power1.out',
        },
        '-=0.25'
      );
    } else {
      const tl = gsap.timeline();

      tl.to([leftPageRef.current, rightPageRef.current], {
        rotateY: 0,
        duration: 0.15,
        ease: 'power1.in',
      });

      tl.to([leftPageRef.current, rightPageRef.current], {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
      }, '-=0.05');

      tl.to(coverRef.current, {
        rotateY: 0,
        duration: 0.7,
        ease: 'power2.inOut',
      }, '-=0.25');

      tl.to(containerRef.current, {
        scale: 0.5,
        duration: 0.25,
        ease: 'power2.in',
      }, '-=0.15');

      tl.to([backdropRef.current, containerRef.current], {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      }, '-=0.05');
    }
  }, [isOpen]);

  return (
    <>
      {/* Passport Button - Fixed positioning */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-[10000] bg-gradient-to-br from-[#E8E4D9] to-[#C4B89D] p-3 rounded-lg shadow-2xl border-2 border-[#8B7355] hover:scale-105 transition-all duration-300"
        style={{
          boxShadow: '0 8px 32px rgba(139,115,85,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
        }}
        aria-label="Open Passport"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛂</span>
          <span className="text-sm font-serif text-[#2c3e2e] uppercase tracking-wide">Passport</span>
        </div>
      </button>

      {/* Full Screen Overlay */}
      <div
        ref={backdropRef}
        className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{ opacity: 0 }}
      >
        {/* Semi-transparent backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />

        {/* Passport Book Container */}
        <div
          ref={containerRef}
          className="relative w-full max-w-6xl h-full max-h-[85vh]"
          style={{
            perspective: '2500px',
            perspectiveOrigin: 'center center',
            transformStyle: 'preserve-3d',
            opacity: 0,
            scale: 0.3,
          }}
        >
          {/* Book Wrapper */}
          <div
            className="relative w-full h-full"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Cover Page (starts on right, opens outward to left like a book) */}
            <div
              ref={coverRef}
              className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-br from-[#2c3e2e] to-[#1a2a1e] rounded-r-xl shadow-2xl"
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: 'left center',
                backfaceVisibility: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 2px 8px rgba(255,255,255,0.1)',
                zIndex: 10,
              }}
            >
              <div className="p-12 h-full flex flex-col items-center justify-center relative">
                <div className="absolute inset-8 border-4 border-[#C4B89D]/30 rounded-lg" style={{
                  boxShadow: 'inset 0 0 40px rgba(196,184,157,0.1)'
                }}></div>

                <div className="absolute inset-12 border-2 border-[#C4B89D]/20 rounded" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(196,184,157,0.03) 10px, rgba(196,184,157,0.03) 20px)'
                }}></div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-6 relative">
                    <div className="w-28 h-28 bg-gradient-to-br from-[#C4B89D]/30 to-[#8B7355]/20 rounded-full border-4 border-[#C4B89D] flex items-center justify-center relative"
                      style={{
                        boxShadow: '0 12px 32px rgba(196,184,157,0.4), inset 0 2px 8px rgba(255,255,255,0.3)'
                      }}
                    >
                      <div className="absolute inset-2 border-2 border-[#C4B89D]/40 rounded-full"></div>
                      <span className="text-5xl">⚒</span>
                    </div>
                    <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-[#C4B89D]/60"></div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-[#C4B89D]/60"></div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-[#C4B89D]/60"></div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-[#C4B89D]/60"></div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C4B89D]/60"></div>
                    <span className="text-lg text-[#C4B89D]/70">✦</span>
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C4B89D]/60"></div>
                  </div>

                  <h2 className="text-4xl font-serif text-[#C4B89D] tracking-[0.3em] mb-2 relative">
                    PASSPORT
                    <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C4B89D]/40 to-transparent"></div>
                  </h2>

                  <div className="flex items-center gap-2 my-4">
                    <span className="text-[#C4B89D]/50">❖</span>
                    <div className="h-px bg-[#C4B89D]/40 w-24"></div>
                    <span className="text-[#C4B89D]/50">❖</span>
                  </div>

                  <p className="text-xl text-[#C4B89D]/90 uppercase tracking-[0.25em] font-serif mb-2">Telos League</p>
                  <p className="text-xs text-[#C4B89D]/60 uppercase tracking-widest mb-6">Trad-Digital Network</p>

                  <div className="mt-4 text-center px-8 py-3 border-t border-b border-[#C4B89D]/30 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#C4B89D]/40 rotate-45"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#C4B89D]/40 rotate-45"></div>
                    <p className="text-[11px] text-[#C4B89D]/70 italic font-serif leading-relaxed">
                      "The journey of a thousand miles<br/>begins with a single step"
                    </p>
                  </div>

                  <div className="mt-6 flex gap-1">
                    <span className="text-[#C4B89D]/30 text-xs">✦</span>
                    <span className="text-[#C4B89D]/40 text-xs">✦</span>
                    <span className="text-[#C4B89D]/50 text-xs">✦</span>
                    <span className="text-[#C4B89D]/40 text-xs">✦</span>
                    <span className="text-[#C4B89D]/30 text-xs">✦</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Left Page (under the cover when closed) */}
            <div
              ref={leftPageRef}
              className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-br from-[#E8E4D9] to-[#D5D1C1] rounded-l-xl shadow-2xl overflow-y-auto"
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: 'left center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.2)',
                opacity: 0,
              }}
            >
              <div className="p-8">
                <div className="bg-gradient-to-br from-[#1a3a2e] to-[#0d2626] p-4 rounded-lg border-b-4 border-[#8B7355] mb-6"
                  style={{
                    boxShadow: 'inset 0 -2px 8px rgba(139,115,85,0.3)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#C4B89D] uppercase tracking-widest mb-1">
                        Membership Type
                      </p>
                      <p className="text-sm text-white font-serif">Full-Member Access</p>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-[#C4B89D] hover:text-white transition-colors text-xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Caravan Routes Section */}
                <div className="border-2 border-[#8B7355] rounded-lg overflow-hidden mb-6"
                  style={{
                    boxShadow: '0 4px 16px rgba(139,115,85,0.2)'
                  }}
                >
                  <div className="bg-gradient-to-r from-[#2c3e2e] to-[#1a2a1e] p-3">
                    <h3 className="text-[#E8E4D9] font-serif text-sm tracking-wide">
                      CARAVAN ROUTES
                    </h3>
                  </div>
                  <div className="bg-[#f5f3ed] p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">🚐</span>
                        <div className="flex-1">
                          <p className="text-xs text-[#6b7c6b] font-semibold mb-0.5">Slush Caravan 2025</p>
                          <p className="text-[10px] text-[#8b8b7a]">London → Helsinki</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-gray-400 text-gray-700 text-[9px] rounded uppercase tracking-wide">
                            Completed
                          </span>
                        </div>
                      </div>
                      <div className="h-px bg-[#C4B89D]"></div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg">🚐</span>
                        <div className="flex-1">
                          <p className="text-xs text-[#6b7c6b] font-semibold mb-0.5">Davos Caravan 2026</p>
                          <p className="text-[10px] text-[#8b8b7a]">London → Davos</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-200 text-amber-800 text-[9px] rounded uppercase tracking-wide">
                            Upcoming
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stamps Section */}
                <div className="border-2 border-[#8B7355] rounded-lg overflow-hidden mb-6"
                  style={{
                    boxShadow: '0 4px 16px rgba(139,115,85,0.2)'
                  }}
                >
                  <div className="bg-gradient-to-r from-[#2c3e2e] to-[#1a2a1e] p-3">
                    <h3 className="text-[#E8E4D9] font-serif text-sm tracking-wide">
                      TRAVEL STAMPS
                    </h3>
                  </div>
                  <div className="bg-[#f5f3ed] p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border-2 border-red-800/30 rounded p-2 bg-red-50/50 rotate-[-3deg]">
                        <p className="text-[9px] text-red-900 font-bold uppercase text-center">London</p>
                        <p className="text-[8px] text-red-700 text-center">Nov 2025</p>
                      </div>
                      <div className="border-2 border-blue-800/30 rounded p-2 bg-blue-50/50 rotate-[2deg]">
                        <p className="text-[9px] text-blue-900 font-bold uppercase text-center">Berlin</p>
                        <p className="text-[8px] text-blue-700 text-center">Nov 2025</p>
                      </div>
                      <div className="border-2 border-green-800/30 rounded p-2 bg-green-50/50 rotate-[3deg]">
                        <p className="text-[9px] text-green-900 font-bold uppercase text-center">Warsaw</p>
                        <p className="text-[8px] text-green-700 text-center">Nov 2025</p>
                      </div>
                      <div className="border-2 border-purple-800/30 rounded p-2 bg-purple-50/50 rotate-[-2deg]">
                        <p className="text-[9px] text-purple-900 font-bold uppercase text-center">Helsinki</p>
                        <p className="text-[8px] text-purple-700 text-center">Nov 2025</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quote at bottom */}
                <div className="mt-auto pt-4">
                  <p className="text-xs text-[#6b7c6b] text-center italic font-serif">
                    "The journey of a thousand miles begins with a single step"
                  </p>
                </div>

              </div>
            </div>

            {/* Right Page (content page) */}
            <div
              ref={rightPageRef}
              className="absolute right-0 top-0 w-1/2 h-full bg-[#E8E4D9] rounded-r-xl shadow-2xl overflow-y-auto"
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: 'right center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.2)',
                opacity: 0,
              }}
            >
              <div className="p-8">
                {/* Member Information Section */}
                <div className="border-2 border-[#2c3e2e] rounded-lg overflow-hidden mb-6"
                  style={{
                    boxShadow: '0 4px 16px rgba(44,62,46,0.2)'
                  }}
                >
                  <div className="bg-gradient-to-r from-[#2c3e2e] to-[#1a2a1e] p-3">
                    <h3 className="text-white font-serif text-lg tracking-wide">
                      MEMBER INFORMATION
                    </h3>
                  </div>

                  <div className="relative bg-gradient-to-br from-[#1a3a2e] to-[#0d2020] p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src="/telos-house-logo.png"
                        alt="Member Photo"
                        className="w-20 h-20 rounded-full border-2 border-[#C4B89D] object-cover bg-[#C4B89D]/20 p-2"
                      />
                      <div className="flex-1">
                        <p className="text-xs text-[#C4B89D] uppercase tracking-wide mb-1">Name</p>
                        <p className="text-base text-white font-serif mb-2">Alexander Cross</p>
                        <p className="text-xs text-[#C4B89D] uppercase tracking-wide mb-1">Ranking</p>
                        <p className="text-sm text-[#E8E4D9]">Senior Partner</p>
                      </div>
                    </div>
                    <div className="h-px bg-[#C4B89D]/30 my-3"></div>
                    <div>
                      <p className="text-xs text-[#C4B89D] uppercase tracking-wide mb-1">Guild</p>
                      <p className="text-sm text-white font-serif">Telos House</p>
                    </div>
                  </div>
                </div>

                {/* Passport ID Section */}
                <div className="border-2 border-[#2c3e2e] rounded-lg overflow-hidden mb-6"
                  style={{
                    boxShadow: '0 4px 16px rgba(44,62,46,0.2)'
                  }}
                >
                  <div className="bg-gradient-to-r from-[#2c3e2e] to-[#1a2a1e] p-3">
                    <h3 className="text-white font-serif text-lg tracking-wide">
                      PASSPORT ID
                    </h3>
                  </div>

                  <div className="relative bg-gradient-to-br from-[#1a3a2e] to-[#0d2020] p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[#C4B89D] uppercase tracking-wide mb-1">Telos House</p>
                        <p className="text-sm text-white font-mono">{passportId.substring(0, 8)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#C4B89D] uppercase tracking-wide mb-1">THCRVN25</p>
                        <p className="text-sm text-white">∞</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-br from-[#f5f3ed] to-[#E8E4D9] border border-[#C4B89D] rounded-lg mb-4"
                  style={{
                    boxShadow: 'inset 0 1px 3px rgba(139,115,85,0.2)'
                  }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[#6b7c6b] uppercase tracking-wide mb-1">Ticket Type</p>
                      <p className="text-[#2c3e2e] font-mono">∞</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#6b7c6b] uppercase tracking-wide mb-1">Access Level</p>
                      {isAdmin ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-amber-600 to-amber-500 rounded border border-amber-700 shadow-lg">
                          <span className="text-xs">⚡</span>
                          <p className="text-xs text-white font-bold uppercase tracking-wide">Admin</p>
                        </div>
                      ) : (
                        <p className="text-[#2c3e2e]">Member</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="w-full py-3 bg-gradient-to-r from-[#2c3e2e] to-[#1a2a1e] hover:from-[#1a2a1e] hover:to-[#0d1a0e] text-[#E8E4D9] rounded-lg text-sm uppercase tracking-wide transition-all shadow-lg"
                  style={{
                    boxShadow: '0 4px 12px rgba(44,62,46,0.4)'
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
