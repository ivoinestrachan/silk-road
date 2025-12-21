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

// All Telos House locations (visible to everyone)
const telosHouses = [
  {
    id: 'prop-telos',
    name: 'Telos House',
    type: 'house' as const,
    location: { lat: 51.5306, lng: -0.1239, name: 'Kings Cross, London' },
    description: 'Main London hub and guild headquarters',
    capacity: 20,
    amenities: ['Coworking', 'Kitchen', 'Event Space'],
  },
  {
    id: 'prop-telos-sf',
    name: 'Telos House SF',
    type: 'house' as const,
    location: { lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA' },
    description: 'Silicon Valley innovation hub and startup accelerator',
    capacity: 25,
    amenities: ['Coworking', 'Pitch Room', 'Maker Space', 'Demo Lab'],
  },
  {
    id: 'prop-telos-shenzhen',
    name: 'Telos House Shenzhen',
    type: 'house' as const,
    location: { lat: 22.5390, lng: 114.0550, name: 'Shenzhen, China' },
    description: 'Asia-Pacific hub and innovation center [UPCOMING]',
    capacity: 15,
    amenities: ['Coworking', 'Hardware Lab', 'Manufacturing Access'],
  },
];

// Expeditions (visible to everyone)
const publicExpeditions = [
  {
    id: 'caravan-1',
    name: 'Silk Road Revival',
    status: 'upcoming' as const,
    route: {
      start: { lat: 51.5074, lng: -0.1278, name: 'London' },
      end: { lat: 39.9042, lng: 116.4074, name: 'Beijing' },
      waypoints: [
        { lat: 48.8566, lng: 2.3522, name: 'Paris' },
        { lat: 41.9028, lng: 12.4964, name: 'Rome' },
        { lat: 41.0082, lng: 28.9784, name: 'Istanbul' },
        { lat: 39.9334, lng: 32.8597, name: 'Ankara' },
        { lat: 40.4093, lng: 49.8671, name: 'Baku' },
        { lat: 41.2995, lng: 69.2401, name: 'Tashkent' },
      ],
    },
    stops: [
      {
        location: { lat: 51.5074, lng: -0.1278, name: 'London' },
        arrivalDate: '2025-06-01',
        departureDate: '2025-06-05',
        description: 'Starting point - Telos House London',
      },
      {
        location: { lat: 39.9042, lng: 116.4074, name: 'Beijing' },
        arrivalDate: '2025-08-10',
        departureDate: '2025-08-15',
        description: 'Final destination',
      },
    ],
    participants: 12,
    vehicles: 3,
    startDate: '2025-06-01',
    endDate: '2025-08-15',
    description: 'A modern journey along the ancient Silk Road, connecting traditional crafts with contemporary digital innovation',
  },
];

// Startup cohort members (visible to everyone)
const publicMembers = [
  {
    id: 'member-startup-1',
    name: 'Alex Chen',
    passportId: 'TG-2025-101',
    location: { lat: 37.7749, lng: -122.4194, name: 'San Francisco' },
    bio: 'Founder of Blockchain Solutions Inc.',
    joinedDate: '2025-01-15',
  },
  {
    id: 'member-startup-2',
    name: 'Sarah Martinez',
    passportId: 'TG-2025-102',
    location: { lat: 40.7128, lng: -74.0060, name: 'New York' },
    bio: 'CEO of Green Tech Ventures',
    joinedDate: '2025-02-01',
  },
];

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
    <div className="relative h-screen overflow-hidden bg-[#000000]">
      {/* Left Sidebar with Title and Info - Top Half Only */}
      <div className="fixed top-0 left-0 w-80 bg-[#000000] border-r border-[#3f6053]/30 z-[9999] flex flex-col" style={{ height: '50vh' }}>
        {/* Title Section */}
        <div className="p-6 border-b border-[#3f6053]/40">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex items-center gap-1 px-4 py-2">
              <div className="h-px bg-[#3f6053]/40 flex-1 w-8"></div>
              <span className="text-xs text-white/70 uppercase tracking-widest px-2">
                Guild Navigation
              </span>
              <div className="h-px bg-[#3f6053]/40 flex-1 w-8"></div>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif text-white tracking-wide mb-4 text-center"
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

          <p className="text-sm text-white/70 text-center italic font-serif mb-6">
            "The journey of a thousand miles begins with a single step"
          </p>
        </div>

        {/* Info Section */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gradient-to-br from-[#2b4539]/20 to-[#3f6053]/20 border border-[#3f6053]/30 rounded-lg backdrop-blur-sm p-4">
            <h3 className="text-xs uppercase tracking-wider text-[#F6FAF6] mb-3 font-serif">
              Welcome to Telos League
            </h3>
            <p className="text-white/60 text-sm italic">
              Click the Login button to access the full network
            </p>
          </div>
        </div>
      </div>

      {/* Map - full screen */}
      <div className="h-full w-full">
        <GuildMap
          caravans={publicExpeditions}
          members={publicMembers}
          properties={telosHouses}
          selectedCaravan={null}
          onElementClick={() => {}}
        />
      </div>

      {/* Map Legend */}
      <div className="fixed bottom-4 right-4 z-[9997] max-w-[90vw] md:max-w-none">
        <div className="bg-[#000000]/95 backdrop-blur-md rounded-lg border-2 border-[#3f6053]/50 shadow-2xl overflow-hidden p-4">
          <h3 className="font-serif text-white text-sm uppercase tracking-wider mb-3 border-b border-[#3f6053]/30 pb-2">
            Map Legend
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <img
                src="/telos-house-logo.png"
                alt="Telos House"
                className="w-7 h-7 object-contain -ml-1"
              />
              <span className="text-white/90">Telos House Locations</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#00ff41]"></div>
              <span className="text-white/90">Startup Cohort Members</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-0.5 bg-gradient-to-r from-[#00ff41] to-[#00ff41]/50"></div>
              <span className="text-white/90">Guild Expeditions</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#3f6053]/30">
            <p className="text-[10px] text-white/50 italic">
              Login to view suppliers & partner VCs
            </p>
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
