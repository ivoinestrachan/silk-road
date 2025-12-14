'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const GuildMap = dynamic(() => import('@/components/GuildMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0a1a1a]">
      <p className="text-teal-400">Loading map...</p>
    </div>
  ),
});

const telosHouse = [{
  id: 'prop-telos',
  name: 'Telos House',
  type: 'house' as const,
  location: { lat: 51.5306, lng: -0.1239, name: 'Kings Cross, London' },
  description: 'Main London hub and guild headquarters',
  capacity: 20,
  amenities: ['Coworking', 'Kitchen', 'Event Space'],
}];

export default function LoginPage() {
  const [passportId, setPassportId] = useState('');
  const [error, setError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!passportId.trim()) {
      setError('Please enter your Passport ID');
      return;
    }

    // Store passport ID in localStorage
    localStorage.setItem('passportId', passportId);
    localStorage.setItem('isAuthenticated', 'true');

    // Check if admin (special passport IDs)
    const adminPassports = ['ADMIN-001', 'ADMIN-002', 'ADMIN-003'];
    if (adminPassports.includes(passportId.toUpperCase())) {
      localStorage.setItem('isAdmin', 'true');
    }

    // Redirect to main map
    router.push('/map');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a1a1a]">
      {/* Sidebar */}
      <div className="w-full md:w-96 lg:w-[28rem] flex-shrink-0 overflow-y-auto border-r border-teal-900/30 bg-[#0d2020] flex flex-col">
        {/* Sidebar Header - Matches Element Information style */}
        <div className="p-6 border-b border-[#2b6563]/40 bg-[#0d2020]">
          <div className="bg-gradient-to-br from-[#18503B]/20 to-[#2b6563]/20 border border-[#2b6563]/30 rounded-lg backdrop-blur-sm p-6"
            style={{
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <div className="mb-6 flex items-center justify-center">
              <div className="flex items-center gap-1 px-4 py-2">
                <div className="h-px bg-teal-700/40 flex-1 w-8"></div>
                <span className="text-xs text-teal-300/70 uppercase tracking-widest px-2">
                  Guild Navigation
                </span>
                <div className="h-px bg-teal-700/40 flex-1 w-8"></div>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif text-teal-100 tracking-wide mb-4 text-center"
              style={{
                textShadow: '0 2px 8px rgba(0,0,0,0.5)'
              }}
            >
              TELOS LEAGUE
            </h1>
            <p className="text-xs text-teal-300/80 text-center uppercase tracking-wider mb-4">
              Trad-Digital Network
            </p>

            <div className="h-px bg-teal-700/40 mb-4"></div>

            <p className="text-sm text-teal-300/70 text-center italic font-serif">
              "The journey of a thousand miles begins with a single step"
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-sm uppercase tracking-wider text-teal-400 mb-3 font-serif border-b border-teal-800/30 pb-2">
            Welcome to Telos League
          </h2>
          <div className="flex items-center justify-center h-32 text-teal-400/60 text-sm italic bg-gradient-to-br from-[#18503B]/20 to-[#2b6563]/20 border border-[#2b6563]/30 rounded-lg backdrop-blur-sm"
            style={{
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            Click the Login button to access the full network
          </div>
        </div>
      </div>

      {/* Map Area - Full Width */}
      <div className="flex-1 relative bg-[#0a1a1a]">
        <GuildMap
          caravans={[]}
          members={[]}
          properties={telosHouse}
          selectedCaravan={null}
          onElementClick={() => {}}
        />

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-[9997] bg-gradient-to-br from-[#18503B] to-[#2b6563] backdrop-blur-sm rounded-lg border-2 border-[#2b6563]/50 p-4 shadow-2xl"
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.15)'
          }}
        >
          <h3 className="font-serif text-teal-100 mb-3 text-sm uppercase tracking-wider border-b border-teal-300/30 pb-2">
            Map Legend
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <img
                src="/telos-house-logo.png"
                alt="Telos House"
                className="w-7 h-7 object-contain"
              />
              <span className="text-teal-200/90">Telos House</span>
            </div>
          </div>
        </div>
      </div>

      {/* Login Button (replaces Passport button) */}
      <button
        onClick={() => setShowLoginModal(true)}
        className="fixed top-4 right-4 z-[10000] bg-gradient-to-br from-[#E8E4D9] to-[#C4B89D] p-3 rounded-lg shadow-2xl border-2 border-[#8B7355] hover:scale-105 transition-all duration-300"
        style={{
          boxShadow: '0 8px 32px rgba(139,115,85,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
        }}
        aria-label="Login"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔐</span>
          <span className="text-sm font-serif text-[#2c3e2e] uppercase tracking-wide">Login</span>
        </div>
      </button>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/40 backdrop-blur-[2px]">
          <div className="relative bg-gradient-to-br from-[#0d2626] to-[#0a1f1f] rounded-lg border-2 border-teal-800/40 shadow-2xl p-8 w-full max-w-md">
            {/* Close button */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-teal-400 hover:text-teal-200 transition-colors text-xl"
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif text-teal-100 tracking-wider mb-2">
                TELOS LEAGUE
              </h1>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px bg-teal-700/40 flex-1"></div>
                <span className="text-xs text-teal-300/70 uppercase tracking-widest">
                  Passport Authentication
                </span>
                <div className="h-px bg-teal-700/40 flex-1"></div>
              </div>
            </div>

            {/* Login form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-teal-300/90 mb-2 uppercase tracking-wide font-serif">
                  Passport ID
                </label>
                <input
                  type="text"
                  value={passportId}
                  onChange={(e) => {
                    setPassportId(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your passport ID"
                  className="w-full px-4 py-3 bg-[#0a1a1a]/80 border border-teal-700/40 rounded text-teal-100 placeholder-teal-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-mono"
                />
                {error && (
                  <p className="mt-2 text-xs text-red-400">{error}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 text-teal-50 rounded font-serif uppercase tracking-wider transition-all shadow-lg hover:shadow-xl"
              >
                Enter Network
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-teal-800/30">
              <p className="text-xs text-teal-400/60 text-center">
                Need a passport? Contact your guild administrator
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
