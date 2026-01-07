import type { EventItem } from '@campus-os/types';

// Extended Event types for the events service
export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
  status: 'registered' | 'cancelled' | 'attended';
  ticketNumber: string;
}

export interface EventCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface EventOrganizer {
  id: string;
  name: string;
  email: string;
  department: string;
  collegeId: string;
}

// Club Management Types
export interface Club {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;
  collegeId: string;
  coordinatorId: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  memberCount: number;
  foundedDate: string;
  email: string;
  socialLinks?: { platform: string; url: string }[];
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type:
    | 'registration_confirmation'
    | 'event_update'
    | 'event_cancelled'
    | 'event_reminder'
    | 'club_approved'
    | 'club_rejected'
    | 'attendance_marked'
    | 'certificate_ready';
  title: string;
  message: string;
  eventId?: string;
  clubId?: string;
  isRead: boolean;
  createdAt: string;
}

// Attendance Types
export interface Attendance {
  id: string;
  eventId: string;
  userId: string;
  checkInTime: string;
  checkOutTime?: string;
  markedBy: string;
  status: 'present' | 'absent' | 'late';
}

// Feedback Types
export interface Feedback {
  id: string;
  eventId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  categories: {
    organization: number;
    content: number;
    venue: number;
    overall: number;
  };
  isAnonymous: boolean;
  submittedAt: string;
}

// Certificate Types
export interface Certificate {
  id: string;
  eventId: string;
  userId: string;
  type: 'participation' | 'winner' | 'runner_up' | 'organizer';
  certificateNumber: string;
  issuedAt: string;
  downloadUrl: string;
  studentName: string;
  eventName: string;
  eventDate: string;
  position?: string;
}

export interface ExtendedEventItem extends EventItem {
  collegeId: string;
  organizerId: string;
  clubId?: string; // Optional club association
  category: string;
  capacity: number;
  registeredCount: number;
  imageUrl?: string;
  venue: string;
  isPublic: boolean;
  registrationDeadline: string;
  status: 'draft' | 'pending_approval' | 'published' | 'cancelled' | 'completed';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  rules?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  collegeId: string;
  role: 'student' | 'coordinator' | 'admin';
  clubIds?: string[]; // Clubs the user coordinates
}

type MemoryState = {
  events: Map<string, ExtendedEventItem>;
  registrations: Map<string, EventRegistration>;
  categories: Map<string, EventCategory>;
  organizers: Map<string, EventOrganizer>;
  users: Map<string, User & { password: string }>;
  clubs: Map<string, Club>;
  notifications: Map<string, Notification>;
  attendance: Map<string, Attendance>;
  feedback: Map<string, Feedback>;
  certificates: Map<string, Certificate>;
};

export const JWT_SECRET = 'demo-secret-key-change-in-prod';

// Seed categories
const categoriesSeed: EventCategory[] = [
  {
    id: 'cat-tech',
    name: 'Technology',
    description: 'Tech events, hackathons, workshops',
    color: '#3B82F6',
  },
  {
    id: 'cat-cultural',
    name: 'Cultural',
    description: 'Cultural festivals and performances',
    color: '#EC4899',
  },
  {
    id: 'cat-sports',
    name: 'Sports',
    description: 'Sports tournaments and fitness events',
    color: '#10B981',
  },
  {
    id: 'cat-academic',
    name: 'Academic',
    description: 'Seminars, lectures, conferences',
    color: '#8B5CF6',
  },
  {
    id: 'cat-social',
    name: 'Social',
    description: 'Social gatherings and networking',
    color: '#F59E0B',
  },
];

// Seed organizers
const organizersSeed: EventOrganizer[] = [
  {
    id: 'org-cs',
    name: 'CS Department',
    email: 'cs@campus.edu',
    department: 'Computer Science',
    collegeId: 'college-a',
  },
  {
    id: 'org-cultural',
    name: 'Cultural Committee',
    email: 'cultural@campus.edu',
    department: 'Student Affairs',
    collegeId: 'college-a',
  },
  {
    id: 'org-sports',
    name: 'Sports Council',
    email: 'sports@campus.edu',
    department: 'Physical Education',
    collegeId: 'college-a',
  },
];

// Seed events
const eventsSeed: ExtendedEventItem[] = [
  {
    id: 'event-hackathon',
    title: 'Campus Hackathon 2026',
    description:
      '24-hour coding challenge with exciting prizes. Build innovative solutions for campus problems.',
    start: '2026-02-15T09:00:00Z',
    end: '2026-02-16T09:00:00Z',
    location: 'Tech Building, Lab 101',
    tags: ['hackathon', 'coding', 'prizes'],
    collegeId: 'college-a',
    organizerId: 'org-cs',
    clubId: 'club-tech',
    category: 'cat-tech',
    capacity: 100,
    registeredCount: 45,
    imageUrl: '/images/hackathon.jpg',
    venue: 'Tech Building, Lab 101',
    isPublic: true,
    registrationDeadline: '2026-02-10T23:59:59Z',
    status: 'published',
    approvalStatus: 'approved',
    approvedBy: 'user-admin1',
    approvedAt: '2026-01-02T10:00:00Z',
    rules: ['Teams of 2-4 members', 'Bring your own laptop', 'No pre-built solutions'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'event-cultural-fest',
    title: 'Spring Cultural Festival',
    description: 'Annual cultural extravaganza featuring music, dance, and art performances.',
    start: '2026-03-01T10:00:00Z',
    end: '2026-03-03T22:00:00Z',
    location: 'Main Auditorium',
    tags: ['cultural', 'music', 'dance', 'festival'],
    collegeId: 'college-a',
    organizerId: 'org-cultural',
    clubId: 'club-cultural',
    category: 'cat-cultural',
    capacity: 500,
    registeredCount: 320,
    imageUrl: '/images/cultural-fest.jpg',
    venue: 'Main Auditorium & Open Grounds',
    isPublic: true,
    registrationDeadline: '2026-02-25T23:59:59Z',
    status: 'published',
    approvalStatus: 'approved',
    approvedBy: 'user-admin1',
    approvedAt: '2026-01-02T10:00:00Z',
    rules: ['College ID required', 'Follow dress code'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'event-workshop-ai',
    title: 'AI/ML Workshop Series',
    description: 'Hands-on workshop covering fundamentals of AI and Machine Learning.',
    start: '2026-01-20T14:00:00Z',
    end: '2026-01-20T17:00:00Z',
    location: 'Seminar Hall B',
    tags: ['ai', 'ml', 'workshop', 'learning'],
    collegeId: 'college-a',
    organizerId: 'org-cs',
    clubId: 'club-tech',
    category: 'cat-academic',
    capacity: 50,
    registeredCount: 48,
    imageUrl: '/images/ai-workshop.jpg',
    venue: 'Seminar Hall B',
    isPublic: true,
    registrationDeadline: '2026-01-18T23:59:59Z',
    status: 'published',
    approvalStatus: 'approved',
    approvedBy: 'user-admin1',
    approvedAt: '2026-01-02T10:00:00Z',
    rules: ['Laptop required', 'Python basics recommended'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'event-cricket',
    title: 'Inter-Department Cricket Tournament',
    description: 'Annual cricket tournament between departments. Form your team now!',
    start: '2026-02-01T08:00:00Z',
    end: '2026-02-07T18:00:00Z',
    location: 'Campus Cricket Ground',
    tags: ['sports', 'cricket', 'tournament'],
    collegeId: 'college-a',
    organizerId: 'org-sports',
    clubId: 'club-sports',
    category: 'cat-sports',
    capacity: 200,
    registeredCount: 156,
    imageUrl: '/images/cricket.jpg',
    venue: 'Campus Cricket Ground',
    isPublic: true,
    registrationDeadline: '2026-01-28T23:59:59Z',
    status: 'published',
    approvalStatus: 'approved',
    approvedBy: 'user-admin1',
    approvedAt: '2026-01-02T10:00:00Z',
    rules: ['Team of 11 players', 'Sports attire mandatory', 'Follow fair play rules'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'event-pending',
    title: 'Photography Workshop',
    description: 'Learn basic photography techniques from professional photographers.',
    start: '2026-02-20T10:00:00Z',
    end: '2026-02-20T16:00:00Z',
    location: 'Art Building',
    tags: ['photography', 'workshop', 'art'],
    collegeId: 'college-a',
    organizerId: 'user-coordinator1',
    clubId: 'club-art',
    category: 'cat-cultural',
    capacity: 30,
    registeredCount: 0,
    venue: 'Art Building Room 201',
    isPublic: true,
    registrationDeadline: '2026-02-18T23:59:59Z',
    status: 'pending_approval',
    approvalStatus: 'pending',
    rules: ['Bring your own camera (optional)'],
    createdAt: '2026-01-06T00:00:00Z',
    updatedAt: '2026-01-06T00:00:00Z',
  },
];

// Seed clubs
const clubsSeed: Club[] = [
  {
    id: 'club-tech',
    name: 'Tech Innovators Club',
    description: 'A community for tech enthusiasts to learn, build, and innovate together.',
    logoUrl: '/images/clubs/tech-club.png',
    collegeId: 'college-a',
    coordinatorId: 'user-coordinator1',
    category: 'cat-tech',
    status: 'approved',
    memberCount: 150,
    foundedDate: '2020-08-15',
    email: 'tech.club@campus.edu',
    socialLinks: [{ platform: 'instagram', url: 'https://instagram.com/techclub' }],
    createdAt: '2020-08-15T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'club-cultural',
    name: 'Cultural Society',
    description: 'Celebrating diversity through art, music, and dance performances.',
    logoUrl: '/images/clubs/cultural-club.png',
    collegeId: 'college-a',
    coordinatorId: 'user-coordinator2',
    category: 'cat-cultural',
    status: 'approved',
    memberCount: 200,
    foundedDate: '2018-03-10',
    email: 'cultural@campus.edu',
    createdAt: '2018-03-10T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'club-sports',
    name: 'Sports Club',
    description: 'Promoting fitness and sportsmanship through various sports activities.',
    logoUrl: '/images/clubs/sports-club.png',
    collegeId: 'college-a',
    coordinatorId: 'user-coordinator3',
    category: 'cat-sports',
    status: 'approved',
    memberCount: 300,
    foundedDate: '2015-06-01',
    email: 'sports@campus.edu',
    createdAt: '2015-06-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'club-art',
    name: 'Art & Photography Club',
    description: 'For students passionate about visual arts and photography.',
    collegeId: 'college-a',
    coordinatorId: 'user-coordinator1',
    category: 'cat-cultural',
    status: 'approved',
    memberCount: 80,
    foundedDate: '2021-01-20',
    email: 'artclub@campus.edu',
    createdAt: '2021-01-20T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'club-pending',
    name: 'Robotics Club',
    description: 'Building the future with robots and automation.',
    collegeId: 'college-a',
    coordinatorId: 'user-student1',
    category: 'cat-tech',
    status: 'pending',
    memberCount: 0,
    foundedDate: '2026-01-05',
    email: 'robotics@campus.edu',
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
  },
];

// Seed users (updated with coordinator role)
const usersSeed: (User & { password: string })[] = [
  {
    id: 'user-student1',
    name: 'Test Student',
    email: 'student@campus.edu',
    collegeId: 'college-a',
    role: 'student',
    password: 'password123',
  },
  {
    id: 'user-coordinator1',
    name: 'Club Coordinator',
    email: 'coordinator@campus.edu',
    collegeId: 'college-a',
    role: 'coordinator',
    clubIds: ['club-tech', 'club-art'],
    password: 'password123',
  },
  {
    id: 'user-coordinator2',
    name: 'Cultural Coordinator',
    email: 'cultural.coord@campus.edu',
    collegeId: 'college-a',
    role: 'coordinator',
    clubIds: ['club-cultural'],
    password: 'password123',
  },
  {
    id: 'user-coordinator3',
    name: 'Sports Coordinator',
    email: 'sports.coord@campus.edu',
    collegeId: 'college-a',
    role: 'coordinator',
    clubIds: ['club-sports'],
    password: 'password123',
  },
  {
    id: 'user-admin1',
    name: 'Admin User',
    email: 'admin@campus.edu',
    collegeId: 'college-a',
    role: 'admin',
    password: 'password123',
  },
];

// Seed registrations
const registrationsSeed: EventRegistration[] = [
  {
    id: 'reg-1',
    eventId: 'event-hackathon',
    userId: 'user-student1',
    registeredAt: '2026-01-05T10:00:00Z',
    status: 'registered',
    ticketNumber: 'HACK-001',
  },
];

// Seed notifications
const notificationsSeed: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-student1',
    type: 'registration_confirmation',
    title: 'Registration Confirmed',
    message:
      'You have successfully registered for Campus Hackathon 2026. Your ticket number is HACK-001.',
    eventId: 'event-hackathon',
    isRead: false,
    createdAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-student1',
    type: 'event_reminder',
    title: 'Event Reminder',
    message: "Campus Hackathon 2026 starts in 7 days. Don't forget to prepare!",
    eventId: 'event-hackathon',
    isRead: false,
    createdAt: '2026-02-08T09:00:00Z',
  },
];

// Seed attendance (empty initially)
const attendanceSeed: Attendance[] = [];

// Seed feedback (empty initially)
const feedbackSeed: Feedback[] = [];

// Seed certificates (empty initially)
const certificatesSeed: Certificate[] = [];

export const memory: MemoryState = {
  events: new Map(eventsSeed.map((e) => [e.id, e])),
  registrations: new Map(registrationsSeed.map((r) => [r.id, r])),
  categories: new Map(categoriesSeed.map((c) => [c.id, c])),
  organizers: new Map(organizersSeed.map((o) => [o.id, o])),
  users: new Map(usersSeed.map((u) => [u.id, u])),
  clubs: new Map(clubsSeed.map((c) => [c.id, c])),
  notifications: new Map(notificationsSeed.map((n) => [n.id, n])),
  attendance: new Map(attendanceSeed.map((a) => [a.id, a])),
  feedback: new Map(feedbackSeed.map((f) => [f.id, f])),
  certificates: new Map(certificatesSeed.map((c) => [c.id, c])),
};

export const findUserByEmail = (email: string) => {
  for (const user of memory.users.values()) {
    if (user.email === email) return user;
  }
  return null;
};

// Helper to create notifications
export const createNotification = (
  notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
) => {
  const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newNotification: Notification = {
    ...notification,
    id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  memory.notifications.set(id, newNotification);
  return newNotification;
};

// Helper to generate certificate
export const generateCertificateNumber = () => {
  return `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};
