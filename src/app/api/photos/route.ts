import { NextRequest, NextResponse } from 'next/server';

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

interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  caption: string;
  date: string;
}

const albumsStore: Album[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');

  if (!location) {
    return NextResponse.json({ error: 'Location parameter is required' }, { status: 400 });
  }

  const locationAlbums = albumsStore.filter(
    album => album.location.toLowerCase() === location.toLowerCase()
  );

  if (locationAlbums.length === 0) {
    return NextResponse.json({ albums: [] });
  }

  return NextResponse.json({ albums: locationAlbums });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, albumId, addedBy, accessToken } = body;

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated with Google' }, { status: 401 });
    }

    if (!location || !albumId) {
      return NextResponse.json({ error: 'Location and albumId are required' }, { status: 400 });
    }

    const albumResponse = await fetch(
      `https://photoslibrary.googleapis.com/v1/albums/${albumId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!albumResponse.ok) {
      throw new Error('Failed to fetch album details');
    }

    const albumData = await albumResponse.json();

    const photosResponse = await fetch(
      'https://photoslibrary.googleapis.com/v1/mediaItems:search',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          albumId: albumId,
          pageSize: 100,
        }),
      }
    );

    if (!photosResponse.ok) {
      throw new Error('Failed to fetch album photos');
    }

    const photosData = await photosResponse.json();
    const mediaItems = photosData.mediaItems || [];

    const photos: Photo[] = mediaItems.map((item: any) => ({
      id: item.id,
      url: item.baseUrl + '=w2048-h2048',
      thumbnail: item.baseUrl + '=w300-h300-c',
      caption: item.description || item.filename || '',
      date: item.mediaMetadata?.creationTime || new Date().toISOString(),
    }));

    const album: Album = {
      id: `album-${Date.now()}`,
      location,
      albumId,
      albumUrl: albumData.productUrl || '',
      coverPhoto: photos[0]?.thumbnail || '',
      photoCount: photos.length,
      photos,
      addedBy,
      addedAt: new Date().toISOString(),
    };

    albumsStore.push(album);

    return NextResponse.json({ success: true, album });
  } catch (error) {
    console.error('Error adding album:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add album' },
      { status: 500 }
    );
  }
}
