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
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#000000]">
      <div className="w-full md:w-96 lg:w-[28rem] md:flex-shrink-0 overflow-y-auto border-b md:border-b-0 md:border-r border-[#3f6053]/30 bg-[#000000] flex flex-col max-h-[40vh] md:max-h-none">
        {/* Sidebar Header */}
        <div className="p-4 md:p-6 border-b border-[#3f6053]/40 bg-[#000000]">
          <div className="mb-4 md:mb-6 flex items-center justify-center">
            <div className="flex items-center gap-1 px-4 py-2">
              <div className="h-px bg-[#3f6053]/40 flex-1 w-8"></div>
              <span className="text-xs text-white/70 uppercase tracking-widest px-2">
                Guild Navigation
              </span>
              <div className="h-px bg-[#3f6053]/40 flex-1 w-8"></div>
            </div>
          </div>

          <h1 className="text-xl md:text-2xl lg:text-3xl font-serif text-white tracking-wide mb-4 text-center"
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}
          >
            TELOS LEAGUE
          </h1>
          <p className="text-xs text-white/80 text-center uppercase tracking-wider mb-4">
            Trad-Digital Network
          </p>

          <div className="h-px bg-[#3f6053]/40 mb-4"></div>

          <p className="text-sm text-white/70 text-center italic font-serif">
            "The journey of a thousand miles begins with a single step"
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <h2 className="text-sm uppercase tracking-wider text-[#F6FAF6] mb-3 font-serif border-b border-[#3f6053]/30 pb-2">
            Welcome to Telos League
          </h2>
          <div className="flex items-center justify-center h-32 text-white/60 text-sm italic bg-gradient-to-br from-[#2b4539]/20 to-[#3f6053]/20 border border-[#3f6053]/30 rounded-lg backdrop-blur-sm"
            style={{
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            Click the Login button to access the full network
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-[#000000]">
        <GuildMap
          caravans={[]}
          members={[]}
          properties={telosHouse}
          selectedCaravan={null}
          onElementClick={() => {}}
        />

        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-[9997] bg-[#000000] backdrop-blur-sm rounded-lg border-2 border-[#3f6053]/50 p-3 md:p-4 shadow-2xl"
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.15)'
          }}
        >
          <h3 className="font-serif text-white mb-2 md:mb-3 text-xs md:text-sm uppercase tracking-wider border-b border-[#3f6053]/30 pb-2">
            Map Legend
          </h3>
          <div className="space-y-2 md:space-y-2.5 text-xs">
            <div className="flex items-center gap-2 md:gap-2.5">
              <img
                src="/telos-house-logo.png"
                alt="Telos House"
                className="w-6 h-6 md:w-7 md:h-7 object-contain"
              />
              <span className="text-white/90">Telos House</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowLoginModal(true)}
        className="fixed top-2 right-2 md:top-4 md:right-4 z-[10000] bg-[#000000]/80 backdrop-blur-sm p-2 md:p-3 rounded-lg shadow-2xl border-2 border-[#F6FAF6]/50 hover:bg-[#000000]/90 hover:border-[#F6FAF6] transition-all duration-300"
        style={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 2px rgba(246,250,246,0.1)'
        }}
        aria-label="Login"
      >
        <div className="flex items-center gap-1 md:gap-2">
          <span className="text-xl md:text-2xl">🔐</span>
          <span className="text-xs md:text-sm font-serif text-white uppercase tracking-wide">Login</span>
        </div>
      </button>

      {showLoginModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-[2px]">
          <div className="relative bg-gradient-to-br from-[#2b4539] to-[#000000] rounded-lg border-2 border-[#3f6053]/40 shadow-2xl p-6 md:p-8 w-full max-w-md">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>

            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-serif text-white tracking-wider mb-2">
                TELOS LEAGUE
              </h1>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px bg-[#3f6053]/40 flex-1"></div>
                <span className="text-xs text-white/70 uppercase tracking-widest">
                  Passport Authentication
                </span>
                <div className="h-px bg-[#3f6053]/40 flex-1"></div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-white/90 mb-2 uppercase tracking-wide font-serif">
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
                  className="w-full px-4 py-3 bg-[#000000]/80 border border-[#3f6053]/40 rounded text-white placeholder-[#3f6053]/50 focus:outline-none focus:ring-2 focus:ring-[#F6FAF6]/50 focus:border-[#F6FAF6]/50 transition-all font-mono"
                />
                {error && (
                  <p className="mt-2 text-xs text-red-400">{error}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#F6FAF6] to-[#ffffff] hover:from-[#F6FAF6]/90 hover:to-[#ffffff]/90 text-[#000000] rounded font-serif uppercase tracking-wider transition-all shadow-lg hover:shadow-xl"
              >
                Enter Network
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#3f6053]/30">
              <p className="text-xs text-white/60 text-center">
                Need a passport? Contact your guild administrator
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
