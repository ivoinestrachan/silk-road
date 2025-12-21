'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const GooglePhotoPicker = dynamic(() => import('./GooglePhotoPicker'), {
  ssr: false,
});

interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  caption: string;
  date: string;
}

interface Album {
  id: string;
  location: string;
  albumId: string;
  albumUrl: string;
  coverPhoto: string;
  photoCount: number;
  photos: Photo[];
  addedBy: string;
  addedAt: string;
}

interface PhotoGalleryModalProps {
  locationName: string;
  onClose: () => void;
  isAdmin?: boolean;
}

export default function PhotoGalleryModal({ locationName, onClose, isAdmin }: PhotoGalleryModalProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/photos?location=${encodeURIComponent(locationName)}`);
      const data = await response.json();
      setAlbums(data.albums || []);
    } catch (error) {
      console.error('Failed to fetch albums:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, [locationName]);

  const handleAlbumSelected = async (albumId: string, accessToken: string) => {
    try {
      setUploading(true);
      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: locationName,
          albumId,
          addedBy: localStorage.getItem('passportId') || 'Admin',
          accessToken,
        }),
      });

      if (response.ok) {
        await fetchAlbums();
      } else {
        const error = await response.json();
        alert(`Failed to add album: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to add album:', error);
      alert('Failed to add album');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-[#2b4539] to-[#3f6053] p-6 rounded-lg border-2 border-[#3f6053] max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-serif text-2xl text-[#F6FAF6]">{locationName}</h3>
            <p className="text-sm text-[#F6FAF6]/70 mt-1">Photo Gallery</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#F6FAF6] hover:text-white text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-[#F6FAF6]/70">Loading photos...</div>
          </div>
        )}

        {/* Album Collages */}
        {!loading && !selectedAlbum && albums.length > 0 && (
          <div className="space-y-4">
            {albums.map((album) => {
              const collagePhotos = album.photos.slice(0, 4);
              return (
                <div
                  key={album.id}
                  className="border border-[#3f6053]/30 rounded-lg overflow-hidden hover:border-[#F6FAF6]/50 transition-all cursor-pointer"
                  onClick={() => setSelectedAlbum(album)}
                >
                  <div className="grid grid-cols-2 gap-1 h-48">
                    {collagePhotos.map((photo, idx) => (
                      <div
                        key={photo.id}
                        className={`relative overflow-hidden ${
                          collagePhotos.length === 1 ? 'col-span-2' :
                          collagePhotos.length === 3 && idx === 0 ? 'col-span-2' :
                          ''
                        }`}
                      >
                        <img
                          src={photo.thumbnail}
                          alt={photo.caption}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-[#2b4539]/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#F6FAF6] font-semibold text-sm">{album.photoCount} photos</p>
                        <p className="text-[#F6FAF6]/60 text-xs">
                          Added {new Date(album.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-[#F6FAF6]/80 text-xs hover:text-[#F6FAF6] transition-colors">
                        Click to see more →
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full Album View */}
        {!loading && selectedAlbum && (
          <div>
            <button
              onClick={() => setSelectedAlbum(null)}
              className="mb-4 text-[#F6FAF6]/70 hover:text-[#F6FAF6] text-sm flex items-center gap-2 transition-colors"
            >
              ← Back to albums
            </button>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {selectedAlbum.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 border-[#3f6053]/30 hover:border-[#F6FAF6]/50 transition-all"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.thumbnail}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-sm font-medium truncate">{photo.caption}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Photos State */}
        {!loading && albums.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-[#F6FAF6]/70 mb-2 text-lg">No photos added yet</div>
            <p className="text-[#F6FAF6]/50 text-sm">
              {isAdmin ? 'Click the button below to add a photo album' : 'Admins can add photo albums for this location'}
            </p>
          </div>
        )}

        {/* Admin Controls */}
        {isAdmin && (
          <div className="border-t border-[#3f6053]/30 pt-4 mt-4">
            <button
              onClick={() => setShowPhotoPicker(true)}
              disabled={uploading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#F6FAF6] to-[#ffffff] text-[#2b4539] text-center rounded font-semibold text-sm uppercase tracking-wide hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Adding Album...' : '+ Add Google Photos Album'}
            </button>
          </div>
        )}
      </div>

      {/* Google Photos Picker */}
      {showPhotoPicker && (
        <GooglePhotoPicker
          onAlbumSelected={handleAlbumSelected}
          onClose={() => setShowPhotoPicker(false)}
        />
      )}

      {/* Full Size Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/95 backdrop-blur-md"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white hover:text-[#F6FAF6] text-4xl leading-none transition-colors z-10"
          >
            &times;
          </button>
          <div className="max-w-5xl max-h-[90vh] p-4">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="text-center mt-4">
              <p className="text-white text-lg font-medium">{selectedPhoto.caption}</p>
              <p className="text-white/70 text-sm mt-1">
                {new Date(selectedPhoto.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
