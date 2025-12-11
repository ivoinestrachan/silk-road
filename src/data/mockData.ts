import { Caravan, GuildMember, Property, Passport } from '@/types/guild';

// Previous caravan - Slush 2025
export const slushCaravan: Caravan = {
  id: 'slush-2025',
  name: 'Slush Caravan 2025',
  status: 'completed',
  route: {
    start: { lat: 51.5074, lng: -0.1278, name: 'London' },
    end: { lat: 60.1699, lng: 24.9384, name: 'Helsinki' },
    waypoints: [
      { lat: 51.5074, lng: -0.1278, name: 'London' },
      { lat: 51.2194, lng: 4.4025, name: 'Antwerp' },
      { lat: 52.3676, lng: 4.9041, name: 'Amsterdam' },
      { lat: 53.5511, lng: 9.9937, name: 'Hamburg' },
      { lat: 53.0793, lng: 8.8017, name: 'Bremen' },
      { lat: 54.3233, lng: 10.1228, name: 'Kiel' },
      { lat: 55.6761, lng: 12.5683, name: 'Copenhagen' },
      { lat: 59.3293, lng: 18.0686, name: 'Stockholm' },
      { lat: 60.1699, lng: 24.9384, name: 'Helsinki' },
    ],
  },
  stops: [
    {
      location: { lat: 51.5074, lng: -0.1278, name: 'London' },
      arrivalDate: '2025-11-15',
      departureDate: '2025-11-16',
      description: 'Starting point - Kings Cross gathering',
    },
    {
      location: { lat: 51.2194, lng: 4.4025, name: 'Antwerp' },
      arrivalDate: '2025-11-16',
      departureDate: '2025-11-17',
      description: 'Historic Hanseatic trading city',
    },
    {
      location: { lat: 52.3676, lng: 4.9041, name: 'Amsterdam' },
      arrivalDate: '2025-11-17',
      departureDate: '2025-11-18',
      description: 'Canal city founded by Hanseatic merchants',
    },
    {
      location: { lat: 53.5511, lng: 9.9937, name: 'Hamburg' },
      arrivalDate: '2025-11-18',
      departureDate: '2025-11-19',
      description: 'Major Hanseatic League city',
    },
    {
      location: { lat: 59.3293, lng: 18.0686, name: 'Stockholm' },
      arrivalDate: '2025-11-19',
      departureDate: '2025-11-20',
      description: 'Swedish Hanseatic hub',
    },
    {
      location: { lat: 60.1699, lng: 24.9384, name: 'Helsinki' },
      arrivalDate: '2025-11-20',
      departureDate: '2025-11-23',
      description: 'Slush Conference destination',
    },
  ],
  participants: 24,
  vehicles: 7,
  boats: 5,
  horses: 12,
  startDate: '2025-11-15',
  endDate: '2025-11-23',
  images: ['/caravans/slush-1.jpg', '/caravans/slush-2.jpg'],
  posts: [
    'https://twitter.com/example/slush-day1',
    'https://twitter.com/example/slush-arrival',
  ],
  sponsors: ['Telos', 'Example Corp'],
  description:
    'Epic journey following the ancient Hanseatic routes to the Slush conference in Helsinki',
};

// Upcoming caravan - Davos 2026
export const davosCaravan: Caravan = {
  id: 'davos-2026',
  name: 'Davos Caravan 2026',
  status: 'upcoming',
  route: {
    start: { lat: 51.5074, lng: -0.1278, name: 'London' },
    end: { lat: 46.8092, lng: 9.8358, name: 'Davos' },
    waypoints: [
      { lat: 51.5074, lng: -0.1278, name: 'London' },
      { lat: 50.8503, lng: 4.3517, name: 'Brussels' },
      { lat: 48.8566, lng: 2.3522, name: 'Paris' },
      { lat: 47.3769, lng: 8.5417, name: 'Zurich' },
      { lat: 46.8092, lng: 9.8358, name: 'Davos' },
    ],
  },
  stops: [
    {
      location: { lat: 51.5074, lng: -0.1278, name: 'London' },
      arrivalDate: '2026-01-16',
      departureDate: '2026-01-17',
      description: 'Starting point - Kings Cross gathering',
    },
    {
      location: { lat: 50.8503, lng: 4.3517, name: 'Brussels' },
      arrivalDate: '2026-01-17',
      departureDate: '2026-01-18',
      description: 'EU hub stopover',
    },
    {
      location: { lat: 48.8566, lng: 2.3522, name: 'Paris' },
      arrivalDate: '2026-01-18',
      departureDate: '2026-01-19',
      description: 'Cultural exchange in Paris',
    },
    {
      location: { lat: 47.3769, lng: 8.5417, name: 'Zurich' },
      arrivalDate: '2026-01-19',
      departureDate: '2026-01-20',
      description: 'Swiss financial hub',
    },
    {
      location: { lat: 46.8092, lng: 9.8358, name: 'Davos' },
      arrivalDate: '2026-01-20',
      departureDate: '2026-01-24',
      description: 'World Economic Forum',
    },
  ],
  participants: 0,
  vehicles: 0,
  boats: 0,
  horses: 0,
  startDate: '2026-01-16',
  description: 'Journey to the World Economic Forum in Davos, Switzerland',
};

export const allCaravans = [davosCaravan, slushCaravan];

// Guild members
export const guildMembers: GuildMember[] = [
  {
    id: 'member-1',
    name: 'Kiki',
    passportId: 'TG-2025-001',
    location: { lat: 51.5306, lng: -0.1239, name: 'Kings Cross, London' },
    bio: 'Guild founder and organizer',
    joinedDate: '2025-01-01',
  },
  {
    id: 'member-2',
    name: 'Alex Chen',
    passportId: 'TG-2025-002',
    location: { lat: 31.2304, lng: 121.4737, name: 'Shanghai, China' },
    bio: 'China node coordinator',
    joinedDate: '2025-03-15',
  },
  {
    id: 'member-3',
    name: 'Wei Zhang',
    passportId: 'TG-2025-003',
    location: { lat: 39.9042, lng: 116.4074, name: 'Beijing, China' },
    bio: 'Beijing representative',
    joinedDate: '2025-04-20',
  },
  {
    id: 'member-4',
    name: 'Sofia Martinez',
    passportId: 'TG-2025-004',
    location: { lat: 52.3676, lng: 4.9041, name: 'Amsterdam' },
    bio: 'Amsterdam node operator',
    joinedDate: '2025-05-10',
  },
  {
    id: 'member-5',
    name: 'Marcus Berg',
    passportId: 'TG-2025-005',
    location: { lat: 59.3293, lng: 18.0686, name: 'Stockholm' },
    bio: 'Nordic representative',
    joinedDate: '2025-06-15',
  },
];

// Properties / Kontors
export const properties: Property[] = [
  {
    id: 'prop-1',
    name: 'Kings Cross House',
    type: 'house',
    location: { lat: 51.5306, lng: -0.1239, name: 'Kings Cross, London' },
    description: 'Main London hub and guild headquarters',
    capacity: 20,
    amenities: ['Coworking', 'Kitchen', 'Event Space'],
  },
  {
    id: 'prop-2',
    name: 'Amsterdam Kontor',
    type: 'kontor',
    location: { lat: 52.3676, lng: 4.9041, name: 'Amsterdam' },
    description: 'Historic canal house converted to guild space',
    capacity: 12,
    amenities: ['Meeting Rooms', 'Kitchen'],
  },
  {
    id: 'prop-3',
    name: 'Hamburg Trading Post',
    type: 'office',
    location: { lat: 53.5511, lng: 9.9937, name: 'Hamburg' },
    description: 'Coworking space in historic Hanseatic quarter',
    capacity: 15,
    amenities: ['Coworking', 'Conference Room'],
  },
];

// Current user passport (hardcoded)
export const currentUserPassport: Passport = {
  id: 'TG-2025-001',
  memberId: 'member-1',
  issueDate: '2025-01-01',
  guild: 'Telos Guild',
  rank: 'Founder',
};
