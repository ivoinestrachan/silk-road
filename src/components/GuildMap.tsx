'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Caravan, GuildMember, Property } from '@/types/guild';

interface GuildMapProps {
  caravans: Caravan[];
  members: GuildMember[];
  properties: Property[];
  selectedCaravan?: Caravan | null;
}

export default function GuildMap({
  caravans,
  members,
  properties,
  selectedCaravan,
}: GuildMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on Europe
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([52.52, 13.405], 5);
    mapRef.current = map;

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom icons
    const createIcon = (color: string, symbol: string) => {
      return L.divIcon({
        html: `<div style="
          background: ${color};
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          font-size: 18px;
        ">${symbol}</div>`,
        className: 'map-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
    };

    const propertyIcon = createIcon('#f59e0b', '🏛️');
    const memberIcon = createIcon('#3b82f6', '👤');
    const liveCaravanIcon = createIcon('#ef4444', '🚐');

    // Add properties
    properties.forEach((property) => {
      L.marker([property.location.lat, property.location.lng], {
        icon: propertyIcon,
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 12px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111;">🏛️ ${property.name}</h3>
            <p style="margin: 4px 0; font-size: 13px; color: #666;"><strong>Type:</strong> ${property.type.charAt(0).toUpperCase() + property.type.slice(1)}</p>
            ${property.description ? `<p style="margin: 4px 0; font-size: 13px; color: #666;">${property.description}</p>` : ''}
            ${property.capacity ? `<p style="margin: 4px 0; font-size: 13px; color: #666;"><strong>Capacity:</strong> ${property.capacity} members</p>` : ''}
            ${property.amenities && property.amenities.length > 0 ? `<p style="margin: 4px 0; font-size: 12px; color: #888;">${property.amenities.join(' • ')}</p>` : ''}
          </div>
        `);
    });

    // Add guild members
    members.forEach((member) => {
      L.marker([member.location.lat, member.location.lng], {
        icon: memberIcon,
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 12px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111;">👤 ${member.name}</h3>
            <p style="margin: 4px 0; font-size: 13px; color: #666;"><strong>Passport:</strong> ${member.passportId}</p>
            ${member.bio ? `<p style="margin: 4px 0; font-size: 13px; color: #666; font-style: italic;">${member.bio}</p>` : ''}
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #888;">📍 ${member.location.name}</p>
          </div>
        `);
    });

    // Add caravans
    caravans.forEach((caravan) => {
      // Draw route line
      const routePoints = caravan.route.waypoints.map((wp) => [
        wp.lat,
        wp.lng,
      ]) as [number, number][];

      const routeColor =
        caravan.status === 'live'
          ? '#ef4444'
          : caravan.status === 'upcoming'
            ? '#f59e0b'
            : '#6b7280';

      L.polyline(routePoints, {
        color: routeColor,
        weight: 3,
        opacity: 0.7,
        dashArray: caravan.status === 'upcoming' ? '10, 10' : undefined,
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 12px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111;">${caravan.name}</h3>
            <p style="margin: 4px 0; font-size: 13px; color: #666;"><strong>Status:</strong> ${caravan.status.toUpperCase()}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #666;"><strong>Route:</strong> ${caravan.route.start.name} → ${caravan.route.end.name}</p>
            ${caravan.participants > 0 ? `<p style="margin: 4px 0; font-size: 13px; color: #666;"><strong>Participants:</strong> ${caravan.participants}</p>` : ''}
            ${caravan.boats && caravan.boats > 0 ? `<p style="margin: 4px 0; font-size: 13px; color: #666;">⛵ ${caravan.boats} Boats • 🐴 ${caravan.horses || 0} Horses</p>` : ''}
          </div>
        `);

      // Add start marker
      L.circleMarker([caravan.route.start.lat, caravan.route.start.lng], {
        radius: 6,
        fillColor: '#10b981',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .addTo(map)
        .bindPopup(`<strong>Start:</strong> ${caravan.route.start.name}`);

      // Add end marker
      L.circleMarker([caravan.route.end.lat, caravan.route.end.lng], {
        radius: 6,
        fillColor: '#ef4444',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .addTo(map)
        .bindPopup(`<strong>End:</strong> ${caravan.route.end.name}`);

      // Add current location for live caravans
      if (caravan.status === 'live' && caravan.currentLocation) {
        L.marker(
          [caravan.currentLocation.lat, caravan.currentLocation.lng],
          {
            icon: liveCaravanIcon,
          }
        )
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 12px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #dc2626;">🔴 LIVE: ${caravan.name}</h3>
              <p style="margin: 4px 0; font-size: 13px; color: #666;"><strong>Current Location:</strong> ${caravan.currentLocation.name}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #666;"><strong>Participants:</strong> ${caravan.participants}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #666;"><strong>Vehicles:</strong> ${caravan.vehicles}</p>
            </div>
          `);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [caravans, members, properties]);

  // Handle selected caravan (zoom to route)
  useEffect(() => {
    if (!mapRef.current || !selectedCaravan) return;

    const routePoints = selectedCaravan.route.waypoints.map((wp) => [
      wp.lat,
      wp.lng,
    ]) as [number, number][];

    const bounds = L.latLngBounds(routePoints);
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  }, [selectedCaravan]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ minHeight: '500px' }}
    />
  );
}
