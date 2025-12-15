import { Caravan, GuildMember, Property, Passport } from '@/types/guild';

export const slushCaravan: Caravan = {
  id: 'slush-2025',
  name: 'Slush Caravan 2025',
  status: 'completed',
  route: {
    start: { lat: 51.5074, lng: -0.1278, name: 'London' },
    end: { lat: 60.1699, lng: 24.9384, name: 'Helsinki' },
    waypoints: [
      { lat: 51.5074, lng: -0.1278, name: 'London' },
      { lat: 51.2194, lng: 4.4025, name: 'Antwerp, Belgium' },
      { lat: 52.5200, lng: 13.4050, name: 'Berlin, Germany' },
      { lat: 52.2297, lng: 21.0122, name: 'Warsaw, Poland' },
      { lat: 56.9496, lng: 24.1052, name: 'Riga, Latvia' },
      { lat: 59.4370, lng: 24.7536, name: 'Tallinn, Estonia' }, // Added to avoid water crossing
      { lat: 60.1699, lng: 24.9384, name: 'Helsinki, Finland' },
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
      location: { lat: 51.2194, lng: 4.4025, name: 'Antwerp, Belgium' },
      arrivalDate: '2025-11-16',
      departureDate: '2025-11-17',
      description: 'Historic Hanseatic trading city',
    },
    {
      location: { lat: 52.5200, lng: 13.4050, name: 'Berlin, Germany' },
      arrivalDate: '2025-11-17',
      departureDate: '2025-11-18',
      description: 'German capital stopover',
    },
    {
      location: { lat: 52.2297, lng: 21.0122, name: 'Warsaw, Poland' },
      arrivalDate: '2025-11-18',
      departureDate: '2025-11-19',
      description: 'Polish capital visit',
    },
    {
      location: { lat: 56.9496, lng: 24.1052, name: 'Riga, Latvia' },
      arrivalDate: '2025-11-19',
      departureDate: '2025-11-19',
      description: 'Baltic hub',
    },
    {
      location: { lat: 59.4370, lng: 24.7536, name: 'Tallinn, Estonia' },
      arrivalDate: '2025-11-19',
      departureDate: '2025-11-20',
      description: 'Estonian capital before ferry to Helsinki',
    },
    {
      location: { lat: 60.1699, lng: 24.9384, name: 'Helsinki, Finland' },
      arrivalDate: '2025-11-20',
      departureDate: '2025-11-23',
      description: 'Slush Conference destination',
    },
  ],
  participants: 24,
  vehicles: 7,
  boats: 5,
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
    id: 'member-5',
    name: 'Marcus Berg',
    passportId: 'TG-2025-005',
    location: { lat: 59.3293, lng: 18.0686, name: 'Stockholm' },
    bio: 'Nordic representative',
    joinedDate: '2025-06-15',
  },
  {
    id: 'member-6',
    name: 'Li Wei',
    passportId: 'TG-2025-006',
    location: { lat: 22.5431, lng: 114.0579, name: 'Shenzhen, China' },
    bio: 'Shenzhen supply chain liaison',
    joinedDate: '2025-07-01',
  },
];

export const partnerVCs: GuildMember[] = [
  {
    id: 'vc-copenhagen',
    name: 'Nordic Ventures',
    passportId: 'VC-2025-001',
    location: { lat: 55.6761, lng: 12.5683, name: 'Copenhagen, Denmark' },
    bio: 'Leading Nordic venture capital firm',
    joinedDate: '2025-02-01',
  },
];

export const supplierLinks: Property[] = [
  {
    id: 'supplier-shenzhen',
    name: 'Shenzhen Manufacturing Hub',
    type: 'supplier',
    location: { lat: 22.5431, lng: 114.0579, name: 'Shenzhen, China' },
    description: 'Electronics and hardware manufacturing partner',
    capacity: 0,
    amenities: ['Manufacturing', 'R&D', 'Logistics'],
  },
];

export const properties: Property[] = [
  {
    id: 'prop-telos',
    name: 'Telos House',
    type: 'house',
    location: { lat: 51.5306, lng: -0.1239, name: 'Kings Cross, London' },
    description: 'Main London hub and guild headquarters',
    capacity: 20,
    amenities: ['Coworking', 'Kitchen', 'Event Space'],
  },
];

export const currentUserPassport: Passport = {
  id: 'TG-2025-001',
  memberId: 'member-1',
  issueDate: '2025-01-01',
  guild: 'Telos Guild',
  rank: 'Founder',
};
