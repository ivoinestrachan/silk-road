'use client';

import { useEffect, useRef, memo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Caravan, GuildMember, Property } from '@/types/guild';

interface GuildMapProps {
  caravans: Caravan[];
  members: GuildMember[];
  properties: Property[];
  selectedCaravan?: Caravan | null;
  selectedElement?: { type: 'caravan' | 'member' | 'property'; data: Caravan | GuildMember | Property } | null;
  onElementClick?: (element: { type: 'caravan' | 'member' | 'property'; data: Caravan | GuildMember | Property }) => void;
}

function GuildMap({
  caravans,
  members,
  properties,
  selectedCaravan,
  selectedElement,
  onElementClick,
}: GuildMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on Europe with custom styles
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([52.52, 13.405], 5);
    mapRef.current = map;

    // Use CartoDB Positron for customizable light colors
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // Add CSS filter to match green water and cream/beige land
    const style = document.createElement('style');
    style.innerHTML = `
      .leaflet-tile-container {
        filter: saturate(1.1) brightness(0.5) contrast(1.3) hue-rotate(140deg) sepia(0.2);
      }
      .leaflet-popup-content-wrapper {
        background: linear-gradient(135deg, #2b4539, #3f6053);
        color: #ffffff;
        border: 2px solid #3f6053;
        font-family: ui-serif, Georgia, serif;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1);
      }
      .leaflet-popup-tip {
        background: #2b4539;
        border: 2px solid #3f6053;
      }
      .leaflet-interactive {
        outline: none !important;
      }
      .leaflet-interactive:focus {
        outline: none !important;
      }
      .telos-house-marker {
        filter: drop-shadow(0 0 2px black) drop-shadow(0 0 1px black);
      }
      .telos-house-shenzhen {
        filter: drop-shadow(0 0 3px #3f6053) drop-shadow(0 0 6px #3f6053) drop-shadow(0 0 2px black);
      }
    `;
    document.head.appendChild(style);

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

    const propertyIcon = createIcon('#3f6053', '🏛️');
    const memberIcon = createIcon('#3f6053', '👤');
    const supplierIcon = createIcon('#2b4539', '🏭');
    const liveCaravanIcon = createIcon('#ef4444', '🚐');

    // Custom icon for original Telos House (larger) using PNG logo
    const telosHouseIconOriginal = L.icon({
      iconUrl: '/telos-house-logo.png',
      iconSize: [56, 56],
      iconAnchor: [28, 28],
      popupAnchor: [0, -28],
      className: 'telos-house-marker',
    });

    // Custom icon for other Telos House locations (smaller with blue tint for Shenzhen)
    const telosHouseIcon = L.icon({
      iconUrl: '/telos-house-logo.png',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
      className: 'telos-house-marker',
    });

    const telosHouseShenzhenIcon = L.icon({
      iconUrl: '/telos-house-logo.png',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
      className: 'telos-house-marker telos-house-shenzhen',
    });

    // Add properties
    properties.forEach((property) => {
      // Use custom icon based on property type
      let icon = propertyIcon;
      if (property.id === 'prop-telos') {
        // Original Telos House in London - larger icon
        icon = telosHouseIconOriginal;
      } else if (property.id === 'prop-telos-shenzhen') {
        // Shenzhen Telos House - smaller icon with green glow
        icon = telosHouseShenzhenIcon;
      } else if (property.type === 'supplier') {
        icon = supplierIcon;
      }

      const marker = L.marker([property.location.lat, property.location.lng], {
        icon: icon,
      })
        .addTo(map)
        .bindPopup(`
          <div style="padding: 12px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #F6FAF6;">${property.type === 'supplier' ? '🏭' : '🏛️'} ${property.name}</h3>
            <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Type:</strong> ${property.type.charAt(0).toUpperCase() + property.type.slice(1)}</p>
            ${property.description ? `<p style="margin: 4px 0; font-size: 13px; color: #ffffff;">${property.description}</p>` : ''}
            ${property.capacity ? `<p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Capacity:</strong> ${property.capacity} members</p>` : ''}
            ${property.amenities && property.amenities.length > 0 ? `<p style="margin: 4px 0; font-size: 12px; color: #ffffff;">${property.amenities.join(' • ')}</p>` : ''}
            <a href="/contribute?project=${encodeURIComponent(property.name)}" target="_blank" style="display: inline-block; margin-top: 12px; padding: 8px 16px; background: linear-gradient(135deg, #F6FAF6, #C4B89D); color: #2b4539; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.2s;">Contribute</a>
          </div>
        `)
        .bindTooltip(`<strong>${property.name}</strong>${property.id === 'prop-telos' ? '<br/>(Original HQ)' : ''}`, {
          permanent: false,
          direction: 'top',
        });

      if (onElementClick) {
        marker.on('click', () => onElementClick({ type: 'property', data: property }));
      }
    });

    // Add guild members
    members.forEach((member) => {
      // Use circle marker for Partner VCs for better visibility
      const isPartnerVC = member.passportId.startsWith('VC-');

      if (isPartnerVC) {
        // Use green circle marker for VCs matching color palette
        L.circleMarker([member.location.lat, member.location.lng], {
          radius: 8,
          fillColor: '#3f6053',
          color: '#2b4539',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindPopup(`
            <div style="padding: 12px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #F6FAF6;">💼 ${member.name}</h3>
              <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Passport:</strong> ${member.passportId}</p>
              ${member.bio ? `<p style="margin: 4px 0; font-size: 13px; color: #ffffff; font-style: italic;">${member.bio}</p>` : ''}
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #ffffff;">📍 ${member.location.name}</p>
            </div>
          `)
          .bindTooltip(`<strong>${member.name}</strong><br/>${member.location.name}`, {
            permanent: false,
            direction: 'top',
          })
          .on('click', () => {
            if (onElementClick) {
              onElementClick({ type: 'member', data: member });
            }
          });
      } else {
        // Use regular icon for members
        const marker = L.marker([member.location.lat, member.location.lng], {
          icon: memberIcon,
        })
          .addTo(map)
          .bindPopup(`
            <div style="padding: 12px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #F6FAF6;">👤 ${member.name}</h3>
              <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Passport:</strong> ${member.passportId}</p>
              ${member.bio ? `<p style="margin: 4px 0; font-size: 13px; color: #ffffff; font-style: italic;">${member.bio}</p>` : ''}
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #ffffff;">📍 ${member.location.name}</p>
            </div>
          `);

        if (onElementClick) {
          marker.on('click', () => onElementClick({ type: 'member', data: member }));
        }
      }
    });

    // Add caravans
    caravans.forEach((caravan) => {
      // Draw route line with curved appearance using more waypoints
      const baseRoutePoints = caravan.route.waypoints.map((wp) => [
        wp.lat,
        wp.lng,
      ]) as [number, number][];

      // Determine route color - brighter colors for better visibility
      const routeColor =
        caravan.status === 'live'
          ? '#ff6b6b'  // Brighter red
          : caravan.status === 'upcoming'
            ? '#ffa500'  // Bright orange/amber
            : '#c41e3a';  // Brighter burgundy

      // Function to check if segment is a water crossing (Tallinn to Helsinki)
      const isWaterCrossing = (startName: string | undefined, endName: string | undefined) => {
        if (!startName || !endName) return false;
        return (startName.includes('Tallinn') && endName.includes('Helsinki'));
      };

      // Build complete route with all segments combined
      const allRoutePoints: [number, number][] = [];
      const waterSegments: { start: number; end: number }[] = []; // Track water crossing indices

      for (let i = 0; i < baseRoutePoints.length - 1; i++) {
        const start = baseRoutePoints[i];
        const end = baseRoutePoints[i + 1];
        const startIdx = allRoutePoints.length;

        if (i === 0) {
          allRoutePoints.push(start);
        }

        const startWaypoint = caravan.route.waypoints[i];
        const endWaypoint = caravan.route.waypoints[i + 1];
        const isWater = isWaterCrossing(startWaypoint.name, endWaypoint.name);

        // Add 80 intermediate points with small-scale square-shaped turns for realistic road appearance
        const numPoints = isWater ? 20 : 80; // Fewer points for water (smoother), more for land
        for (let j = 1; j <= numPoints; j++) {
          const t = j / (numPoints + 1);
          const latDiff = end[0] - start[0];
          const lngDiff = end[1] - start[1];

          // Base interpolation along the direct path
          let lat = start[0] + latDiff * t;
          let lng = start[1] + lngDiff * t;

          if (!isWater) {
            // Very subtle variations for smooth but realistic roads
            const smoothCurve1 = Math.sin(t * Math.PI * 6 + i) * 0.008; // Gentle curves
            const smoothCurve2 = Math.sin(t * Math.PI * 10 + i * 1.3) * 0.005; // Tiny variations
            const smoothCurve3 = Math.cos(t * Math.PI * 8 + i * 0.8) * 0.006; // Subtle cross variations

            // Apply minimal perpendicular offsets for gentle road curves
            const perpLat = -lngDiff * (smoothCurve1 + smoothCurve2);
            const perpLng = latDiff * (smoothCurve1 + smoothCurve3);

            lat += perpLat;
            lng += perpLng;
          }

          allRoutePoints.push([lat, lng]);
        }
        allRoutePoints.push(end);

        if (isWater) {
          waterSegments.push({ start: startIdx, end: allRoutePoints.length - 1 });
        }
      }

      // Draw main continuous route (always solid)
      const mainPolyline = L.polyline(allRoutePoints, {
        color: routeColor,
        weight: 5,
        opacity: 0.8,
        smoothFactor: 1.5,
        dashArray: undefined,
      })
        .addTo(map)
        .bindTooltip(`<strong>${caravan.name}</strong><br/>${caravan.route.start.name} → ${caravan.route.end.name}`, {
          permanent: false,
          direction: 'top',
          className: 'custom-tooltip'
        })
        .bindPopup(`
          <div style="padding: 12px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #F6FAF6;">${caravan.name}</h3>
            <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Status:</strong> ${caravan.status.toUpperCase()}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Route:</strong> ${caravan.route.start.name} → ${caravan.route.end.name}</p>
            ${caravan.description ? `<p style="margin: 4px 0; font-size: 13px; color: #ffffff; font-style: italic;">${caravan.description}</p>` : ''}
            ${caravan.participants > 0 ? `<p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Participants:</strong> ${caravan.participants}</p>` : ''}
            ${caravan.boats && caravan.boats > 0 ? `<p style="margin: 4px 0; font-size: 13px; color: #ffffff;">⛵ ${caravan.boats} Boats • 🐴 ${caravan.horses || 0} Horses</p>` : ''}
            ${caravan.stops && caravan.stops.length > 0 ? `<p style="margin: 4px 0; font-size: 13px; color: #ffffff;">⚑ ${caravan.stops.length} Waypoints</p>` : ''}
            <a href="/contribute?project=${encodeURIComponent(caravan.name)}" target="_blank" style="display: inline-block; margin-top: 12px; padding: 8px 16px; background: linear-gradient(135deg, #F6FAF6, #C4B89D); color: #2b4539; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.2s;">Contribute</a>
          </div>
        `);

      // Draw water crossing segments with dashed lines on top
      waterSegments.forEach(({ start, end }) => {
        const waterPoints = allRoutePoints.slice(start, end + 1);
        L.polyline(waterPoints, {
          color: routeColor,
          weight: 5,
          opacity: 0.8,
          smoothFactor: 2,
          dashArray: '15, 10',
        }).addTo(map);
      });

      // Make polyline hoverable with glow effect
      mainPolyline.on('mouseover', function (this: L.Polyline) {
        this.setStyle({
          weight: 7,
          opacity: 1,
          className: 'route-glow'
        });
        this.openTooltip();
      });

      mainPolyline.on('mouseout', function (this: L.Polyline) {
        this.setStyle({
          weight: 5,
          opacity: 0.8
        });
      });

      if (onElementClick) {
        mainPolyline.on('click', () => onElementClick({ type: 'caravan', data: caravan }));
      }

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
        .bindPopup(`<strong style="color: #F6FAF6;">Start:</strong> <span style="color: #ffffff;">${caravan.route.start.name}</span>`);

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
        .bindPopup(`<strong style="color: #F6FAF6;">End:</strong> <span style="color: #ffffff;">${caravan.route.end.name}</span>`);

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
            <div style="padding: 12px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #ef4444;">🔴 LIVE: ${caravan.name}</h3>
              <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Current Location:</strong> ${caravan.currentLocation.name}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Participants:</strong> ${caravan.participants}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Vehicles:</strong> ${caravan.vehicles}</p>
            </div>
          `);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      document.head.removeChild(style);
    };
  }, [caravans, members, properties, onElementClick]);

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

  // Handle selected element (zoom to element)
  useEffect(() => {
    if (!mapRef.current || !selectedElement) return;

    if (selectedElement.type === 'caravan') {
      const caravan = selectedElement.data as Caravan;
      const routePoints = caravan.route.waypoints.map((wp) => [
        wp.lat,
        wp.lng,
      ]) as [number, number][];
      const bounds = L.latLngBounds(routePoints);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    } else if (selectedElement.type === 'property') {
      const property = selectedElement.data as Property;
      mapRef.current.setView([property.location.lat, property.location.lng], 12, {
        animate: true,
        duration: 0.5,
      });
    } else if (selectedElement.type === 'member') {
      const member = selectedElement.data as GuildMember;
      mapRef.current.setView([member.location.lat, member.location.lng], 10, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [selectedElement]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ minHeight: '500px' }}
    />
  );
}

export default memo(GuildMap);
