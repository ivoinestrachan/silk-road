'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import CaravanSidebar from '@/components/CaravanSidebar';
import PassportViewer from '@/components/PassportViewer';
import {
  allCaravans,
  guildMembers,
  properties,
  currentUserPassport,
} from '@/data/mockData';
import { Caravan } from '@/types/guild';

// Import GuildMap dynamically to avoid SSR issues with Leaflet
const GuildMap = dynamic(() => import('@/components/GuildMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p className="text-gray-600">Loading map...</p>
    </div>
  ),
});

export default function Home() {
  const [selectedCaravan, setSelectedCaravan] = useState<Caravan | null>(null);
  const [activeView, setActiveView] = useState<'map' | 'passport'>('map');

  // Get current user member data
  const currentMember = guildMembers.find(
    (m) => m.id === currentUserPassport.memberId
  );

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <div className="w-full md:w-96 lg:w-[28rem] flex-shrink-0 overflow-y-auto border-r border-gray-200">
        <CaravanSidebar
          caravans={allCaravans}
          selectedCaravan={selectedCaravan}
          onSelectCaravan={setSelectedCaravan}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-amber-900 border-b-4 border-amber-700 px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-amber-100 text-lg md:text-xl font-bold">
              Telos Guild Map
            </h1>
            <div className="hidden lg:flex items-center gap-2 text-amber-200 text-sm">
              <span>🏛️</span>
              <span>Global network of builders and innovators</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveView('map')}
              className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base cursor-pointer ${
                activeView === 'map'
                  ? 'bg-amber-700 text-amber-50'
                  : 'bg-amber-950 text-amber-300 hover:bg-amber-800'
              }`}
            >
              🗺️ Map
            </button>
            <button
              onClick={() => setActiveView('passport')}
              className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base cursor-pointer ${
                activeView === 'passport'
                  ? 'bg-amber-700 text-amber-50'
                  : 'bg-amber-950 text-amber-300 hover:bg-amber-800'
              }`}
            >
              📜 Passport
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          {activeView === 'map' ? (
            <GuildMap
              caravans={allCaravans}
              members={guildMembers}
              properties={properties}
              selectedCaravan={selectedCaravan}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8 overflow-auto">
              <PassportViewer
                passport={currentUserPassport}
                memberName={currentMember?.name || 'Unknown Member'}
              />
            </div>
          )}
        </div>

        {/* Legend */}
        {activeView === 'map' && (
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              Map Legend
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px]">
                  🚐
                </div>
                <span className="text-gray-700">Live Caravan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-amber-500 rounded"></div>
                <span className="text-gray-700">Upcoming Route</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-400 rounded"></div>
                <span className="text-gray-700">Completed Route</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[10px]">
                  🏛️
                </div>
                <span className="text-gray-700">Properties</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px]">
                  👤
                </div>
                <span className="text-gray-700">Guild Members</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
