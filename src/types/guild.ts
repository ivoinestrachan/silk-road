export interface Location {
  lat: number;
  lng: number;
  name?: string;
}

export interface Route {
  start: Location;
  end: Location;
  waypoints: Location[];
}

export interface CaravanStop {
  location: Location;
  arrivalDate: string;
  departureDate: string;
  description?: string;
}

export interface Caravan {
  id: string;
  name: string;
  status: 'live' | 'upcoming' | 'completed';
  route: Route;
  stops: CaravanStop[];
  currentLocation?: Location;
  participants: number;
  vehicles: number;
  boats?: number;
  horses?: number;
  startDate: string;
  endDate?: string;
  images?: string[];
  posts?: string[];
  sponsors?: string[];
  description?: string;
}

export interface GuildMember {
  id: string;
  name: string;
  passportId: string;
  location: Location;
  bio?: string;
  avatar?: string;
  joinedDate: string;
}

export interface Property {
  id: string;
  name: string;
  type: 'house' | 'kontor' | 'office' | 'other';
  location: Location;
  description?: string;
  capacity?: number;
  amenities?: string[];
}

export interface Passport {
  id: string;
  memberId: string;
  issueDate: string;
  expiryDate?: string;
  guild: string;
  rank?: string;
}
