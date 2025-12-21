'use client';

// Temporary debug component - delete after verification
export function DebugToken() {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (typeof window !== 'undefined') {
    console.log('Mapbox Token (first 20 chars):', token?.substring(0, 20));
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length);
  }

  return null;
}
