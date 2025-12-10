'use client';

import { Caravan } from '@/types/guild';

interface CaravanSidebarProps {
  caravans: Caravan[];
  selectedCaravan: Caravan | null;
  onSelectCaravan: (caravan: Caravan) => void;
}

export default function CaravanSidebar({
  caravans,
  selectedCaravan,
  onSelectCaravan,
}: CaravanSidebarProps) {
  const liveCaravans = caravans.filter((c) => c.status === 'live');
  const upcomingCaravans = caravans.filter((c) => c.status === 'upcoming');
  const completedCaravans = caravans.filter((c) => c.status === 'completed');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const CaravanCard = ({ caravan }: { caravan: Caravan }) => (
    <button
      onClick={() => onSelectCaravan(caravan)}
      className={`w-full text-left relative overflow-hidden transition-all cursor-pointer ${
        selectedCaravan?.id === caravan.id
          ? 'ring-2 ring-amber-500 shadow-lg'
          : 'hover:shadow-md'
      }`}
    >
      {/* Parchment-style card */}
      <div
        className="relative p-5"
        style={{
          background:
            'linear-gradient(135deg, #f5f1e8 0%, #ede5d4 50%, #f5f1e8 100%)',
          borderLeft: '4px solid #8b6914',
          borderRight: '4px solid #8b6914',
          boxShadow:
            'inset 0 1px 2px rgba(139, 105, 20, 0.1), 0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-700 opacity-30"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-700 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-700 opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-700 opacity-30"></div>

        {/* Status Banner */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {caravan.status === 'live' && (
              <>
                <span className="text-2xl">⚡</span>
                <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              </>
            )}
            {caravan.status === 'upcoming' && <span className="text-2xl">📅</span>}
            {caravan.status === 'completed' && <span className="text-2xl">✓</span>}
          </div>
          <div
            className={`px-3 py-1 font-serif text-xs uppercase tracking-widest ${
              caravan.status === 'live'
                ? 'bg-red-800 text-red-50'
                : caravan.status === 'upcoming'
                  ? 'bg-amber-700 text-amber-50'
                  : 'bg-stone-600 text-stone-50'
            }`}
            style={{
              clipPath:
                'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)',
            }}
          >
            {caravan.status === 'live' ? 'Live' : caravan.status === 'upcoming' ? 'Soon' : 'Complete'}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-wide">
          {caravan.name}
        </h3>

        {/* Route with decorative arrow */}
        <div className="mb-3 pb-3 border-b border-amber-900/20">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-700">
              {caravan.route.start.name}
            </span>
            <div className="flex-1 flex items-center">
              <div className="h-px bg-amber-900/30 flex-1"></div>
              <span className="text-amber-700 mx-1">⚔</span>
              <div className="h-px bg-amber-900/30 flex-1"></div>
            </div>
            <span className="font-medium text-gray-700">
              {caravan.route.end.name}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-amber-700">⚑</span>
            <span className="font-serif">
              {caravan.stops.length} Waypoints
            </span>
          </div>

          {caravan.participants > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <span className="text-amber-700">⚒</span>
                <span className="font-serif">{caravan.participants} Guild Members</span>
              </div>
              {(caravan.boats && caravan.boats > 0) || (caravan.horses && caravan.horses > 0) ? (
                <div className="flex items-center gap-3">
                  {caravan.boats && caravan.boats > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-amber-700">⛵</span>
                      <span className="font-serif">{caravan.boats} Boats</span>
                    </div>
                  )}
                  {caravan.horses && caravan.horses > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-amber-700">🐴</span>
                      <span className="font-serif">{caravan.horses} Horses</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-amber-700">⌛</span>
            <span className="font-serif text-xs">
              {formatDate(caravan.startDate)}
              {caravan.endDate && ` - ${formatDate(caravan.endDate)}`}
            </span>
          </div>
        </div>

        {/* Live location */}
        {caravan.status === 'live' && caravan.currentLocation && (
          <div className="mt-3 pt-3 border-t border-red-900/20">
            <div className="flex items-center gap-2 bg-red-50 p-2 rounded border border-red-200">
              <span className="text-red-600 text-lg">📍</span>
              <div>
                <p className="text-xs text-red-600 uppercase font-bold tracking-wide">
                  Current Position
                </p>
                <p className="text-sm font-serif text-red-900">
                  {caravan.currentLocation.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {caravan.description && (
          <p className="mt-3 text-sm text-gray-600 italic font-serif border-l-2 border-amber-700 pl-3">
            {caravan.description}
          </p>
        )}

        {/* Completed expedition details */}
        {caravan.status === 'completed' && (
          <div className="mt-3 pt-3 border-t border-amber-900/20">
            <div className="flex flex-wrap gap-3 text-xs text-gray-600">
              {caravan.images && caravan.images.length > 0 && (
                <div className="flex items-center gap-1">
                  <span>🖼</span>
                  <span className="font-serif">{caravan.images.length} Images</span>
                </div>
              )}
              {caravan.posts && caravan.posts.length > 0 && (
                <div className="flex items-center gap-1">
                  <span>📜</span>
                  <span className="font-serif">{caravan.posts.length} Chronicles</span>
                </div>
              )}
              {caravan.sponsors && caravan.sponsors.length > 0 && (
                <div className="flex items-center gap-1">
                  <span>⚜</span>
                  <span className="font-serif">{caravan.sponsors.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </button>
  );

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-6">
        {/* Guild Header */}
        <div
          className="mb-6 p-6 relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, #f5f1e8 0%, #ede5d4 50%, #f5f1e8 100%)',
            borderTop: '3px solid #8b6914',
            borderBottom: '3px solid #8b6914',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <span className="text-9xl">🏛️</span>
          </div>

          <div className="relative text-center">
            <div className="text-6xl mb-3">🏛️</div>
            <h1 className="font-serif text-3xl text-gray-900 mb-2 tracking-widest uppercase">
              Telos Guild
            </h1>
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-px w-12 bg-amber-700"></div>
              <span className="text-amber-700">⚔</span>
              <div className="h-px w-12 bg-amber-700"></div>
            </div>
            <p className="font-serif text-sm text-gray-700 italic">
              Building the Future Together
            </p>
            <p className="font-serif text-xs text-gray-600 mt-2">
              Est. MMXXV
            </p>
          </div>
        </div>

        {/* Live Expeditions */}
        {liveCaravans.length > 0 && (
          <div className="mb-6">
            <div
              className="mb-3 px-4 py-2 bg-red-900 border-y-2 border-red-700"
              style={{
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              <h2 className="font-serif text-lg text-red-50 uppercase tracking-widest flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                Active Expeditions
              </h2>
            </div>
            <div className="space-y-3">
              {liveCaravans.map((caravan) => (
                <CaravanCard key={caravan.id} caravan={caravan} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Expeditions */}
        {upcomingCaravans.length > 0 && (
          <div className="mb-6">
            <div
              className="mb-3 px-4 py-2 bg-amber-900 border-y-2 border-amber-700"
              style={{
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              <h2 className="font-serif text-lg text-amber-50 uppercase tracking-widest">
                Planned Expeditions
              </h2>
            </div>
            <div className="space-y-3">
              {upcomingCaravans.map((caravan) => (
                <CaravanCard key={caravan.id} caravan={caravan} />
              ))}
            </div>
          </div>
        )}

        {/* Historical Archives */}
        {completedCaravans.length > 0 && (
          <div className="mb-6">
            <div
              className="mb-3 px-4 py-2 bg-stone-800 border-y-2 border-stone-600"
              style={{
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              <h2 className="font-serif text-lg text-stone-50 uppercase tracking-widest">
                Historical Archives
              </h2>
            </div>
            <div className="space-y-3">
              {completedCaravans.map((caravan) => (
                <CaravanCard key={caravan.id} caravan={caravan} />
              ))}
            </div>
          </div>
        )}

        {/* Guild Charter */}
        <div
          className="mt-6 p-5 relative"
          style={{
            background:
              'linear-gradient(135deg, #f5f1e8 0%, #ede5d4 50%, #f5f1e8 100%)',
            borderTop: '3px solid #8b6914',
            borderBottom: '3px solid #8b6914',
            boxShadow: 'inset 0 1px 2px rgba(139, 105, 20, 0.1)',
          }}
        >
          <div className="text-center mb-3">
            <h3 className="font-serif text-lg text-gray-900 uppercase tracking-widest">
              ⚜ Guild Charter ⚜
            </h3>
          </div>
          <p className="font-serif text-sm text-gray-700 leading-relaxed text-center">
            A global network connecting builders, thinkers, and innovators.
            Our expeditions span continents, fostering collaboration and
            shared growth across borders.
          </p>
          <div className="mt-4 text-center text-xs text-gray-600 font-serif italic">
            "In unity, strength. In trade, prosperity."
          </div>
        </div>
      </div>
    </div>
  );
}
