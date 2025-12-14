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
      className={`w-full text-left relative overflow-hidden transition-all cursor-pointer rounded border ${
        selectedCaravan?.id === caravan.id
          ? 'ring-2 ring-teal-500 shadow-lg border-teal-600/50 bg-teal-950/40'
          : 'hover:shadow-md border-teal-800/30 bg-[#0d2626]/60 hover:bg-[#0d2626]/80'
      }`}
    >
      {/* Dark themed card */}
      <div
        className="relative p-5"
      >
        {/* Status Banner */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {caravan.status === 'live' && (
              <>
                <span className="text-lg">⚡</span>
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </>
            )}
            {caravan.status === 'upcoming' && <span className="text-lg">📅</span>}
            {caravan.status === 'completed' && <span className="text-lg">✓</span>}
          </div>
          <div
            className={`px-3 py-1 text-xs uppercase tracking-widest border ${
              caravan.status === 'live'
                ? 'bg-red-900/40 text-red-300 border-red-700/50'
                : caravan.status === 'upcoming'
                  ? 'bg-teal-900/40 text-teal-300 border-teal-700/50'
                  : 'bg-gray-800/40 text-gray-400 border-gray-700/50'
            }`}
          >
            {caravan.status === 'live' ? 'Live' : caravan.status === 'upcoming' ? 'Soon' : 'Complete'}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl text-teal-100 mb-3 tracking-wide">
          {caravan.name}
        </h3>

        {/* Route with decorative arrow */}
        <div className="mb-3 pb-3 border-b border-teal-800/30">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-teal-300">
              {caravan.route.start.name}
            </span>
            <div className="flex-1 flex items-center">
              <div className="h-px bg-teal-700/40 flex-1"></div>
              <span className="text-teal-500 mx-1">→</span>
              <div className="h-px bg-teal-700/40 flex-1"></div>
            </div>
            <span className="font-medium text-teal-300">
              {caravan.route.end.name}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-teal-200/90">
          <div className="flex items-center gap-2">
            <span>⚑</span>
            <span className="font-serif">
              {caravan.stops.length} Waypoints
            </span>
          </div>

          {caravan.participants > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <span>⚒</span>
                <span className="font-serif">{caravan.participants} Guild Members</span>
              </div>
              {(caravan.boats && caravan.boats > 0) || (caravan.horses && caravan.horses > 0) ? (
                <div className="flex items-center gap-3">
                  {caravan.boats && caravan.boats > 0 && (
                    <div className="flex items-center gap-1">
                      <span>⚓</span>
                      <span className="font-serif">{caravan.boats} Boats</span>
                    </div>
                  )}
                  {caravan.horses && caravan.horses > 0 && (
                    <div className="flex items-center gap-1">
                      <span>🐴</span>
                      <span className="font-serif">{caravan.horses} Horses</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span>⌛</span>
            <span className="font-serif text-xs text-teal-300/80">
              {formatDate(caravan.startDate)}
              {caravan.endDate && ` - ${formatDate(caravan.endDate)}`}
            </span>
          </div>
        </div>

        {/* Live location */}
        {caravan.status === 'live' && caravan.currentLocation && (
          <div className="mt-3 pt-3 border-t border-red-800/30">
            <div className="flex items-center gap-2 bg-red-950/40 p-2 rounded border border-red-800/50">
              <span className="text-lg">📍</span>
              <div>
                <p className="text-xs text-red-400 uppercase font-bold tracking-wide">
                  Current Position
                </p>
                <p className="text-sm font-serif text-red-200">
                  {caravan.currentLocation.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {caravan.description && (
          <p className="mt-3 text-sm text-teal-300/80 italic font-serif border-l-2 border-teal-600/50 pl-3">
            {caravan.description}
          </p>
        )}

        {/* Completed expedition details */}
        {caravan.status === 'completed' && (
          <div className="mt-3 pt-3 border-t border-teal-800/30">
            <div className="flex flex-wrap gap-3 text-xs text-teal-300/80">
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
    <div className="p-6 space-y-3">
      {/* All Caravans - sorted by status (live, upcoming, completed) */}
      {caravans
        .sort((a, b) => {
          const statusOrder = { live: 0, upcoming: 1, completed: 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        })
        .map((caravan) => (
          <CaravanCard key={caravan.id} caravan={caravan} />
        ))}
    </div>
  );
}
