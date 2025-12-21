'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'passports' | 'add-element'>('passports');

  const [passports] = useState([
    { id: 'ADMIN-001', name: 'Admin User 1', status: 'Active', joinedDate: '2024-01-15' },
    { id: 'ADMIN-002', name: 'Admin User 2', status: 'Active', joinedDate: '2024-01-20' },
    { id: 'USER-001', name: 'Member User 1', status: 'Active', joinedDate: '2024-02-01' },
    { id: 'USER-002', name: 'Member User 2', status: 'Active', joinedDate: '2024-02-15' },
  ]);

  const [newElement, setNewElement] = useState({
    type: 'caravan',
    name: '',
    description: '',
    address: '',
    location: { lat: '', lng: '', name: '' },
    logoUrl: '', // For partners/VCs
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      const adminStatus = localStorage.getItem('isAdmin');

      if (isAuthenticated !== 'true') {
        router.push('/login');
        return;
      }

      if (adminStatus !== 'true') {
        router.push('/map');
        return;
      }

      setIsAdmin(true);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`New ${newElement.type} "${newElement.name}" would be added to the database`);
    setNewElement({
      type: 'caravan',
      name: '',
      description: '',
      address: '',
      location: { lat: '', lng: '', name: '' },
      logoUrl: '',
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-[#3f6053]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-serif text-white tracking-wide">
              ADMIN DASHBOARD
            </h1>
            <button
              onClick={() => router.push('/map')}
              className="px-4 py-2 bg-[#000000]/80 border border-[#F6FAF6]/50 hover:bg-[#000000]/90 hover:border-[#F6FAF6] text-white rounded text-sm uppercase tracking-wide transition-all"
            >
              Back to Map
            </button>
          </div>
          <p className="text-white/70 text-sm uppercase tracking-wider">
            Telos League Administration
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#3f6053]/30">
          <button
            onClick={() => setActiveTab('passports')}
            className={`pb-3 px-4 text-sm uppercase tracking-wide transition-all ${
              activeTab === 'passports'
                ? 'border-b-2 border-[#F6FAF6] text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            View Passports
          </button>
          <button
            onClick={() => setActiveTab('add-element')}
            className={`pb-3 px-4 text-sm uppercase tracking-wide transition-all ${
              activeTab === 'add-element'
                ? 'border-b-2 border-[#F6FAF6] text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            Add Map Element
          </button>
        </div>

        {/* Content */}
        {activeTab === 'passports' ? (
          <div className="bg-gradient-to-br from-[#2b4539]/20 to-[#3f6053]/20 rounded-lg border border-[#3f6053]/30 p-6">
            <h2 className="text-xl font-serif text-white mb-4">Registered Passports</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#3f6053]/30">
                    <th className="text-left py-3 px-4 text-sm uppercase tracking-wide text-[#F6FAF6]/80">
                      Passport ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm uppercase tracking-wide text-[#F6FAF6]/80">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm uppercase tracking-wide text-[#F6FAF6]/80">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm uppercase tracking-wide text-[#F6FAF6]/80">
                      Joined Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {passports.map((passport) => (
                    <tr key={passport.id} className="border-b border-[#3f6053]/20 hover:bg-[#2b4539]/20 transition-colors">
                      <td className="py-3 px-4 font-mono text-[#F6FAF6]">{passport.id}</td>
                      <td className="py-3 px-4 text-[#F6FAF6]">{passport.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-[#3f6053]/40 text-[#F6FAF6] text-xs rounded">
                          {passport.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/80 text-sm">{passport.joinedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#2b4539]/20 to-[#3f6053]/20 rounded-lg border border-[#3f6053]/30 p-6 pb-24">
            <h2 className="text-xl font-serif text-white mb-4">Add New Map Element</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/90 mb-2 uppercase tracking-wide">
                  Element Type
                </label>
                <select
                  value={newElement.type}
                  onChange={(e) => setNewElement({ ...newElement, type: e.target.value })}
                  className="w-full px-4 py-3 bg-[#000000]/80 border border-[#3f6053]/40 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#F6FAF6]/50"
                >
                  <option value="caravan">Caravan Expedition</option>
                  <option value="property">Property/Location</option>
                  <option value="member">Guild Member</option>
                  <option value="partner">Partner/VC</option>
                  <option value="safehouse">Safehouse/Kontor</option>
                  <option value="supplier">Supplier Link</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/90 mb-2 uppercase tracking-wide">
                  Name
                </label>
                <input
                  type="text"
                  value={newElement.name}
                  onChange={(e) => setNewElement({ ...newElement, name: e.target.value })}
                  placeholder="Enter element name"
                  className="w-full px-4 py-3 bg-[#000000]/80 border border-[#3f6053]/40 rounded text-white placeholder-[#3f6053]/50 focus:outline-none focus:ring-2 focus:ring-[#F6FAF6]/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white/90 mb-2 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={newElement.description}
                  onChange={(e) => setNewElement({ ...newElement, description: e.target.value })}
                  placeholder="Enter description"
                  rows={4}
                  className="w-full px-4 py-3 bg-[#000000]/80 border border-[#3f6053]/40 rounded text-white placeholder-[#3f6053]/50 focus:outline-none focus:ring-2 focus:ring-[#F6FAF6]/50"
                />
              </div>

              {/* Logo URL field - only for partners and VCs */}
              {(newElement.type === 'partner' || newElement.type === 'member') && (
                <div>
                  <label className="block text-sm text-white/90 mb-2 uppercase tracking-wide">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={newElement.logoUrl || ''}
                    onChange={(e) => setNewElement({ ...newElement, logoUrl: e.target.value })}
                    placeholder="Enter logo image URL (https://...)"
                    className="w-full px-4 py-3 bg-[#000000]/80 border border-[#3f6053]/40 rounded text-white placeholder-[#3f6053]/50 focus:outline-none focus:ring-2 focus:ring-[#F6FAF6]/50"
                  />
                  <p className="mt-1 text-xs text-white/50">
                    The logo will be displayed on the map at this location
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm text-white/90 mb-2 uppercase tracking-wide">
                  Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newElement.address || ''}
                    onChange={(e) => setNewElement({ ...newElement, address: e.target.value })}
                    placeholder="Enter address (e.g., 123 Main St, New York, NY)"
                    className="flex-1 px-4 py-3 bg-[#000000]/80 border border-[#3f6053]/40 rounded text-white placeholder-[#3f6053]/50 focus:outline-none focus:ring-2 focus:ring-[#F6FAF6]/50"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newElement.address) {
                        alert('Please enter an address');
                        return;
                      }
                      try {
                        const response = await fetch(
                          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(newElement.address)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
                        );
                        const data = await response.json();
                        if (data.features && data.features.length > 0) {
                          const [lng, lat] = data.features[0].center;
                          const placeName = data.features[0].place_name;
                          setNewElement({
                            ...newElement,
                            location: {
                              lat: lat.toString(),
                              lng: lng.toString(),
                              name: placeName.split(',')[0] || placeName
                            }
                          });
                          alert('Location found and coordinates updated!');
                        } else {
                          alert('Address not found. Please try a different address.');
                        }
                      } catch (error) {
                        console.error('Geocoding error:', error);
                        alert('Error finding address. Please enter coordinates manually.');
                      }
                    }}
                    className="px-6 py-3 bg-[#3f6053]/50 hover:bg-[#3f6053] text-white rounded transition-all"
                  >
                    Find
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-white/90 mb-2 uppercase tracking-wide">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newElement.location.lat}
                    onChange={(e) => setNewElement({
                      ...newElement,
                      location: { ...newElement.location, lat: e.target.value }
                    })}
                    placeholder="52.52"
                    className="w-full px-4 py-3 bg-[#000000]/80 border border-[#3f6053]/40 rounded text-white placeholder-[#3f6053]/50 focus:outline-none focus:ring-2 focus:ring-[#F6FAF6]/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/90 mb-2 uppercase tracking-wide">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newElement.location.lng}
                    onChange={(e) => setNewElement({
                      ...newElement,
                      location: { ...newElement.location, lng: e.target.value }
                    })}
                    placeholder="13.405"
                    className="w-full px-4 py-3 bg-[#000000]/80 border border-[#3f6053]/40 rounded text-white placeholder-[#3f6053]/50 focus:outline-none focus:ring-2 focus:ring-[#F6FAF6]/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/90 mb-2 uppercase tracking-wide">
                    Location Name
                  </label>
                  <input
                    type="text"
                    value={newElement.location.name}
                    onChange={(e) => setNewElement({
                      ...newElement,
                      location: { ...newElement.location, name: e.target.value }
                    })}
                    placeholder="Berlin"
                    className="w-full px-4 py-3 bg-[#000000]/80 border border-[#3f6053]/40 rounded text-white placeholder-[#3f6053]/50 focus:outline-none focus:ring-2 focus:ring-[#F6FAF6]/50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#F6FAF6] to-[#ffffff] hover:from-[#F6FAF6]/90 hover:to-[#ffffff]/90 text-[#000000] rounded font-serif uppercase tracking-wider transition-all shadow-lg"
              >
                Add Element to Map
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
