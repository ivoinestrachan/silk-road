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
    <div className="w-full h-full flex items-center justify-center bg-[#0a1a1a]">
      <p className="text-teal-400">Loading map...</p>
    </div>
  ),
});

type FilterCategory = {
  id: string;
  label: string;
  upcoming?: boolean;
};

const filterCategories: FilterCategory[] = [
  { id: 'caravans', label: 'Caravan Expeditions' },
  { id: 'locations', label: 'Telos Locations' },
  { id: 'partners', label: 'Partners VCs' },
  { id: 'suppliers', label: 'Supplier Links', upcoming: true },
  { id: 'procurement', label: 'Procurement of Materials', upcoming: true },
];

type MapElement = {
  type: 'caravan' | 'member' | 'property';
  data: Caravan | GuildMember | Property;
};

export default function MapPage() {
  const router = useRouter();
  const [activeFilters, setActiveFilters] = useState<string[]>(['caravans', 'locations', 'partners']);
  const [selectedElement, setSelectedElement] = useState<MapElement | null>(null);
  const [passportId, setPassportId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      if (isAuthenticated !== 'true') {
        router.push('/login');
        return;
      }
      const storedPassportId = localStorage.getItem('passportId');
      const adminStatus = localStorage.getItem('isAdmin');
      if (storedPassportId) setPassportId(storedPassportId);
      if (adminStatus === 'true') setIsAdmin(true);
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
    router.push('/login');
  };

  const renderInfoPanel = () => {
    if (!selectedElement) {
      return (
        <div className="flex items-center justify-center h-32 text-white/60 text-sm italic bg-gradient-to-br from-[#2b4539]/20 to-[#3f6053]/20 border border-[#3f6053]/30 rounded-lg backdrop-blur-sm"
          style={{
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          Select an element on the map to view details
        </div>
      );
    }

    if (selectedElement.type === 'caravan') {
      const caravan = selectedElement.data as Caravan;
      return (
        <div className="space-y-3 bg-gradient-to-br from-[#2b4539] to-[#3f6053] p-5 rounded-lg border-2 border-[#3f6053]/50"
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.15)'
          }}
        >
          <div className="flex items-start justify-between">
            <h3 className="font-serif text-lg text-white">{caravan.name}</h3>
            <span className={`px-2 py-1 text-xs uppercase tracking-wide ${
              caravan.status === 'live' ? 'bg-red-900/40 text-red-300' :
              caravan.status === 'upcoming' ? 'bg-amber-900/40 text-amber-300' :
              'bg-gray-800/40 text-gray-400'
            }`}>
              {caravan.status}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-[#F6FAF6]">Route:</span>
              <p className="text-white/90">{caravan.route.start.name} → {caravan.route.end.name}</p>
            </div>

            {caravan.route.waypoints && caravan.route.waypoints.length > 0 && (
              <div>
                <span className="text-[#F6FAF6]">Waypoints:</span>
                <div className="mt-1 space-y-1">
                  {caravan.route.waypoints.map((waypoint, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <span className="text-[#F6FAF6]">{index + 1}.</span>
                      <span className="text-white/90">{waypoint.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {caravan.description && (
              <div>
                <span className="text-[#F6FAF6]">Description:</span>
                <p className="text-white/80 italic">{caravan.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <span className="text-[#F6FAF6] text-xs">⚑ Waypoints:</span>
                <p className="text-white">{caravan.stops.length}</p>
              </div>
              {caravan.participants > 0 && (
                <div>
                  <span className="text-[#F6FAF6] text-xs">⚒ Participants:</span>
                  <p className="text-white">{caravan.participants}</p>
                </div>
              )}
            </div>

            {((caravan.boats && caravan.boats > 0) || (caravan.horses && caravan.horses > 0)) && (
              <div className="grid grid-cols-2 gap-2">
                {caravan.boats && caravan.boats > 0 && (
                  <div>
                    <span className="text-[#F6FAF6] text-xs">⚓ Boats:</span>
                    <p className="text-white">{caravan.boats}</p>
                  </div>
                )}
                {caravan.horses && caravan.horses > 0 && (
                  <div>
                    <span className="text-[#F6FAF6] text-xs">🐴 Horses:</span>
                    <p className="text-white">{caravan.horses}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (selectedElement.type === 'property') {
      const property = selectedElement.data as Property;
      const isTelosHouse = property.id === 'prop-telos' || property.id === 'prop-telos-shenzhen';

      if (isTelosHouse) {
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#2b4539] to-[#3f6053] p-6 rounded-lg border-2 border-[#F6FAF6]/30"
              style={{
                boxShadow: '0 12px 40px rgba(0,0,0,0.6), inset 0 2px 4px rgba(246,250,246,0.1)'
              }}
            >
              <div className="flex items-center justify-center mb-4">
                <img
                  src="/telos-house-logo.png"
                  alt="Telos House"
                  className="w-20 h-20 object-contain"
                />
              </div>

              <h3 className="font-serif text-2xl text-[#F6FAF6] text-center mb-2 tracking-wide">
                {property.name}
              </h3>

              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px bg-[#F6FAF6]/30 flex-1"></div>
                <span className="px-3 py-1 text-xs uppercase tracking-widest bg-[#F6FAF6]/20 text-[#F6FAF6] border border-[#F6FAF6]/30 rounded">
                  Guild Headquarters
                </span>
                <div className="h-px bg-[#F6FAF6]/30 flex-1"></div>
              </div>

              <p className="text-sm text-white/90 text-center italic mb-4 leading-relaxed">
                {property.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#000000]/40 p-3 rounded border border-[#F6FAF6]/20">
                  <p className="text-xs text-[#F6FAF6]/70 uppercase tracking-wide mb-1">Location</p>
                  <p className="text-sm text-white font-serif">📍 {property.location.name}</p>
                </div>
                <div className="bg-[#000000]/40 p-3 rounded border border-[#F6FAF6]/20">
                  <p className="text-xs text-[#F6FAF6]/70 uppercase tracking-wide mb-1">Capacity</p>
                  <p className="text-sm text-white font-serif">👥 {property.capacity} members</p>
                </div>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div className="bg-[#000000]/40 p-3 rounded border border-[#F6FAF6]/20">
                  <p className="text-xs text-[#F6FAF6]/70 uppercase tracking-wide mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <span key={index} className="px-2 py-1 bg-[#F6FAF6]/10 text-[#F6FAF6] text-xs rounded border border-[#F6FAF6]/30">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-3 bg-gradient-to-br from-[#2b4539] to-[#3f6053] p-5 rounded-lg border-2 border-[#3f6053]/50"
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.15)'
          }}
        >
          <div className="flex items-start justify-between">
            <h3 className="font-serif text-lg text-white">{property.name}</h3>
            <span className="px-2 py-1 text-xs uppercase tracking-wide bg-[#F6FAF6]/20 text-[#F6FAF6]">
              {property.type}
            </span>
          </div>

          <div className="space-y-2 text-sm">
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
        </div>
      );
    }

    if (selectedElement.type === 'member') {
      const member = selectedElement.data as GuildMember;
      const isPartnerVC = member.passportId.startsWith('VC-');

      return (
        <div className="relative">
          {/* Passport-like document for members */}
          <div className="bg-gradient-to-br from-[#8B7355] to-[#6B5845] rounded-lg border-2 border-[#C4B89D] shadow-2xl overflow-hidden"
            style={{
              boxShadow: '0 12px 40px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.1)'
            }}
          >
            {/* Document header */}
            <div className="bg-gradient-to-r from-[#2c3e2e] to-[#1a3a2e] p-4 border-b-2 border-[#C4B89D]">
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
                  <h3 className="font-serif text-xl text-[#E8E4D9] mb-1">{member.name}</h3>
                  <p className="text-xs text-[#C4B89D] uppercase tracking-widest font-mono">
                    {member.passportId}
                  </p>
                </div>
              </div>
            </div>

            {/* Document body */}
            <div className="p-5 bg-[#E8E4D9]">
              <div className="space-y-3">
                {/* Member type badge */}
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

                {/* Divider */}
                <div className="h-px bg-[#C4B89D]"></div>

                {/* Bio */}
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

                {/* Location */}
                <div>
                  <p className="text-xs text-[#6b7c6b] uppercase tracking-wide font-serif mb-1">
                    Location
                  </p>
                  <p className="text-sm text-[#2c3e2e] font-serif flex items-center gap-1">
                    📍 {member.location.name}
                  </p>
                </div>

                {/* Joined date */}
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

                {/* Guild logo/badge (if available) */}
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

            {/* Document footer */}
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

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#000000]">
      <div className="w-full md:w-96 lg:w-[28rem] md:flex-shrink-0 overflow-y-auto border-b md:border-b-0 md:border-r border-[#3f6053]/30 bg-[#000000] flex flex-col max-h-[40vh] md:max-h-none">
        <div className="p-6 border-b border-[#3f6053]/40 bg-[#000000]">
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

          <div className="bg-gradient-to-br from-[#2b4539]/20 to-[#3f6053]/20 border border-[#3f6053]/30 rounded-lg backdrop-blur-sm p-4"
            style={{
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <h3 className="text-xs uppercase tracking-wider text-[#F6FAF6] mb-3 font-serif">
              Map Filters
            </h3>
            <div className="flex flex-wrap gap-3">
              {filterCategories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={activeFilters.includes(category.id)}
                      onChange={() => toggleFilter(category.id)}
                      className="peer sr-only"
                    />
                    <div className="w-4 h-4 border border-[#3f6053]/50 rounded bg-transparent peer-checked:bg-[#F6FAF6]/20 peer-checked:border-[#F6FAF6] transition-all" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                      <div className="w-2 h-2 bg-[#F6FAF6] rounded-sm" />
                    </div>
                  </div>
                  <span className="text-xs text-white/80 group-hover:text-white transition-colors uppercase tracking-wide">
                    {category.label}
                    {category.upcoming && (
                      <span className="ml-1.5 text-[10px] text-[#3f6053]/60 italic">
                        (upcoming)
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-sm uppercase tracking-wider text-[#F6FAF6] mb-3 font-serif border-b border-[#3f6053]/30 pb-2">
            Information
          </h2>
          {renderInfoPanel()}
        </div>
      </div>

      <div className="flex-1 relative bg-[#000000]">
        <GuildMap
          caravans={activeFilters.includes('caravans') ? allCaravans : []}
          members={[
            ...(activeFilters.includes('partners') ? partnerVCs : []),
          ]}
          properties={[
            ...(activeFilters.includes('locations') ? properties : []),
            ...(activeFilters.includes('suppliers') ? supplierLinks : []),
          ]}
          selectedCaravan={null}
          onElementClick={(element) => setSelectedElement(element)}
        />

        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-[9997] max-w-[90vw] md:max-w-none">
          <div className="bg-[#000000] backdrop-blur-sm rounded-lg border-2 border-[#3f6053]/50 shadow-2xl overflow-hidden p-4"
            style={{
              boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.15)'
            }}
          >
            <h3 className="font-serif text-white text-sm uppercase tracking-wider mb-3 border-b border-[#3f6053]/30 pb-2">
              Map Legend
            </h3>
            <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 bg-red-600/80 rounded-full flex items-center justify-center border border-red-500/50">
                    ⚡
                  </div>
                  <span className="text-white/90">Live Caravan</span>
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
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 bg-[#F6FAF6]/90 rounded-full border-2 border-[#3f6053]"></div>
                  <span className="text-white/90">Partner VCs</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 bg-[#3f6053] rounded flex items-center justify-center border border-[#3f6053]">
                    🏭
                  </div>
                  <span className="text-white/90">Supplier Links</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Passport Overlay Button */}
      <PassportOverlay
        passportId={passportId}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
    </div>
  );
}
