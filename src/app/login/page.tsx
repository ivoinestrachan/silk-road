'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { allCaravans, properties } from '@/data/mockData';
import { Caravan, Property } from '@/types/guild';

const GuildMap = dynamic(() => import('@/components/GuildMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0a1a1a]">
      <p className="text-teal-400">Loading map...</p>
    </div>
  ),
});

const MiniBrowserModal = dynamic(() => import('@/components/MiniBrowserModal'), {
  ssr: false,
});

// Filter to show only Telos House locations (not suppliers or VCs)
const telosHouses = properties.filter(p =>
  p.id === 'prop-telos' || p.id === 'prop-telos-sf' || p.id === 'prop-telos-shenzhen'
);

// Old hardcoded data - now using real data from mockData
/*
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
*/

export default function LoginPage() {
  const [passportId, setPassportId] = useState('');
  const [error, setError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedElement, setSelectedElement] = useState<{ type: 'caravan' | 'property'; data: Caravan | Property; clickX?: number; clickY?: number } | null>(null);
  const [showTelosIframe, setShowTelosIframe] = useState(false);
  const router = useRouter();

  const calculateModalPosition = () => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };

    const modalWidth = 700;
    const modalHeight = 600;
    const padding = 20;
    const offset = 10;

    const clickX = selectedElement?.clickX || window.innerWidth / 2;
    const clickY = selectedElement?.clickY || window.innerHeight / 2;

    let x = clickX + offset;
    let y = clickY + offset;

    // Check right edge overflow
    if (x + modalWidth + padding > window.innerWidth) {
      x = clickX - modalWidth - offset;
      if (x < padding) {
        x = window.innerWidth - modalWidth - padding;
      }
    }

    // Check bottom edge overflow
    if (y + modalHeight > window.innerHeight) {
      y = clickY - modalHeight - offset;
      if (y < padding) {
        y = window.innerHeight - modalHeight - padding;
      }
    }

    // Final bounds check
    x = Math.max(padding, Math.min(x, window.innerWidth - modalWidth - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - modalHeight - padding));

    return { x, y };
  };

  const modalPosition = calculateModalPosition();

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
            TELOS GUILD NETWORK
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

      {/* Loading Screen */}
      {!mapLoaded && (
        <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-[#000000]">
          <img
            src="/telos-house-logo.png"
            alt="Telos House"
            className="w-32 h-32 mb-6 animate-pulse"
          />
          <h2 className="font-serif text-2xl text-white mb-2">Loading Map...</h2>
          <p className="text-white/60 text-sm">Preparing your journey</p>
        </div>
      )}

      {/* Map - full screen */}
      <div className="h-full w-full">
        <GuildMap
          caravans={allCaravans}
          members={[]}
          properties={telosHouses}
          selectedCaravan={null}
          onElementClick={(element) => {
            setSelectedElement(element as { type: 'caravan' | 'property'; data: Caravan | Property; clickX?: number; clickY?: number });
            if (element.type === 'property' && (element.data as Property).id.startsWith('prop-telos')) {
              setShowTelosIframe(true);
            }
          }}
          isModalOpen={!!selectedElement || showTelosIframe}
          onMapLoaded={() => setMapLoaded(true)}
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
        className="fixed top-2 right-2 md:top-4 md:right-4 z-[10000] bg-[#000000]/80 backdrop-blur-sm p-2 md:p-3 rounded-lg shadow-2xl border-2 border-[#3f6053]/50 hover:bg-[#000000]/90 hover:border-[#3f6053] transition-all duration-300"
        style={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 2px rgba(63,96,83,0.1)'
        }}
        aria-label="Login"
      >
        <div className="flex items-center gap-1 md:gap-2">
          <span className="text-xl md:text-2xl">🔐</span>
          <span className="text-xs md:text-sm font-serif text-white uppercase tracking-wide">Login</span>
        </div>
      </button>

      {/* Caravan/Property Details Modal */}
      {selectedElement && !showTelosIframe && selectedElement.type === 'caravan' && (
        <MiniBrowserModal
          title={(selectedElement.data as Caravan).name}
          onClose={() => setSelectedElement(null)}
          position={modalPosition}
          width="700px"
          height="auto"
        >
          <div>
            <p className="text-white/80 mb-4">{(selectedElement.data as Caravan).description}</p>

            {(selectedElement.data as Caravan).route && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-white mb-2">Route</h4>
                <p className="text-xs text-white/70">
                  {(selectedElement.data as Caravan).route.start.name} → {(selectedElement.data as Caravan).route.end.name}
                </p>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white mb-2">Participants</h4>
              <p className="text-xs text-white/70">{(selectedElement.data as Caravan).participants} members</p>
            </div>

            {(selectedElement.data as Caravan).status && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-white mb-2">Status</h4>
                <span className={`inline-block px-2 py-1 rounded text-xs ${
                  (selectedElement.data as Caravan).status === 'completed' ? 'bg-gray-500/30 text-gray-300' :
                  (selectedElement.data as Caravan).status === 'live' ? 'bg-green-500/30 text-green-300' :
                  'bg-amber-500/30 text-amber-300'
                }`}>
                  {(selectedElement.data as Caravan).status}
                </span>
              </div>
            )}

            <p className="text-xs text-white/50 mt-4 italic">
              Login to view full details and contribute
            </p>
          </div>
        </MiniBrowserModal>
      )}

      {/* Telos House Iframe Modal */}
      {selectedElement && selectedElement.type === 'property' && showTelosIframe && (
        (() => {
          const property = selectedElement.data as Property;
          const padding = 20;
          const iframeWidth = Math.min(1200, window.innerWidth - padding * 2);
          const iframeHeight = window.innerHeight * 0.9;

          let x = modalPosition.x + 30;
          let y = modalPosition.y + 30;

          if (x + iframeWidth + padding > window.innerWidth) {
            x = window.innerWidth - iframeWidth - padding;
          }
          if (y + iframeHeight > window.innerHeight) {
            y = window.innerHeight - iframeHeight - padding;
          }

          x = Math.max(padding, x);
          y = Math.max(padding, y);

          return (
            <div
              className="fixed z-[10001] bg-[#1e1e1e] border border-[#3f3f46] shadow-2xl overflow-hidden"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                width: `${iframeWidth}px`,
                height: `${iframeHeight}px`,
              }}
            >
              <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d30] border-b border-[#3f3f46]">
                <h3 className="text-xs text-[#cccccc] font-normal">{property.name}</h3>
                <button
                  onClick={() => {
                    setShowTelosIframe(false);
                    setSelectedElement(null);
                  }}
                  className="w-11 h-7 flex items-center justify-center hover:bg-[#e81123] text-[#cccccc] hover:text-white transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.5 0.5L9.5 9.5M9.5 0.5L0.5 9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              <iframe
                src="https://www.teloshouse.com"
                className="w-full h-[calc(100%-31px)] border-0"
                title={property.name}
              />
            </div>
          );
        })()
      )}

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
                TELOS GUILD NETWORK
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
