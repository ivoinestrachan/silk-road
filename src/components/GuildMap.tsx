'use client';

import { useEffect, useRef, memo, useCallback } from 'react';
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
  onElementClick?: (element: { type: 'caravan' | 'member' | 'property'; data: Caravan | GuildMember | Property; clickX?: number; clickY?: number }) => void;
  isAuthenticated?: boolean;
  isModalOpen?: boolean;
  onMapLoaded?: () => void;
  onZoomControlsReady?: (controls: { zoomIn: () => void; zoomOut: () => void; resetView: () => void }) => void;
  onCameraControlsReady?: (controls: { focusOnElement: (element: { type: string; data: any }) => void; resetCamera: () => void }) => void;
}

function GuildMap({
  caravans,
  members,
  properties,
  selectedCaravan,
  selectedElement,
  onElementClick,
  isModalOpen = false,
  onMapLoaded,
  onZoomControlsReady,
  onCameraControlsReady,
}: GuildMapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const originalCameraRef = useRef<{ center: [number, number]; zoom: number; pitch: number; bearing: number }>({
    center: [13.405, 52.52],
    zoom: 4.5,
    pitch: 0,
    bearing: 0
  });

  // Create custom tooltip element
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tooltip = document.createElement('div');
    tooltip.className = 'custom-map-tooltip';
    tooltip.style.position = 'fixed';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.zIndex = '10000';
    tooltip.style.padding = '8px 12px';
    tooltip.style.background = 'linear-gradient(135deg, #2b4539, #3f6053)';
    tooltip.style.color = '#F6FAF6';
    tooltip.style.borderRadius = '6px';
    tooltip.style.fontSize = '12px';
    tooltip.style.fontWeight = '600';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 0.2s ease';
    tooltip.style.border = '1px solid #3f6053';
    tooltip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
    tooltip.style.whiteSpace = 'nowrap';
    document.body.appendChild(tooltip);
    tooltipRef.current = tooltip;

    return () => {
      if (tooltipRef.current) {
        document.body.removeChild(tooltipRef.current);
        tooltipRef.current = null;
      }
    };
  }, []);

  // Helper to show tooltip
  const showTooltip = useCallback((text: string, x: number, y: number) => {
    if (!tooltipRef.current) return;
    tooltipRef.current.innerHTML = text;
    tooltipRef.current.style.left = `${x + 15}px`;
    tooltipRef.current.style.top = `${y - 10}px`;
    tooltipRef.current.style.opacity = '1';
  }, []);

  // Helper to hide tooltip
  const hideTooltip = useCallback(() => {
    if (!tooltipRef.current) return;
    tooltipRef.current.style.opacity = '0';
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Check if access token is set
    if (!mapboxgl.accessToken) {
      console.error('Mapbox access token is not set. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env.local file');
      return;
    }

    console.log('Initializing Mapbox map...');

    // Initialize Mapbox map with dark vector style for custom layering
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark vector style for monochrome base
      center: [13.405, 52.52],
      zoom: 4.5,
      pitch: 0,
      bearing: 0,
      antialias: true,
      projection: 'mercator',
      attributionControl: false, // Remove attribution control
      dragRotate: false, // Disable right-click drag to rotate
      pitchWithRotate: false, // Disable pitch with rotation
      touchZoomRotate: false, // Disable touch zoom rotate
    });

    mapRef.current = map;

    // Increase scroll zoom sensitivity dramatically
    const scrollZoom = map.scrollZoom;
    if (scrollZoom) {
      (scrollZoom as any)._wheelZoomRate = 1 / 50; // Very high sensitivity (default is 1/450)
      (scrollZoom as any)._easing = (t: number) => t; // Linear easing for immediate response
    }

    map.on('error', (e: any) => {
      // Suppress non-critical Mapbox errors (like missing tiles)
      if (e?.error?.message && !e.error.message.includes('Failed to fetch') && !e.error.message.includes('NetworkError')) {
        console.warn('Mapbox warning:', e);
      }
    });

    map.on('load', () => {
      // Customize base vector layers for monochrome terrain look
      // Remove or dim unwanted layers
      const style = map.getStyle();

      // Dark green water
      if (map.getLayer('water')) {
        map.setPaintProperty('water', 'fill-color', '#0d1f1a');
      }

      // Style land areas with subtle gray-green tones
      if (map.getLayer('land')) {
        map.setPaintProperty('land', 'background-color', '#1a1f1d');
      }

      // Dim administrative boundaries
      style.layers.forEach((layer) => {
        if (layer.id.includes('admin') || layer.id.includes('boundary')) {
          map.setPaintProperty(layer.id, 'line-opacity', 0.2);
        }

        // Remove road labels and POIs for cleaner look
        if (layer.id.includes('label') || layer.id.includes('poi')) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });

      // Add satellite imagery source
      map.addSource('mapbox-satellite', {
        type: 'raster',
        url: 'mapbox://mapbox.satellite',
        tileSize: 256,
      });

      // Add satellite layer as base imagery
      map.addLayer({
        id: 'satellite',
        type: 'raster',
        source: 'mapbox-satellite',
        paint: {
          'raster-opacity': 0.6, // Slightly transparent for blending
          'raster-saturation': -1, // Full grayscale (-1 = completely desaturated)
          'raster-contrast': 0.3, // Increase contrast for better terrain definition
          'raster-brightness-min': 0.1, // Darken shadows
          'raster-brightness-max': 0.8, // Dim highlights for monochrome look
        },
      }, 'waterway-label'); // Add before labels

      // Add DEM source for 3D terrain
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });

      // Enable 3D terrain with stronger exaggeration for dramatic relief
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 2.0 });

      // Add hillshade layer for monochromatic terrain depth
      map.addLayer({
        id: 'hillshade',
        type: 'hillshade',
        source: 'mapbox-dem',
        paint: {
          'hillshade-exaggeration': 1.2,
          'hillshade-shadow-color': '#000000',
          'hillshade-highlight-color': '#4a5a4d',
          'hillshade-illumination-direction': 315,
          'hillshade-accent-color': '#2a3a2d',
        },
      });

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
              // Zoom to San Francisco
              map.flyTo({
                center: [-122.4194, 37.7749],
                zoom: 11,
                duration: 1500,
                essential: true
              });
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

      // Re-render after map is idle to ensure everything is visible
      map.once('idle', () => {
        renderMapElements();

        // Save the initial camera position after map is fully loaded and settled
        const initialCenter = [map.getCenter().lng, map.getCenter().lat] as [number, number];
        const initialZoom = map.getZoom();
        const initialPitch = map.getPitch();
        const initialBearing = map.getBearing();

        originalCameraRef.current = {
          center: initialCenter,
          zoom: initialZoom,
          pitch: initialPitch,
          bearing: initialBearing
        };

        console.log('Saved initial camera position:', originalCameraRef.current);
      });

      // Expose zoom controls to parent
      if (onZoomControlsReady) {
        onZoomControlsReady({
          zoomIn: () => {
            if (!mapRef.current) return;
            const currentZoom = mapRef.current.getZoom();
            mapRef.current.setZoom(currentZoom + 1);
          },
          zoomOut: () => {
            if (!mapRef.current) return;
            const currentZoom = mapRef.current.getZoom();
            mapRef.current.setZoom(currentZoom - 1);
          },
          resetView: () => {
            if (!mapRef.current || !originalCameraRef.current) return;
            console.log('Reset view called. Returning to:', originalCameraRef.current);
            // Instantly jump back to the initial load camera position
            mapRef.current.jumpTo({
              center: originalCameraRef.current.center,
              zoom: originalCameraRef.current.zoom,
              pitch: originalCameraRef.current.pitch,
              bearing: originalCameraRef.current.bearing
            });
          }
        });
      }

      // Expose camera controls to parent
      if (onCameraControlsReady) {
        onCameraControlsReady({
          focusOnElement: (element: { type: string; data: any }) => {
            // Don't overwrite the original camera position when focusing on elements

            if (element.type === 'caravan') {
              const caravan = element.data as Caravan;
              if (caravan.route && caravan.route.waypoints.length > 0) {
                const coordinates = caravan.route.waypoints.map(wp => [wp.lng, wp.lat] as [number, number]);
                const bounds = coordinates.reduce((bounds, coord) => {
                  return bounds.extend(coord);
                }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

                map.fitBounds(bounds, {
                  padding: { top: 100, bottom: 100, left: 420, right: 100 },
                  duration: 1500,
                  essential: true
                });
              }
            } else if (element.type === 'property' || element.type === 'member') {
              const location = element.data.location;
              map.flyTo({
                center: [location.lng, location.lat],
                zoom: 12,
                duration: 1500,
                essential: true
              });
            }
          },
          resetCamera: () => {
            map.flyTo({
              center: originalCameraRef.current.center,
              zoom: originalCameraRef.current.zoom,
              pitch: originalCameraRef.current.pitch,
              bearing: originalCameraRef.current.bearing,
              duration: 1500
            });
          }
        });
      }

      // Notify parent that map is loaded
      if (onMapLoaded) {
        onMapLoaded();
      }
    });

    // Add event listener for reset camera button
    const handleResetCamera = () => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [13.405, 52.52],
          zoom: 4.5,
          pitch: 0,
          bearing: 0,
          duration: 1500,
          essential: true
        });
      }
    };

    if (mapContainerRef.current) {
      mapContainerRef.current.addEventListener('resetCamera', handleResetCamera);
    }

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
      // Cleanup event listener
      if (mapContainerRef.current) {
        mapContainerRef.current.removeEventListener('resetCamera', handleResetCamera);
      }

      // Cleanup markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch actual driving route from Mapbox Directions API
  const fetchDrivingRoute = async (waypoints: Array<{ lng: number; lat: number }>) => {
    try {
      const coordinates = waypoints.map(wp => `${wp.lng},${wp.lat}`).join(';');
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?` +
        `geometries=geojson&` +
        `overview=full&` +
        `steps=true&` +
        `access_token=${mapboxgl.accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch route');
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry;
      }

      return null;
    } catch (error) {
      console.error('Error fetching driving route:', error);
      return null;
    }
  };

  const renderMapElements = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Clear existing route layers and sources with proper cleanup
    const style = map.getStyle();
    if (style && style.layers) {
      style.layers.forEach((layer) => {
        if (layer.id.startsWith('route-')) {
          try {
            if (map.getLayer(layer.id)) {
              map.removeLayer(layer.id);
            }
          } catch (e) {
            // Layer already removed, continue
          }
        }
      });
    }
    if (style && style.sources) {
      Object.keys(style.sources).forEach((sourceId) => {
        if (sourceId.startsWith('route-')) {
          try {
            if (map.getSource(sourceId)) {
              map.removeSource(sourceId);
            }
          } catch (e) {
            // Source already removed, continue
          }
        }
      });
    }

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
    const createIconMarker = (locationName: string = '', showHighlight: boolean = true) => {
      // Wrapper container with fixed size to prevent marker anchor shifts
      const container = document.createElement('div');
      container.style.width = '16px'; // Fixed container size
      container.style.height = '16px';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center';
      container.style.cursor = 'pointer';
      container.style.position = 'absolute';
      container.style.transform = 'translate(-50%, -50%)'; // Center the marker
      container.style.pointerEvents = 'auto';

      // Inner circle that scales
      const circle = document.createElement('div');
      circle.style.width = '8px';
      circle.style.height = '8px';
      circle.style.borderRadius = '50%';
      circle.style.backgroundColor = '#ffffff'; // Clean white circles
      circle.style.transition = 'all 0.2s ease';
      circle.style.transformOrigin = 'center center';
      circle.style.willChange = 'transform';
      circle.style.position = 'relative';
      circle.style.zIndex = '1';

      // Add highlight ring on hover
      if (showHighlight) {
        const highlightRing = document.createElement('div');
        highlightRing.style.position = 'absolute';
        highlightRing.style.width = '16px';
        highlightRing.style.height = '16px';
        highlightRing.style.borderRadius = '50%';
        highlightRing.style.border = '2px solid #3f6053';
        highlightRing.style.top = '50%';
        highlightRing.style.left = '50%';
        highlightRing.style.transform = 'translate(-50%, -50%) scale(0)';
        highlightRing.style.opacity = '0';
        highlightRing.style.transition = 'all 0.2s ease';
        highlightRing.style.pointerEvents = 'none';
        highlightRing.style.zIndex = '0';

        container.appendChild(highlightRing);

        container.addEventListener('mouseenter', () => {
          circle.style.transform = 'scale(1.5)';
          circle.style.backgroundColor = '#3f6053';
          highlightRing.style.transform = 'translate(-50%, -50%) scale(1.2)';
          highlightRing.style.opacity = '1';
        });
        container.addEventListener('mouseleave', () => {
          circle.style.transform = 'scale(1)';
          circle.style.backgroundColor = '#ffffff';
          highlightRing.style.transform = 'translate(-50%, -50%) scale(0)';
          highlightRing.style.opacity = '0';
        });
      }

      container.appendChild(circle);

      return container;
    };

    // Add properties
    properties.forEach((property) => {
      let markerElement: HTMLElement;

      if (property.type === 'supplier') {
        // Supplier with factory icon (SVG)
        const div = document.createElement('div');
        div.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 21h18v-2H3v2zM5 8h2v10H5V8zm5 0h2v10h-2V8zm5 0h2v10h-2V8zM3 6h18V4H3v2zm14 0h2v10h-2V6z" fill="#F6FAF6"/>
          <path d="M7 3h2v2H7V3zm5 0h2v2h-2V3zm5 0h2v2h-2V3z" fill="#3f6053"/>
        </svg>`;
        div.style.cursor = 'pointer';
        div.style.filter = 'drop-shadow(0 0 2px rgba(0,0,0,0.9))';
        markerElement = div;
      } else if (property.id === 'prop-telos') {
        // Original Telos House - larger
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.zIndex = '10';
        const img = document.createElement('img');
        img.src = '/telos-house-logo.png';
        img.style.width = '42px';
        img.style.height = '42px';
        img.style.cursor = 'pointer';
        img.style.filter = 'drop-shadow(0 0 2px rgba(0,0,0,0.9))';
        wrapper.appendChild(img);
        markerElement = wrapper;
      } else if (property.id === 'prop-telos-sf') {
        // SF Telos House
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.zIndex = '10';
        const img = document.createElement('img');
        img.src = '/telos-house-logo.png';
        img.style.width = '48px';
        img.style.height = '48px';
        img.style.cursor = 'pointer';
        img.style.filter = 'drop-shadow(0 0 2px rgba(0,0,0,0.9))';
        wrapper.appendChild(img);
        markerElement = wrapper;
      } else if (property.id === 'prop-telos-shenzhen') {
        // Shenzhen Telos House (upcoming)
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.zIndex = '10';
        const img = document.createElement('img');
        img.src = '/telos-house-logo.png';
        img.style.width = '40px';
        img.style.height = '40px';
        img.style.cursor = 'pointer';
        img.style.filter = 'drop-shadow(0 0 2px rgba(0,0,0,0.9)) grayscale(30%)';
        img.style.opacity = '0.85';
        wrapper.appendChild(img);
        markerElement = wrapper;
      } else {
        // Generic property with building icon (SVG)
        const div = document.createElement('div');
        div.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L2 9v12h7v-6h6v6h7V9L12 3zm0 2.5L19 9v9h-3v-6H8v6H5V9l7-3.5z" fill="#F6FAF6"/>
          <path d="M9 11h2v2H9v-2zm4 0h2v2h-2v-2z" fill="#3f6053"/>
        </svg>`;
        div.style.cursor = 'pointer';
        div.style.filter = 'drop-shadow(0 0 2px rgba(0,0,0,0.9))';
        markerElement = div;
      }

      const popup = new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
        .setHTML(`
          <div style="padding: 12px; background: linear-gradient(135deg, #2b4539, #3f6053); border-radius: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #F6FAF6;">${property.name}</h3>
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
        .addTo(map);

      // Add tooltip on hover
      markerElement.addEventListener('mouseenter', (e) => {
        const tooltipText = property.type === 'supplier'
          ? `${property.name}<br/><span style="font-size: 10px; opacity: 0.8;">Supplier Link</span>`
          : `${property.name}<br/><span style="font-size: 10px; opacity: 0.8;">${property.type}</span>`;
        showTooltip(tooltipText, e.clientX, e.clientY);
      });

      markerElement.addEventListener('mousemove', (e) => {
        if (tooltipRef.current && tooltipRef.current.style.opacity === '1') {
          tooltipRef.current.style.left = `${e.clientX + 15}px`;
          tooltipRef.current.style.top = `${e.clientY - 10}px`;
        }
      });

      markerElement.addEventListener('mouseleave', () => {
        hideTooltip();
      });

      if (onElementClick) {
        markerElement.addEventListener('click', (e: MouseEvent) => {
          hideTooltip();
          // Zoom to the property location
          map.flyTo({
            center: [property.location.lng, property.location.lat],
            zoom: 12,
            duration: 1500,
            essential: true
          });
          onElementClick({ type: 'property', data: property, clickX: e.clientX, clickY: e.clientY });
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
        .addTo(map);

      // Add tooltip on hover
      markerElement.addEventListener('mouseenter', (e) => {
        const tooltipText = isPartnerVC
          ? `💼 ${member.name}<br/><span style="font-size: 10px; opacity: 0.8;">Partner VC</span>`
          : `👤 ${member.name}<br/><span style="font-size: 10px; opacity: 0.8;">${member.passportId}</span>`;
        showTooltip(tooltipText, e.clientX, e.clientY);
      });

      markerElement.addEventListener('mousemove', (e) => {
        if (tooltipRef.current && tooltipRef.current.style.opacity === '1') {
          tooltipRef.current.style.left = `${e.clientX + 15}px`;
          tooltipRef.current.style.top = `${e.clientY - 10}px`;
        }
      });

      markerElement.addEventListener('mouseleave', () => {
        hideTooltip();
      });

      if (onElementClick) {
        markerElement.addEventListener('click', () => {
          hideTooltip();
          // Zoom to the member location
          map.flyTo({
            center: [member.location.lng, member.location.lat],
            zoom: 12,
            duration: 1500,
            essential: true
          });
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
            if (onElementClick && caravan.currentLocation) {
              // Zoom to the caravan's current location
              map.flyTo({
                center: [caravan.currentLocation.lng, caravan.currentLocation.lat],
                zoom: 10,
                duration: 1500,
                essential: true
              });
              onElementClick({ type: 'caravan', data: caravan });
            }
          });

          markersRef.current.push(liveMarker);
        }
        return; // Skip rest of rendering for this event
      }

      // Determine route color - all dark green now
      const routeColor = '#3f6053';

      // Determine line style based on status
      const lineDasharray = caravan.status === 'completed' ? undefined : [4, 4];

      // Add route line to map using Directions API
      const routeId = `route-${caravan.id}`;
      const routeHighlightId = `route-highlight-${caravan.id}`;

      // Fetch and render the actual driving route
      fetchDrivingRoute(caravan.route.waypoints).then((geometry) => {
        if (!geometry || !map.getSource(routeId)) {
          // Fallback to straight lines if API fails
          const fallbackCoordinates = caravan.route.waypoints.map(wp => [wp.lng, wp.lat]);
          const fallbackGeometry = {
            type: 'LineString' as const,
            coordinates: fallbackCoordinates,
          };

          if (!map.getSource(routeId)) {
            map.addSource(routeId, {
              type: 'geojson',
              lineMetrics: true,
              data: {
                type: 'Feature',
                properties: { color: routeColor },
                geometry: geometry || fallbackGeometry,
              },
            });

            // Base route layer
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
                ...(lineDasharray && { 'line-dasharray': lineDasharray }),
              },
            });

            // Highlight layer for hover
            map.addLayer({
              id: routeHighlightId,
              type: 'line',
              source: routeId,
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': routeColor,
                'line-width': 6,
                'line-opacity': 0,
                'line-blur': 2,
              },
            });

            // Add interactivity to route
            map.on('click', routeId, () => {
              if (onElementClick) {
                // Zoom to fit the entire route
                const coordinates = caravan.route.waypoints.map(wp => [wp.lng, wp.lat] as [number, number]);
                const bounds = coordinates.reduce((bounds, coord) => {
                  return bounds.extend(coord);
                }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

                map.fitBounds(bounds, {
                  padding: 100,
                  duration: 1500,
                  essential: true
                });
                onElementClick({ type: 'caravan', data: caravan });
              }
            });

            map.on('mouseenter', routeId, () => {
              map.getCanvas().style.cursor = 'pointer';
              map.setPaintProperty(routeHighlightId, 'line-opacity', 0.4);
            });

            map.on('mouseleave', routeId, () => {
              map.getCanvas().style.cursor = '';
              map.setPaintProperty(routeHighlightId, 'line-opacity', 0);
            });
          }
        }
      });

      // Helper to create pin marker
      const createPinMarker = (color: string) => {
        const el = document.createElement('div');
        el.innerHTML = `
          <svg width="20" height="28" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25c0-8.284-6.716-15-15-15z" fill="${color}" stroke="#000" stroke-width="1.5"/>
            <circle cx="15" cy="15" r="6" fill="#fff"/>
          </svg>
        `;
        el.style.cursor = 'pointer';
        return el;
      };

      // Add start marker with pin (red)
      const startMarker = new mapboxgl.Marker({
        element: createPinMarker('#ef4444'),
        anchor: 'bottom',
      })
        .setLngLat([caravan.route.start.lng, caravan.route.start.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
            .setHTML(`
              <div style="padding: 12px; background: linear-gradient(135deg, #2b4539, #3f6053); border-radius: 8px; min-width: 200px;">
                <div style="margin-bottom: 8px;">
                  <div style="font-size: 10px; color: #F6FAF6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Route Start</div>
                  <div style="font-size: 14px; color: #ffffff; font-weight: 600;">${caravan.route.start.name}</div>
                </div>
                <div style="border-top: 1px solid rgba(246, 250, 246, 0.2); padding-top: 8px;">
                  <div style="font-size: 12px; color: #F6FAF6; margin-bottom: 4px;">${caravan.name}</div>
                  <div style="font-size: 11px; color: rgba(255, 255, 255, 0.7);">${caravan.participants} participants</div>
                </div>
              </div>
            `)
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
          new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
            .setHTML(`
              <div style="padding: 12px; background: linear-gradient(135deg, #2b4539, #3f6053); border-radius: 8px; min-width: 200px;">
                <div style="margin-bottom: 8px;">
                  <div style="font-size: 10px; color: #F6FAF6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Route End</div>
                  <div style="font-size: 14px; color: #ffffff; font-weight: 600;">${caravan.route.end.name}</div>
                </div>
                <div style="border-top: 1px solid rgba(246, 250, 246, 0.2); padding-top: 8px;">
                  <div style="font-size: 12px; color: #F6FAF6; margin-bottom: 4px;">${caravan.name}</div>
                  <div style="font-size: 11px; color: rgba(255, 255, 255, 0.7);">${caravan.participants} participants</div>
                </div>
              </div>
            `)
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
          .addTo(map);

        // Show custom tooltip on hover
        const markerEl = waypointDot.getElement();
        markerEl.addEventListener('mouseenter', (e) => {
          showTooltip(`${waypoint.name}<br/><span style="font-size: 10px; opacity: 0.8;">Click for photos</span>`, e.clientX, e.clientY);
        });

        markerEl.addEventListener('mousemove', (e) => {
          if (tooltipRef.current && tooltipRef.current.style.opacity === '1') {
            tooltipRef.current.style.left = `${e.clientX + 15}px`;
            tooltipRef.current.style.top = `${e.clientY - 10}px`;
          }
        });

        markerEl.addEventListener('mouseleave', () => {
          hideTooltip();
        });

        // Add click handler for photo gallery
        markerEl.addEventListener('click', (e: MouseEvent) => {
          e.stopPropagation();
          hideTooltip();
          if (onElementClick) {
            // Zoom to the waypoint location
            map.flyTo({
              center: [waypoint.lng, waypoint.lat],
              zoom: 12,
              duration: 1500,
              essential: true
            });
            // Pass waypoint-specific data for photo gallery
            onElementClick({
              type: 'caravan',
              data: {
                ...caravan,
                selectedWaypoint: waypoint
              } as Caravan
            });
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
  }, [caravans, members, properties, onElementClick, showTooltip, hideTooltip]);

  // Re-render elements when data changes
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
    renderMapElements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caravans, members, properties]);

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

  // Disable map interactions when modal is open
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    if (isModalOpen) {
      // Disable all map interactions
      map.dragPan.disable();
      map.scrollZoom.disable();
      map.boxZoom.disable();
      map.doubleClickZoom.disable();
      map.keyboard.disable();
      map.touchZoomRotate.disable();
    } else {
      // Re-enable map interactions
      map.dragPan.enable();
      map.scrollZoom.enable();
      map.boxZoom.enable();
      map.doubleClickZoom.enable();
      map.keyboard.enable();
      map.touchZoomRotate.enable();
    }
  }, [isModalOpen]);

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

        /* Hide all map controls (zoom buttons, etc) */
        .mapboxgl-ctrl-group,
        .mapboxgl-ctrl-zoom-in,
        .mapboxgl-ctrl-zoom-out,
        .mapboxgl-ctrl-compass {
          display: none !important;
        }

        /* Hide Mapbox logo and attribution at bottom right */
        .mapboxgl-ctrl-logo,
        .mapboxgl-ctrl-attrib,
        .mapboxgl-ctrl-attrib-button {
          display: none !important;
        }

        /* Prevent markers from shifting when modals open */
        .mapboxgl-marker {
          will-change: transform !important;
          position: absolute !important;
          transform-origin: center center !important;
        }

        .mapboxgl-canvas-container,
        .mapboxgl-canvas {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }

        /* Force map container to maintain position */
        .mapboxgl-map {
          position: relative !important;
          overflow: hidden !important;
        }

        /* Prevent any layout shifts */
        .mapboxgl-canvas-container canvas {
          position: absolute !important;
        }

        /* Custom tooltip styling */
        .custom-map-tooltip {
          font-family: ui-sans-serif, system-ui, sans-serif !important;
        }
      `}</style>
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{
          minHeight: '500px',
          position: 'relative',
          transform: 'translate3d(0,0,0)',
          backfaceVisibility: 'hidden',
        }}
      />
    </>
  );
}

export default memo(GuildMap);
