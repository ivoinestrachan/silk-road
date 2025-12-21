'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { HiHome, HiArrowRight } from 'react-icons/hi';
import PassportOverlay from '@/components/PassportOverlay';
import PhotoGalleryModal from '@/components/PhotoGalleryModal';
import MiniBrowserModal from '@/components/MiniBrowserModal';
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
  const [showTelosIframe, setShowTelosIframe] = useState(false);
  const [selectedTelosProperty, setSelectedTelosProperty] = useState<Property | null>(null);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [photoGalleryLocation, setPhotoGalleryLocation] = useState<string>('');
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

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

  const handleElementClick = (element: MapElement & { clickX?: number; clickY?: number }) => {
    // Calculate modal position near click location
    const calculateModalPosition = () => {
      if (typeof window === 'undefined') return { x: 0, y: 0 };

      const modalWidth = 500;
      const modalHeight = 600;
      const padding = 20;

      let x = element.clickX || window.innerWidth / 2;
      let y = element.clickY || window.innerHeight / 2;

      // Adjust if modal would go off-screen on the right
      if (x + modalWidth + padding > window.innerWidth) {
        x = window.innerWidth - modalWidth - padding;
      }

      // Adjust if modal would go off-screen on the bottom
      if (y + modalHeight > window.innerHeight) {
        y = window.innerHeight - modalHeight - padding;
      }

      // Ensure minimum padding from top and left
      x = Math.max(padding, x);
      y = Math.max(padding, y);

      return { x, y };
    };

    // Check if it's a Telos House
    if (element.type === 'property') {
      const property = element.data as Property;
      if (property.id === 'prop-telos' || property.id === 'prop-telos-sf' || property.id === 'prop-telos-shenzhen') {
        setModalPosition(calculateModalPosition());
        setSelectedTelosProperty(property);
        setTelosHouseUrl('https://house-eight-gamma.vercel.app/');
        setShowTelosIframe(false);
        setShowTelosModal(true);
        return;
      }
    }

    // Check if it's a caravan waypoint click (for photo gallery)
    if (element.type === 'caravan') {
      const caravan = element.data as any;
      if (caravan.selectedWaypoint) {
        setModalPosition(calculateModalPosition());
        // Show photo gallery for this waypoint
        setPhotoGalleryLocation(caravan.selectedWaypoint.name);
        setShowPhotoGallery(true);
        return;
      }
    }

    // Default modal position
    setModalPosition(calculateModalPosition());

    setSelectedElement(element);
  };

  const renderElementModal = () => {
    if (!selectedElement) return null;

    if (selectedElement.type === 'caravan') {
      const caravan = selectedElement.data as Caravan;
      return (
        <MiniBrowserModal
          title={caravan.name}
          onClose={() => setSelectedElement(null)}
          position={modalPosition}
          width="500px"
        >
          <div>

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
        </MiniBrowserModal>
      );
    }

    if (selectedElement.type === 'property') {
      const property = selectedElement.data as Property;

      return (
        <MiniBrowserModal
          title={property.name}
          onClose={() => setSelectedElement(null)}
          position={modalPosition}
          width="500px"
        >
          <div>

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
        </MiniBrowserModal>
      );
    }

    if (selectedElement.type === 'member') {
      const member = selectedElement.data as GuildMember;
      const isPartnerVC = member.passportId.startsWith('VC-');

      return (
        <MiniBrowserModal
          title={`${member.name} - ${member.passportId}`}
          onClose={() => setSelectedElement(null)}
          position={modalPosition}
          width="450px"
        >
          <div className="bg-gradient-to-r from-[#2c3e2e] to-[#1a3a2e] -mx-6 -mt-6 p-4 mb-4 border-b-2 border-[#C4B89D]">
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

            <div className="bg-gradient-to-r from-[#2c3e2e] to-[#1a3a2e] -mx-6 -mb-6 px-5 py-3 border-t-2 border-[#C4B89D] mt-4">
              <p className="text-xs text-[#C4B89D]/70 text-center italic font-serif">
                "The journey of a thousand miles begins with a single step"
              </p>
            </div>
        </MiniBrowserModal>
      );
    }

    return null;
  };

  const renderTelosModal = () => {
    if (!showTelosModal || !selectedTelosProperty) return null;

    const handleCloseModal = () => {
      setShowTelosModal(false);
      setShowTelosIframe(false);
      setSelectedTelosProperty(null);
    };

    // Calculate position with slight offset for stacking
    const iframePosition = showTelosIframe ? {
      x: modalPosition.x + 30,
      y: modalPosition.y + 30
    } : modalPosition;

    // Show iframe view
    if (showTelosIframe) {
      return (
        <MiniBrowserModal
          title={`${selectedTelosProperty.name} - Virtual Tour`}
          onClose={handleCloseModal}
          position={iframePosition}
          width="1200px"
          height="90vh"
        >
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#3f3f46]">
            <button
              onClick={() => setShowTelosIframe(false)}
              className="text-[#888888] hover:text-[#cccccc] text-sm flex items-center gap-2 transition-colors"
            >
              ← Back to Info
            </button>
            <div className="h-4 w-px bg-[#3f3f46]"></div>
            <img
              src="/telos-house-logo.png"
              alt="Telos House"
              className="w-8 h-8 object-contain"
            />
            <div>
              <p className="text-sm text-[#cccccc] font-semibold">{selectedTelosProperty.name}</p>
              <p className="text-xs text-[#888888]">Virtual Tour</p>
            </div>
          </div>
          <iframe
            src={telosHouseUrl}
            className="w-full rounded border border-[#3f3f46]"
            style={{ height: 'calc(90vh - 150px)' }}
            title="Telos House"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </MiniBrowserModal>
      );
    }

    // Determine status and styling based on property
    const isUpcoming = selectedTelosProperty.description?.includes('[UPCOMING]') || false;
    const isHeadquarters = selectedTelosProperty.id === 'prop-telos';

    let statusBadge = null;
    let statusText = 'ACTIVE';
    let statusColor = '#6366f1';

    if (isHeadquarters) {
      statusText = 'HEADQUARTERS';
      statusColor = '#ffd700';
      statusBadge = (
        <div className="px-3 py-1 bg-[#ffd700] text-black text-xs font-bold rounded">
          HEADQUARTERS
        </div>
      );
    } else if (isUpcoming) {
      statusText = 'UPCOMING';
      statusColor = '#f97316';
      statusBadge = (
        <div className="px-3 py-1 bg-[#f97316] text-white text-xs font-bold rounded">
          UPCOMING
        </div>
      );
    } else {
      statusBadge = (
        <div className="px-3 py-1 bg-[#6366f1] text-white text-xs font-bold rounded">
          ACTIVE
        </div>
      );
    }

    // Show info card view
    return (
      <MiniBrowserModal
        title={`${selectedTelosProperty.name} - Location Details`}
        onClose={handleCloseModal}
        position={modalPosition}
        width="700px"
        height="auto"
      >
        <div className="space-y-6">
          {/* Header section */}
          <div className="flex items-start gap-4 pb-4 border-b border-[#3f3f46]">
            <img
              src="/telos-house-logo.png"
              alt="Telos House"
              className="w-16 h-16 object-contain"
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-[#cccccc] mb-2">
                {selectedTelosProperty.name}
              </h3>
              <p className="text-sm text-[#888888] mb-2">
                {selectedTelosProperty.location.name}
              </p>
              {statusBadge}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-[#cccccc] leading-relaxed">
              {selectedTelosProperty.description?.replace('[UPCOMING]', '').trim() || 'No description available'}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#252526] p-4 rounded border border-[#3f3f46]">
              <p className="text-[#888888] text-xs uppercase tracking-wider mb-1">Type</p>
              <p className="text-[#cccccc] font-semibold text-lg capitalize">{selectedTelosProperty.type}</p>
            </div>
            <div className="bg-[#252526] p-4 rounded border border-[#3f3f46]">
              <p className="text-[#888888] text-xs uppercase tracking-wider mb-1">Capacity</p>
              <p className="text-[#cccccc] font-semibold text-lg">{selectedTelosProperty.capacity} people</p>
            </div>
          </div>

          {/* Amenities section */}
          <div>
            <p className="text-[#888888] text-sm uppercase tracking-wider mb-3 font-semibold">Amenities & Features</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedTelosProperty.amenities?.map((amenity) => (
                <span
                  key={amenity}
                  className="px-3 py-1.5 bg-[#2d2d30] text-[#cccccc] text-sm rounded border border-[#3f3f46] hover:border-[#6b6b6b] transition-colors"
                >
                  {amenity}
                </span>
              )) || <p className="text-[#888888] text-sm">No amenities listed</p>}
            </div>

            <button
              onClick={() => setShowTelosIframe(true)}
              className="w-full py-3 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded font-semibold text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2"
            >
              View House <HiArrowRight className="text-lg" />
            </button>
          </div>
        </div>
      </MiniBrowserModal>
    );
  };

  return (
    <div className="relative h-screen overflow-hidden bg-[#000000]">
      {/* Left Sidebar with Title and Filters - Top Half Only */}
      <div className="fixed top-0 left-0 w-80 bg-[#000000] border-r border-[#3f6053]/30 z-[9999] flex flex-col" style={{ height: '50vh' }}>
        {/* Title Section */}
        <div className="p-6 border-b border-[#3f6053]/40 flex-shrink-0">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex items-center gap-1 px-4 py-2">
              <div className="h-px bg-[#3f6053]/40 flex-1 w-8"></div>
              <span className="text-xs text-white/70 uppercase tracking-widest px-2">
                Guild Navigation
              </span>
              <div className="h-px bg-[#3f6053]/40 flex-1 w-8"></div>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif text-white tracking-wide mb-2 text-center"
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}
          >
            TELOS LEAGUE
          </h1>
          <p className="text-xs text-white/80 text-center uppercase tracking-wider mb-3">
            Trad-Digital Network
          </p>

          <div className="h-px bg-[#3f6053]/40 mb-3"></div>

          <p className="text-sm text-white/70 text-center italic font-serif mb-3">
            "The journey of a thousand miles begins with a single step"
          </p>

          {isAdmin && (
            <div className="mb-0">
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
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
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

      {/* Reset Camera Button */}
      <button
        onClick={() => {
          const mapContainer = document.querySelector('.mapboxgl-map');
          if (mapContainer) {
            const event = new CustomEvent('resetCamera');
            mapContainer.dispatchEvent(event);
          }
        }}
        className="fixed top-4 left-4 z-[9998] bg-[#000000]/90 backdrop-blur-sm p-3 rounded-lg shadow-2xl border-2 border-[#F6FAF6]/50 hover:bg-[#000000]/95 hover:border-[#F6FAF6] transition-all"
        title="Reset camera to default view"
      >
        <HiHome className="text-white text-xl" />
      </button>

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

      {/* Map - full screen */}
      <div className="h-full w-full">
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

      {/* Element Info Modal */}
      {renderElementModal()}

      {/* Telos House Modal */}
      {renderTelosModal()}

      {/* Photo Gallery Modal */}
      {showPhotoGallery && (
        <PhotoGalleryModal
          locationName={photoGalleryLocation}
          onClose={() => setShowPhotoGallery(false)}
          isAdmin={isAdmin}
          position={modalPosition}
        />
      )}

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
