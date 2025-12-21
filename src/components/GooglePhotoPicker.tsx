'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

interface GooglePhotoPickerProps {
  onAlbumSelected: (albumId: string, accessToken: string) => void;
  onClose: () => void;
}

export default function GooglePhotoPicker({ onAlbumSelected, onClose }: GooglePhotoPickerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [albums, setAlbums] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');

  useEffect(() => {
    const loadGoogleIdentityServices = () => {
      // Check if Google Identity Services script already exists
      if (window.google?.accounts) {
        initializeGoogleIdentity();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogleIdentity();
      };
      script.onerror = () => {
        setError('Failed to load Google Identity Services');
        setIsLoading(false);
      };
      document.body.appendChild(script);
    };

    const initializeGoogleIdentity = () => {
      if (!window.google?.accounts) {
        setError('Google Identity Services not available');
        setIsLoading(false);
        return;
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (!clientId) {
        setError('Google Client ID not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env.local file');
        setIsLoading(false);
        return;
      }

      try {
        // Initialize the Token Client for OAuth 2.0
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              console.error('Token error:', tokenResponse);
              setError('Failed to authenticate with Google Photos');
              setIsLoading(false);
              return;
            }

            // Store the access token
            setAccessToken(tokenResponse.access_token);

            // Load albums with the token
            await loadAlbums(tokenResponse.access_token);
          },
        });

        // Request the access token
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err: any) {
        console.error('Google Identity Services initialization error:', err);
        setError(err.message || 'Failed to initialize Google authentication');
        setIsLoading(false);
      }
    };

    const loadAlbums = async (token: string) => {
      try {
        if (!token) {
          throw new Error('No access token available');
        }

        const response = await fetch('https://photoslibrary.googleapis.com/v1/albums', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to fetch albums');
        }

        const data = await response.json();
        setAlbums(data.albums || []);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Failed to load albums:', err);
        setError(err.message || 'Failed to load albums');
        setIsLoading(false);
      }
    };

    loadGoogleIdentityServices();
  }, []);

  return (
    <div
      className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-[#2b4539] to-[#3f6053] p-6 rounded-lg border-2 border-[#3f6053] max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-serif text-2xl text-[#F6FAF6]">Select Google Photos Album</h3>
            <p className="text-sm text-[#F6FAF6]/70 mt-1">Choose an album to add to this location</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#F6FAF6] hover:text-white text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-[#F6FAF6]/70">Loading albums...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
            <p className="text-red-200 whitespace-pre-line">{error}</p>
          </div>
        )}

        {!isLoading && !error && albums.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {albums.map((album) => (
              <div
                key={album.id}
                className="cursor-pointer border-2 border-[#3f6053]/30 hover:border-[#F6FAF6]/50 rounded-lg overflow-hidden transition-all"
                onClick={() => {
                  onAlbumSelected(album.id, accessToken);
                  onClose();
                }}
              >
                {album.coverPhotoBaseUrl && (
                  <img
                    src={album.coverPhotoBaseUrl + '=w300-h300-c'}
                    alt={album.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-3 bg-[#2b4539]/50">
                  <p className="text-[#F6FAF6] font-semibold text-sm truncate">{album.title}</p>
                  <p className="text-[#F6FAF6]/60 text-xs">{album.mediaItemsCount || 0} photos</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && albums.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-[#F6FAF6]/70 mb-2">No albums found</div>
            <p className="text-[#F6FAF6]/50 text-sm">Create albums in Google Photos first</p>
          </div>
        )}
      </div>
    </div>
  );
}
