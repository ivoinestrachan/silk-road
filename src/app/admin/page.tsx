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
    location: { lat: '', lng: '', name: '' },
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
      location: { lat: '', lng: '', name: '' },
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a1a1a] flex items-center justify-center">
        <div className="text-teal-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1a1a] p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-serif text-teal-100 tracking-wide">
              ADMIN DASHBOARD
            </h1>
            <button
              onClick={() => router.push('/map')}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-teal-50 rounded text-sm uppercase tracking-wide transition-all"
            >
              Back to Map
            </button>
          </div>
          <p className="text-teal-300/70 text-sm uppercase tracking-wider">
            Telos League Administration
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-teal-800/30">
          <button
            onClick={() => setActiveTab('passports')}
            className={`pb-3 px-4 text-sm uppercase tracking-wide transition-all ${
              activeTab === 'passports'
                ? 'border-b-2 border-teal-500 text-teal-100'
                : 'text-teal-400/60 hover:text-teal-300'
            }`}
          >
            View Passports
          </button>
          <button
            onClick={() => setActiveTab('add-element')}
            className={`pb-3 px-4 text-sm uppercase tracking-wide transition-all ${
              activeTab === 'add-element'
                ? 'border-b-2 border-teal-500 text-teal-100'
                : 'text-teal-400/60 hover:text-teal-300'
            }`}
          >
            Add Map Element
          </button>
        </div>

        {/* Content */}
        {activeTab === 'passports' ? (
          <div className="bg-gradient-to-br from-[#0d2626] to-[#0a1f1f] rounded-lg border border-teal-800/40 p-6">
            <h2 className="text-xl font-serif text-teal-100 mb-4">Registered Passports</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-teal-800/30">
                    <th className="text-left py-3 px-4 text-sm uppercase tracking-wide text-teal-400">
                      Passport ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm uppercase tracking-wide text-teal-400">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm uppercase tracking-wide text-teal-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm uppercase tracking-wide text-teal-400">
                      Joined Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {passports.map((passport) => (
                    <tr key={passport.id} className="border-b border-teal-800/20 hover:bg-teal-900/20 transition-colors">
                      <td className="py-3 px-4 font-mono text-teal-200">{passport.id}</td>
                      <td className="py-3 px-4 text-teal-200">{passport.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-900/40 text-green-300 text-xs rounded">
                          {passport.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-teal-200/80 text-sm">{passport.joinedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#0d2626] to-[#0a1f1f] rounded-lg border border-teal-800/40 p-6 pb-24">
            <h2 className="text-xl font-serif text-teal-100 mb-4">Add New Map Element</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-teal-300/90 mb-2 uppercase tracking-wide">
                  Element Type
                </label>
                <select
                  value={newElement.type}
                  onChange={(e) => setNewElement({ ...newElement, type: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a1a1a]/80 border border-teal-700/40 rounded text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
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
                <label className="block text-sm text-teal-300/90 mb-2 uppercase tracking-wide">
                  Name
                </label>
                <input
                  type="text"
                  value={newElement.name}
                  onChange={(e) => setNewElement({ ...newElement, name: e.target.value })}
                  placeholder="Enter element name"
                  className="w-full px-4 py-3 bg-[#0a1a1a]/80 border border-teal-700/40 rounded text-teal-100 placeholder-teal-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-teal-300/90 mb-2 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={newElement.description}
                  onChange={(e) => setNewElement({ ...newElement, description: e.target.value })}
                  placeholder="Enter description"
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0a1a1a]/80 border border-teal-700/40 rounded text-teal-100 placeholder-teal-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-teal-300/90 mb-2 uppercase tracking-wide">
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
                    className="w-full px-4 py-3 bg-[#0a1a1a]/80 border border-teal-700/40 rounded text-teal-100 placeholder-teal-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-teal-300/90 mb-2 uppercase tracking-wide">
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
                    className="w-full px-4 py-3 bg-[#0a1a1a]/80 border border-teal-700/40 rounded text-teal-100 placeholder-teal-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-teal-300/90 mb-2 uppercase tracking-wide">
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
                    className="w-full px-4 py-3 bg-[#0a1a1a]/80 border border-teal-700/40 rounded text-teal-100 placeholder-teal-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 text-teal-50 rounded font-serif uppercase tracking-wider transition-all shadow-lg"
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
