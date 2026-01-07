export interface Event {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  location: string;
  category: string;
  tags: string[];
  organizerId: string;
  collegeId: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  collegeId: string;
  category: string;
  status: 'pending' | 'active' | 'suspended';
  coordinatorId: string;
  membersCount: number;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: 'registered' | 'waitlisted' | 'cancelled' | 'attended';
  registeredAt: string;
}

export interface EventFeedback {
  id: string;
  eventId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  number: string;
  type: string;
  userId: string;
  eventId: string;
  issuedAt: string;
  issuedBy: string;
}
