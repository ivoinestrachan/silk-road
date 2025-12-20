'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import PassportOverlay from '@/components/PassportOverlay';
import {
  allCaravans,
  properties,
  partnerVCs,
  supplierLinks,
} from '@/data/mockData';
import { Caravan, GuildMember, Property } from '@/types/guild';

const GuildMap = dynamic(() => import('@/components/GuildMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#000000]">
      <p className="text-[#2b4539]">Loading map...</p>
    </div>
  ),
});

type FilterCategory = {
  id: string;
  label: string;
  requiresAuth?: boolean;
};

const filterCategories: FilterCategory[] = [
  { id: 'caravans', label: 'Caravan Expeditions' },
  { id: 'locations', label: 'Telos Locations' },
  { id: 'partners', label: 'Partners VCs', requiresAuth: true },
  { id: 'suppliers', label: 'Supplier Links', requiresAuth: true },
];

type MapElement = {
  type: 'caravan' | 'member' | 'property';
  data: Caravan | GuildMember | Property;
};

export default function MapPage() {
  const router = useRouter();
  const [activeFilters, setActiveFilters] = useState<string[]>(['caravans', 'locations']);
  const [selectedElement, setSelectedElement] = useState<MapElement | null>(null);
  const [passportId, setPassportId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showTelosModal, setShowTelosModal] = useState(false);
  const [telosHouseUrl, setTelosHouseUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(authStatus);

      const storedPassportId = localStorage.getItem('passportId');
      const adminStatus = localStorage.getItem('isAdmin');

      if (storedPassportId) setPassportId(storedPassportId);
      if (adminStatus === 'true') setIsAdmin(true);

      // Set default filters based on auth status
      if (authStatus) {
        setActiveFilters(['caravans', 'locations', 'partners']);
      } else {
        setActiveFilters(['caravans', 'locations']);
      }
    }
  }, [router]);

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('passportId');
    localStorage.removeItem('isAdmin');
    setIsAuthenticated(false);
    setActiveFilters(['caravans', 'locations']);
    router.push('/login');
  };

  const handleElementClick = (element: MapElement) => {
    // Check if it's a Telos House
    if (element.type === 'property') {
      const property = element.data as Property;
      if (property.id === 'prop-telos' || property.id === 'prop-telos-shenzhen') {
        setTelosHouseUrl('https://house-eight-gamma.vercel.app/');
        setShowTelosModal(true);
        return;
      }
    }

    setSelectedElement(element);
  };

  const renderElementModal = () => {
    if (!selectedElement) return null;

    if (selectedElement.type === 'caravan') {
      const caravan = selectedElement.data as Caravan;
      return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setSelectedElement(null)}>
          <div className="bg-gradient-to-br from-[#2b4539] to-[#3f6053] p-6 rounded-lg border-2 border-[#3f6053] max-w-lg w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-serif text-2xl text-[#F6FAF6]">{caravan.name}</h3>
              <button onClick={() => setSelectedElement(null)} className="text-[#F6FAF6] hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs uppercase tracking-wide border rounded ${
                  caravan.status === 'live' ? 'bg-[#3f6053]/40 text-[#F6FAF6] border-[#F6FAF6]/30' :
                  caravan.status === 'upcoming' ? 'bg-[#2b4539]/60 text-[#F6FAF6] border-[#F6FAF6]/30' :
                  'bg-[#000000]/40 text-[#ffffff]/80 border-[#3f6053]'
                }`}>
                  {caravan.status}
                </span>
              </div>

              <div>
                <span className="text-[#F6FAF6] font-semibold">Route:</span>
                <p className="text-[#ffffff]/90">{caravan.route.start.name} → {caravan.route.end.name}</p>
              </div>

              {caravan.route.waypoints && caravan.route.waypoints.length > 0 && (
                <div>
                  <span className="text-[#F6FAF6] font-semibold">Waypoints:</span>
                  <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                    {caravan.route.waypoints.map((waypoint, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <span className="text-[#F6FAF6]/80">{index + 1}.</span>
                        <span className="text-[#ffffff]/90">{waypoint.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {caravan.description && (
                <div>
                  <span className="text-[#F6FAF6] font-semibold">Description:</span>
                  <p className="text-[#ffffff]/80 italic">{caravan.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-[#000000]/20 p-2 rounded border border-[#3f6053]/30">
                  <span className="text-[#F6FAF6]/70 text-xs">⚑ Waypoints</span>
                  <p className="text-[#F6FAF6] font-semibold">{caravan.stops.length}</p>
                </div>
                {caravan.participants > 0 && (
                  <div className="bg-[#000000]/20 p-2 rounded border border-[#3f6053]/30">
                    <span className="text-[#F6FAF6]/70 text-xs">⚒ Participants</span>
                    <p className="text-[#F6FAF6] font-semibold">{caravan.participants}</p>
                  </div>
                )}
              </div>

              {((caravan.boats && caravan.boats > 0) || (caravan.horses && caravan.horses > 0)) && (
                <div className="grid grid-cols-2 gap-2">
                  {caravan.boats && caravan.boats > 0 && (
                    <div className="bg-[#000000]/20 p-2 rounded border border-[#3f6053]/30">
                      <span className="text-[#F6FAF6]/70 text-xs">⚓ Boats</span>
                      <p className="text-[#F6FAF6] font-semibold">{caravan.boats}</p>
                    </div>
                  )}
                  {caravan.horses && caravan.horses > 0 && (
                    <div className="bg-[#000000]/20 p-2 rounded border border-[#3f6053]/30">
                      <span className="text-[#F6FAF6]/70 text-xs">🐴 Horses</span>
                      <p className="text-[#F6FAF6] font-semibold">{caravan.horses}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-[#3f6053]/30">
              <a
                href={`/contribute?project=${encodeURIComponent(caravan.name)}`}
                target="_blank"
                className="block w-full py-2.5 px-4 bg-gradient-to-r from-[#F6FAF6] to-[#ffffff] text-[#2b4539] text-center rounded font-semibold text-sm uppercase tracking-wide hover:shadow-lg transition-all"
              >
                Contribute
              </a>
            </div>
          </div>
        </div>
      );
    }

    if (selectedElement.type === 'property') {
      const property = selectedElement.data as Property;

      return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setSelectedElement(null)}>
          <div className="bg-gradient-to-br from-[#2b4539] to-[#3f6053] p-6 rounded-lg border-2 border-[#3f6053]/50 max-w-lg w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-serif text-2xl text-white">{property.name}</h3>
              <button onClick={() => setSelectedElement(null)} className="text-white hover:text-[#F6FAF6] text-2xl leading-none">&times;</button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="px-3 py-1 text-xs uppercase tracking-wide bg-[#F6FAF6]/20 text-[#F6FAF6] rounded">
                  {property.type}
                </span>
              </div>

              {property.description && (
                <div>
                  <span className="text-[#F6FAF6]">Description:</span>
                  <p className="text-white/90">{property.description}</p>
                </div>
              )}

              <div>
                <span className="text-[#F6FAF6]">Location:</span>
                <p className="text-white/90">{property.location.name}</p>
              </div>

              {property.capacity && (
                <div>
                  <span className="text-[#F6FAF6]">Capacity:</span>
                  <p className="text-white/90">{property.capacity} members</p>
                </div>
              )}

              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <span className="text-[#F6FAF6]">Amenities:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <span key={index} className="px-2 py-1 bg-[#3f6053]/40 text-white text-xs rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-[#3f6053]/30">
              <a
                href={`/contribute?project=${encodeURIComponent(property.name)}`}
                target="_blank"
                className="block w-full py-2.5 px-4 bg-gradient-to-r from-[#F6FAF6] to-[#ffffff] text-[#2b4539] text-center rounded font-semibold text-sm uppercase tracking-wide hover:shadow-lg transition-all"
              >
                Contribute
              </a>
            </div>
          </div>
        </div>
      );
    }

    if (selectedElement.type === 'member') {
      const member = selectedElement.data as GuildMember;
      const isPartnerVC = member.passportId.startsWith('VC-');

      return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setSelectedElement(null)}>
          <div className="bg-gradient-to-br from-[#8B7355] to-[#6B5845] rounded-lg border-2 border-[#C4B89D] shadow-2xl overflow-hidden max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#2c3e2e] to-[#1a3a2e] p-4 border-b-2 border-[#C4B89D]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-[#C4B89D]/20 rounded-full border-3 border-[#C4B89D] flex items-center justify-center overflow-hidden">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : isPartnerVC ? (
                      <span className="text-3xl">💼</span>
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl text-[#E8E4D9]">{member.name}</h3>
                    <p className="text-xs text-[#C4B89D] uppercase tracking-widest font-mono">
                      {member.passportId}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedElement(null)} className="text-[#E8E4D9] hover:text-white text-2xl leading-none">&times;</button>
              </div>
            </div>

            <div className="p-5 bg-[#E8E4D9]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6b7c6b] uppercase tracking-wide font-serif">
                    Member Type
                  </span>
                  <span className={`px-3 py-1 text-xs uppercase tracking-wide rounded ${
                    isPartnerVC
                      ? 'bg-[#F6FAF6]/20 text-[#F6FAF6] border border-[#F6FAF6]/50'
                      : 'bg-[#3f6053]/40 text-white border border-[#3f6053]/50'
                  }`}>
                    {isPartnerVC ? 'Partner VC' : 'Guild Member'}
                  </span>
                </div>

                <div className="h-px bg-[#C4B89D]"></div>

                {member.bio && (
                  <div>
                    <p className="text-xs text-[#6b7c6b] uppercase tracking-wide font-serif mb-1">
                      About
                    </p>
                    <p className="text-sm text-[#2c3e2e] font-serif italic leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-[#6b7c6b] uppercase tracking-wide font-serif mb-1">
                    Location
                  </p>
                  <p className="text-sm text-[#2c3e2e] font-serif flex items-center gap-1">
                    📍 {member.location.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#6b7c6b] uppercase tracking-wide font-serif mb-1">
                    Member Since
                  </p>
                  <p className="text-sm text-[#2c3e2e] font-serif">
                    {new Date(member.joinedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#C4B89D]">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2">
                        <img
                          src="/telos-house-logo.png"
                          alt="Guild Badge"
                          className="w-12 h-12 mx-auto object-contain opacity-80"
                        />
                      </div>
                      <p className="text-xs text-[#6b7c6b] uppercase tracking-widest font-serif">
                        Telos League
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#2c3e2e] to-[#1a3a2e] px-5 py-3 border-t-2 border-[#C4B89D]">
              <p className="text-xs text-[#C4B89D]/70 text-center italic font-serif">
                "The journey of a thousand miles begins with a single step"
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderTelosModal = () => {
    if (!showTelosModal) return null;

    return (
      <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowTelosModal(false)}>
        <div className="bg-gradient-to-br from-[#2c3e2e] to-[#1a3a2e] p-8 rounded-lg border-2 border-[#F6FAF6]/30 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="text-center mb-6">
            <img
              src="/telos-house-logo.png"
              alt="Telos House"
              className="w-24 h-24 mx-auto mb-4 object-contain"
            />
            <h2 className="font-serif text-3xl text-[#F6FAF6] mb-2">Telos House</h2>
            <p className="text-sm text-[#F6FAF6]/70 uppercase tracking-widest">Guild Headquarters</p>
          </div>

          <div className="space-y-4">
            <p className="text-center text-[#F6FAF6]/90 italic font-serif">
              "Where innovation meets tradition"
            </p>

            <a
              href={telosHouseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 px-4 bg-gradient-to-r from-[#F6FAF6] to-[#ffffff] text-[#2c3e2e] text-center rounded font-semibold text-sm uppercase tracking-wide hover:shadow-lg transition-all"
            >
              Visit Telos House
            </a>

            <button
              onClick={() => setShowTelosModal(false)}
              className="block w-full py-2 px-4 bg-transparent border border-[#F6FAF6]/30 text-[#F6FAF6] text-center rounded text-sm uppercase tracking-wide hover:bg-[#F6FAF6]/10 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative h-screen overflow-hidden bg-[#000000]">
      {/* Left Sidebar with Title and Filters - Top Half Only */}
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

          {isAdmin && (
            <div className="mb-4">
              <button
                onClick={() => router.push('/admin')}
                className="w-full py-2 text-xs uppercase tracking-wide rounded bg-[#F6FAF6]/20 text-[#F6FAF6] hover:bg-[#F6FAF6]/30 transition-all border border-[#F6FAF6]/50"
              >
                Admin Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gradient-to-br from-[#2b4539]/20 to-[#3f6053]/20 border border-[#3f6053]/30 rounded-lg backdrop-blur-sm p-4">
            <h3 className="text-xs uppercase tracking-wider text-[#F6FAF6] mb-3 font-serif">
              Map Filters
            </h3>
            <div className="flex flex-col gap-3">
              {filterCategories.map((category) => {
                const isLocked = category.requiresAuth && !isAuthenticated;

                return (
                  <label
                    key={category.id}
                    className={`flex items-center gap-2 ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}`}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={activeFilters.includes(category.id)}
                        onChange={() => !isLocked && toggleFilter(category.id)}
                        disabled={isLocked}
                        className="peer sr-only"
                      />
                      <div className="w-4 h-4 border border-[#3f6053]/50 rounded bg-transparent peer-checked:bg-[#F6FAF6]/20 peer-checked:border-[#F6FAF6] transition-all" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                        <div className="w-2 h-2 bg-[#F6FAF6] rounded-sm" />
                      </div>
                    </div>
                    <span className="text-xs text-white/80 group-hover:text-white transition-colors uppercase tracking-wide flex items-center gap-2">
                      {category.label}
                      {isLocked && <span className="text-[10px]">🔒</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="fixed bottom-4 right-4 z-[9997] max-w-[90vw] md:max-w-none">
        <div className="bg-[#000000]/95 backdrop-blur-md rounded-lg border-2 border-[#3f6053]/50 shadow-2xl overflow-hidden p-4">
          <h3 className="font-serif text-white text-sm uppercase tracking-wider mb-3 border-b border-[#3f6053]/30 pb-2">
            Map Legend
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-red-600/80 rounded-full flex items-center justify-center border border-red-500/50 relative">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-white/90">Live Event</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-amber-600/70 rounded border border-amber-500/50"></div>
              <span className="text-white/90">Upcoming Route</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-[#c41e3a] rounded border border-[#a01628]"></div>
              <span className="text-white/90">Completed Route</span>
            </div>
            <div className="flex items-center gap-2.5">
              <img
                src="/telos-house-logo.png"
                alt="Telos House"
                className="w-7 h-7 object-contain -ml-1"
              />
              <span className="text-white/90">Telos House</span>
            </div>
            {isAuthenticated && (
              <>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 bg-[#3f6053] rounded-full border-2 border-[#2b4539]"></div>
                  <span className="text-white/90">Partner VCs</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 bg-[#3f6053] rounded flex items-center justify-center border border-[#3f6053]">
                    🏭
                  </div>
                  <span className="text-white/90">Supplier Links</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Map - offset by sidebar width, no background on left side */}
      <div className="h-full">
        <div className="ml-80 h-full">
        <GuildMap
          caravans={activeFilters.includes('caravans') ? allCaravans : []}
          members={isAuthenticated && activeFilters.includes('partners') ? partnerVCs : []}
          properties={[
            ...(activeFilters.includes('locations') ? properties : []),
            ...(isAuthenticated && activeFilters.includes('suppliers') ? supplierLinks : []),
          ]}
          selectedCaravan={null}
          selectedElement={selectedElement}
          onElementClick={handleElementClick}
          isAuthenticated={isAuthenticated}
        />
        </div>
      </div>

      {/* Element Info Modal */}
      {renderElementModal()}

      {/* Telos House Modal */}
      {renderTelosModal()}

      {/* Passport Overlay Button */}
      {isAuthenticated && (
        <PassportOverlay
          passportId={passportId}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
