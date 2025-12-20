'use client';

import { useEffect, useRef, memo } from 'react';
import mapboxgl from 'mapbox-gl';
import { Caravan, GuildMember, Property } from '@/types/guild';

// Set your Mapbox access token here
// Get a free token at https://account.mapbox.com/
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface GuildMapProps {
  caravans: Caravan[];
  members: GuildMember[];
  properties: Property[];
  selectedCaravan?: Caravan | null;
  selectedElement?: { type: 'caravan' | 'member' | 'property'; data: Caravan | GuildMember | Property } | null;
  onElementClick?: (element: { type: 'caravan' | 'member' | 'property'; data: Caravan | GuildMember | Property }) => void;
  isAuthenticated?: boolean;
}

function GuildMap({
  caravans,
  members,
  properties,
  selectedCaravan,
  selectedElement,
  onElementClick,
}: GuildMapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Check if access token is set
    if (!mapboxgl.accessToken) {
      console.error('Mapbox access token is not set. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env.local file');
      return;
    }

    console.log('Initializing Mapbox map...');

    // Initialize Mapbox map with OpenStreetMap as base
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
          },
        ],
      },
      center: [13.405, 52.52],
      zoom: 4.5,
      pitch: 0,
      bearing: 0,
      antialias: true,
      projection: 'mercator',
    });

    mapRef.current = map;

    // Increase scroll zoom sensitivity dramatically
    const scrollZoom = map.scrollZoom;
    if (scrollZoom) {
      (scrollZoom as any)._wheelZoomRate = 1 / 50; // Very high sensitivity (default is 1/450)
      (scrollZoom as any)._easing = (t: number) => t; // Linear easing for immediate response
    }

    map.on('error', (e) => {
      console.error('Mapbox error:', e);
    });

    map.on('load', () => {
      // 1. Add DEM source for terrain and hillshade
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });

      // 2. Enable 3D terrain (critical for texture)
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // 3. Add vector source for water/land overlays
      map.addSource('mapbox-terrain-vector', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-streets-v8',
      });

      // 4. Add water tint overlay (pure black with green tint)
      map.addLayer({
        id: 'water-tint',
        type: 'fill',
        source: 'mapbox-terrain-vector',
        'source-layer': 'water',
        paint: {
          'fill-color': '#0a1410', // Very dark black-green
          'fill-opacity': 0.95, // Almost fully opaque for pure black appearance
        },
      });


      // 6. Add strong hillshade for dramatic relief texture
      map.addLayer({
        id: 'hillshade',
        type: 'hillshade',
        source: 'mapbox-dem',
        paint: {
          'hillshade-exaggeration': 3.0, // Very strong exaggeration for pronounced texture
          'hillshade-shadow-color': '#000000', // Pure black shadows
          'hillshade-highlight-color': '#ffffff', // Pure white highlights
          'hillshade-illumination-direction': 315,
          'hillshade-illumination-anchor': 'viewport',
        },
      });

      // Add grain texture overlay using image source
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.createImageData(256, 256);
        for (let i = 0; i < imageData.data.length; i += 4) {
          const noise = Math.random() * 30;
          imageData.data[i] = noise;
          imageData.data[i + 1] = noise;
          imageData.data[i + 2] = noise;
          imageData.data[i + 3] = 25;
        }
        ctx.putImageData(imageData, 0, 0);

        (map as any).addSource('grain-overlay', {
          type: 'canvas',
          canvas: canvas,
          coordinates: [
            [-180, 85],
            [180, 85],
            [180, -85],
            [-180, -85]
          ],
          animate: false
        });

        map.addLayer({
          id: 'grain-layer',
          type: 'raster',
          source: 'grain-overlay',
          paint: {
            'raster-opacity': 0.15
          }
        });
      }

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add SF area polygon layer for upcoming events with approximate city boundary
      if (!map.getSource('sf-area')) {
        map.addSource('sf-area', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[
                // Approximate SF city boundary
                [-122.5147, 37.8119], // Northwest - Ocean Beach North
                [-122.5023, 37.8079], // Richmond District
                [-122.4859, 37.8088], // Presidio
                [-122.4697, 37.8085], // Marina
                [-122.4518, 37.8105], // Fisherman's Wharf
                [-122.4195, 37.8082], // North Beach
                [-122.3865, 37.8092], // Northeast waterfront
                [-122.3867, 37.7936], // Embarcadero North
                [-122.3891, 37.7847], // Embarcadero
                [-122.3908, 37.7702], // Mission Bay
                [-122.3869, 37.7544], // Bayview
                [-122.3917, 37.7346], // Hunters Point
                [-122.3787, 37.7080], // Candlestick Point
                [-122.3965, 37.7068], // SE corner
                [-122.4533, 37.7086], // South - near Daly City
                [-122.4866, 37.7137], // Lake Merced
                [-122.5023, 37.7347], // Ocean Beach South
                [-122.5067, 37.7545], // Sunset District
                [-122.5097, 37.7721], // Golden Gate Park
                [-122.5118, 37.7896], // Richmond
                [-122.5147, 37.8119], // Close polygon
              ]]
            },
            properties: {
              name: 'San Francisco',
              eventId: 'sf-startup-cohort-2026'
            }
          }
        });

        map.addLayer({
          id: 'sf-area-fill',
          type: 'fill',
          source: 'sf-area',
          paint: {
            'fill-color': '#f59e0b',
            'fill-opacity': 0.2
          }
        });

        map.addLayer({
          id: 'sf-area-outline',
          type: 'line',
          source: 'sf-area',
          paint: {
            'line-color': '#f59e0b',
            'line-width': 2,
            'line-opacity': 0.6
          }
        });

        // Add click handler to SF polygon
        map.on('click', 'sf-area-fill', () => {
          if (onElementClick) {
            const sfCaravan = caravans.find(c => c.id === 'sf-startup-cohort-2026');
            if (sfCaravan) {
              onElementClick({ type: 'caravan', data: sfCaravan });
            }
          }
        });

        map.on('mouseenter', 'sf-area-fill', () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'sf-area-fill', () => {
          map.getCanvas().style.cursor = '';
        });
      }

      // Render all map elements
      renderMapElements();
    });

    // Dynamic 3D terrain based on zoom level
    map.on('zoom', () => {
      const zoom = map.getZoom();

      // Enable 3D terrain when zoomed in (zoom > 8)
      if (zoom > 8) {
        // Gradually increase pitch and enable terrain
        const targetPitch = Math.min(60, (zoom - 8) * 15); // Max 60 degrees, faster increase
        map.easeTo({ pitch: targetPitch, duration: 300 });

        // Enable 3D terrain
        if (!map.getTerrain()) {
          map.setTerrain({
            source: 'mapbox-dem',
            exaggeration: 1.5
          });
        }
      } else {
        // Disable 3D when zoomed out
        map.easeTo({ pitch: 0, duration: 300 });
        if (map.getTerrain()) {
          map.setTerrain(null);
        }
      }
    });

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-render elements when data changes
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
    renderMapElements();
  }, [caravans, members, properties]);

  const renderMapElements = () => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Helper function to create emoji markers with proper positioning
    const createEmojiMarker = (emoji: string, size: number = 32) => {
      const el = document.createElement('div');
      el.style.fontSize = `${size}px`;
      el.style.lineHeight = '1';
      el.style.textAlign = 'center';
      el.style.cursor = 'pointer';
      el.style.userSelect = 'none';
      el.style.position = 'relative'; // Prevent position shifts
      // Add text shadow for better visibility
      el.style.filter = 'drop-shadow(0 0 2px rgba(0,0,0,0.9)) drop-shadow(0 0 4px rgba(0,0,0,0.6))';
      el.textContent = emoji;
      return el;
    };

    // Helper function to create clean white circle nodes (6-8px)
    const createIconMarker = (locationName: string = '') => {
      const el = document.createElement('div');
      el.style.width = '8px';
      el.style.height = '8px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#ffffff'; // Clean white circles
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.2s';
      el.style.position = 'relative'; // Prevent position shifts
      el.title = locationName; // Hover shows location
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.5)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });
      return el;
    };

    // Add properties
    properties.forEach((property) => {
      let markerElement: HTMLElement;

      if (property.type === 'supplier') {
        // Supplier with factory emoji
        markerElement = createEmojiMarker('🏭', 28);
      } else if (property.id === 'prop-telos') {
        // Original Telos House - larger
        const img = document.createElement('img');
        img.src = '/telos-house-logo.png';
        img.style.width = '56px';
        img.style.height = '56px';
        img.style.cursor = 'pointer';
        img.style.filter = 'drop-shadow(0 0 2px rgba(0,0,0,0.9)) drop-shadow(0 0 4px rgba(0,0,0,0.6))';
        markerElement = img;
      } else if (property.id === 'prop-telos-shenzhen') {
        // Shenzhen Telos House with green glow
        const img = document.createElement('img');
        img.src = '/telos-house-logo.png';
        img.style.width = '40px';
        img.style.height = '40px';
        img.style.cursor = 'pointer';
        img.style.filter = 'drop-shadow(0 0 3px #3f6053) drop-shadow(0 0 6px #3f6053) drop-shadow(0 0 2px rgba(0,0,0,0.9))';
        markerElement = img;
      } else {
        // Generic property
        markerElement = createEmojiMarker('🏛️', 28);
      }

      const popup = new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
        .setHTML(`
          <div style="padding: 12px; background: linear-gradient(135deg, #2b4539, #3f6053); border-radius: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #F6FAF6;">${property.type === 'supplier' ? '🏭' : '🏛️'} ${property.name}</h3>
            <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Type:</strong> ${property.type.charAt(0).toUpperCase() + property.type.slice(1)}</p>
            ${property.description ? `<p style="margin: 4px 0; font-size: 13px; color: #ffffff;">${property.description}</p>` : ''}
            ${property.capacity ? `<p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Capacity:</strong> ${property.capacity} members</p>` : ''}
            ${property.amenities && property.amenities.length > 0 ? `<p style="margin: 4px 0; font-size: 12px; color: #ffffff;">${property.amenities.join(' • ')}</p>` : ''}
            <a href="/contribute?project=${encodeURIComponent(property.name)}" target="_blank" style="display: inline-block; margin-top: 12px; padding: 8px 16px; background: linear-gradient(135deg, #F6FAF6, #C4B89D); color: #2b4539; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Contribute</a>
          </div>
        `);

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center', // Critical fix for emoji positioning!
      })
        .setLngLat([property.location.lng, property.location.lat])
        .setPopup(popup)
        .addTo(map);

      if (onElementClick) {
        markerElement.addEventListener('click', () => {
          onElementClick({ type: 'property', data: property });
        });
      }

      markersRef.current.push(marker);
    });

    // Add guild members
    members.forEach((member) => {
      const isPartnerVC = member.passportId.startsWith('VC-');
      let markerElement: HTMLElement;

      if (isPartnerVC) {
        // Partner VC - use white circle marker
        markerElement = createIconMarker(member.name);
      } else {
        markerElement = createEmojiMarker('👤', 24);
      }

      const popup = new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
        .setHTML(`
          <div style="padding: 12px; background: linear-gradient(135deg, #2b4539, #3f6053); border-radius: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #F6FAF6;">${isPartnerVC ? '💼' : '👤'} ${member.name}</h3>
            <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Passport:</strong> ${member.passportId}</p>
            ${member.bio ? `<p style="margin: 4px 0; font-size: 13px; color: #ffffff; font-style: italic;">${member.bio}</p>` : ''}
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #ffffff;">📍 ${member.location.name}</p>
          </div>
        `);

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center', // Critical fix for emoji positioning!
      })
        .setLngLat([member.location.lng, member.location.lat])
        .setPopup(popup)
        .addTo(map);

      if (onElementClick) {
        markerElement.addEventListener('click', () => {
          onElementClick({ type: 'member', data: member });
        });
      }

      markersRef.current.push(marker);
    });

    // Add caravans
    caravans.forEach((caravan) => {
      // Skip rendering route for SF cohort (it's shown as polygon layer)
      if (caravan.id === 'sf-startup-cohort-2026') {
        return;
      }

      // Skip rendering pins and routes for Florence live event (only blinking dot)
      if (caravan.id === 'florence-live-2025') {
        // Only render the blinking dot for live events
        if (caravan.currentLocation) {
          const liveMarkerEl = document.createElement('div');
          liveMarkerEl.style.position = 'relative';
          liveMarkerEl.style.width = '40px';
          liveMarkerEl.style.height = '40px';
          liveMarkerEl.style.display = 'flex';
          liveMarkerEl.style.alignItems = 'center';
          liveMarkerEl.style.justifyContent = 'center';

          const blinkingCircle = document.createElement('div');
          blinkingCircle.style.position = 'absolute';
          blinkingCircle.style.width = '24px';
          blinkingCircle.style.height = '24px';
          blinkingCircle.style.borderRadius = '50%';
          blinkingCircle.style.backgroundColor = '#ef4444';
          blinkingCircle.style.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
          blinkingCircle.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.5)';

          liveMarkerEl.appendChild(blinkingCircle);

          const liveMarker = new mapboxgl.Marker({
            element: liveMarkerEl,
            anchor: 'center',
          })
            .setLngLat([caravan.currentLocation.lng, caravan.currentLocation.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
                .setHTML(`
                  <div style="padding: 12px; background: linear-gradient(135deg, #2b4539, #3f6053); border-radius: 8px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #ef4444;">🔴 LIVE: ${caravan.name}</h3>
                    <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Location:</strong> ${caravan.currentLocation.name}</p>
                    <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Participants:</strong> ${caravan.participants}</p>
                  </div>
                `)
            )
            .addTo(map);

          liveMarker.getElement().addEventListener('click', () => {
            if (onElementClick) {
              onElementClick({ type: 'caravan', data: caravan });
            }
          });

          markersRef.current.push(liveMarker);
        }
        return; // Skip rest of rendering for this event
      }

      // Determine route color
      const routeColor =
        caravan.status === 'live'
          ? '#ff6b6b'
          : caravan.status === 'upcoming'
            ? '#ffa500'
            : '#c41e3a';

      // Create route line
      const routeCoordinates = caravan.route.waypoints.map(wp => [wp.lng, wp.lat]);

      // Add route line to map
      const routeId = `route-${caravan.id}`;

      if (!map.getSource(routeId)) {
        map.addSource(routeId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates,
            },
          },
        });

        map.addLayer({
          id: routeId,
          type: 'line',
          source: routeId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': routeColor,
            'line-width': 2,
            'line-opacity': 0.8,
            'line-dasharray': [4, 4], // Dashed line (4px line, 4px gap)
          },
        });

        // Add interactivity to route
        map.on('click', routeId, () => {
          if (onElementClick) {
            onElementClick({ type: 'caravan', data: caravan });
          }
        });

        map.on('mouseenter', routeId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', routeId, () => {
          map.getCanvas().style.cursor = '';
        });
      }

      // Helper to create pin marker
      const createPinMarker = (color: string) => {
        const el = document.createElement('div');
        el.innerHTML = `
          <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25c0-8.284-6.716-15-15-15z" fill="${color}" stroke="#000" stroke-width="1.5"/>
            <circle cx="15" cy="15" r="6" fill="#fff"/>
          </svg>
        `;
        el.style.cursor = 'pointer';
        return el;
      };

      // Add start marker with pin
      const startMarker = new mapboxgl.Marker({
        element: createPinMarker('#10b981'),
        anchor: 'bottom',
      })
        .setLngLat([caravan.route.start.lng, caravan.route.start.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<strong style="color: #F6FAF6;">Start:</strong> <span style="color: #ffffff;">${caravan.route.start.name}</span>`)
        )
        .addTo(map);

      markersRef.current.push(startMarker);

      // Add end marker with pin
      const endMarker = new mapboxgl.Marker({
        element: createPinMarker('#ef4444'),
        anchor: 'bottom',
      })
        .setLngLat([caravan.route.end.lng, caravan.route.end.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<strong style="color: #F6FAF6;">End:</strong> <span style="color: #ffffff;">${caravan.route.end.name}</span>`)
        )
        .addTo(map);

      markersRef.current.push(endMarker);

      // Add waypoint stops (white circle dots with location on hover)
      caravan.route.waypoints.forEach((waypoint, index) => {
        // Skip start and end waypoints as they have pins
        if (index === 0 || index === caravan.route.waypoints.length - 1) {
          return;
        }

        const waypointDot = new mapboxgl.Marker({
          element: createIconMarker(waypoint.name || 'Stop'),
          anchor: 'center',
        })
          .setLngLat([waypoint.lng, waypoint.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 15 })
              .setHTML(`<strong style="color: #F6FAF6;">Stop:</strong> <span style="color: #ffffff;">${waypoint.name}</span>`)
          )
          .addTo(map);

        // Add click handler for photo gallery
        const markerEl = waypointDot.getElement();
        markerEl.addEventListener('click', () => {
          if (onElementClick) {
            onElementClick({ type: 'caravan', data: caravan });
          }
        });

        markersRef.current.push(waypointDot);
      });

      // Add current location marker for live caravans
      if (caravan.status === 'live' && caravan.currentLocation) {
        // Create blinking live marker
        const liveMarkerEl = document.createElement('div');
        liveMarkerEl.style.position = 'relative';
        liveMarkerEl.style.width = '40px';
        liveMarkerEl.style.height = '40px';
        liveMarkerEl.style.display = 'flex';
        liveMarkerEl.style.alignItems = 'center';
        liveMarkerEl.style.justifyContent = 'center';

        // Blinking red circle
        const blinkingCircle = document.createElement('div');
        blinkingCircle.style.position = 'absolute';
        blinkingCircle.style.width = '24px';
        blinkingCircle.style.height = '24px';
        blinkingCircle.style.borderRadius = '50%';
        blinkingCircle.style.backgroundColor = '#ef4444';
        blinkingCircle.style.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
        blinkingCircle.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.5)';

        liveMarkerEl.appendChild(blinkingCircle);

        const liveMarker = new mapboxgl.Marker({
          element: liveMarkerEl,
          anchor: 'center',
        })
          .setLngLat([caravan.currentLocation.lng, caravan.currentLocation.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
              .setHTML(`
                <div style="padding: 12px; background: linear-gradient(135deg, #2b4539, #3f6053); border-radius: 8px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #ef4444;">🔴 LIVE: ${caravan.name}</h3>
                  <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Current Location:</strong> ${caravan.currentLocation.name}</p>
                  <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Participants:</strong> ${caravan.participants}</p>
                  <p style="margin: 4px 0; font-size: 13px; color: #ffffff;"><strong>Vehicles:</strong> ${caravan.vehicles}</p>
                </div>
              `)
          )
          .addTo(map);

        markersRef.current.push(liveMarker);
      }
    });
  };

  // Handle selected element - do nothing to prevent map shifts
  useEffect(() => {
    // No map manipulation needed - let markers stay in place
  }, [selectedElement]);

  // Handle selected caravan
  useEffect(() => {
    if (!mapRef.current || !selectedCaravan) return;

    const map = mapRef.current;
    const coordinates = selectedCaravan.route.waypoints.map(wp => [wp.lng, wp.lat] as [number, number]);

    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord as [number, number]);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    map.fitBounds(bounds, { padding: 100, duration: 1000 });
  }, [selectedCaravan]);

  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.2);
          }
        }

        .mapboxgl-popup-content {
          background: linear-gradient(135deg, #2b4539, #3f6053) !important;
          color: #ffffff !important;
          border: 2px solid #3f6053 !important;
          border-radius: 8px !important;
          font-family: ui-serif, Georgia, serif !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.1) !important;
          padding: 0 !important;
        }

        .mapboxgl-popup-tip {
          border-top-color: #2b4539 !important;
        }

        .mapboxgl-popup-close-button {
          color: #F6FAF6 !important;
          font-size: 20px !important;
          padding: 4px 8px !important;
        }

        .mapboxgl-popup-close-button:hover {
          background: rgba(246, 250, 246, 0.1) !important;
        }

        .mapboxgl-ctrl-group {
          background: rgba(0, 0, 0, 0.8) !important;
          border: 1px solid #3f6053 !important;
        }

        .mapboxgl-ctrl-group button {
          background: transparent !important;
          color: #F6FAF6 !important;
        }

        .mapboxgl-ctrl-group button:hover {
          background: rgba(63, 96, 83, 0.3) !important;
        }

        .mapboxgl-ctrl-group button + button {
          border-top: 1px solid #3f6053 !important;
        }

        /* Prevent markers from shifting when modals open */
        .mapboxgl-marker {
          will-change: transform !important;
        }

        .mapboxgl-canvas-container,
        .mapboxgl-canvas {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          filter: contrast(1.2) grayscale(0.7) brightness(1.3) !important; /* Monochrome effect with brightness boost */
        }

        /* Monochrome overlay for landmass effect */
        .mapboxgl-canvas-container::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #c8c8c8;
          opacity: 0.3;
          pointer-events: none;
          mix-blend-mode: lighten;
        }
      `}</style>
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{
          minHeight: '500px',
          position: 'relative',
          filter: 'contrast(1.2)', // Contrast boost
        }}
      />
    </>
  );
}

export default memo(GuildMap);
