import { HttpClient } from './http';
import type { Event, EventRegistration, Club, EventFeedback, Certificate } from '@campus-os/types';

export interface CreateEventInput {
  title: string;
  description: string;
  start: string;
  end: string;
  location: string;
  collegeId: string;
  organizerId: string;
  category: string;
}

export interface ListEventsFilters {
  collegeId?: string;
  category?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export class EventsClient {
  constructor(private http: HttpClient) {}

  // Events
  listEvents(filters: ListEventsFilters = {}) {
    const query = new URLSearchParams(filters as any).toString();
    return this.http.get<Event[]>(`/events?${query}`);
  }

  getEvent(id: string) {
    return this.http.get<Event>(`/events/${id}`);
  }

  createEvent(input: CreateEventInput) {
    return this.http.post<Event>('/events', input);
  }

  registerForEvent(eventId: string) {
    return this.http.post<EventRegistration>(`/events/${eventId}/register`);
  }

  // Registrations
  listRegistrations(eventId?: string) {
    const query = eventId ? `?eventId=${eventId}` : '';
    return this.http.get<EventRegistration[]>(`/registrations${query}`);
  }

  cancelRegistration(registrationId: string) {
    return this.http.delete<void>(`/registrations/${registrationId}`);
  }

  // Clubs
  listClubs(collegeId?: string) {
    const query = collegeId ? `?collegeId=${collegeId}` : '';
    return this.http.get<Club[]>(`/clubs${query}`);
  }

  getClub(id: string) {
    return this.http.get<Club>(`/clubs/${id}`);
  }

  // Feedback
  listFeedback(eventId: string) {
    return this.http.get<EventFeedback[]>(`/events/${eventId}/feedback`);
  }

  submitFeedback(eventId: string, input: { rating: number; comment?: string }) {
    return this.http.post<EventFeedback>(`/events/${eventId}/feedback`, input);
  }

  // Certificates
  listMyCertificates() {
    return this.http.get<Certificate[]>('/certificates');
  }

  verifyCertificate(number: string) {
    return this.http.get<{ valid: boolean; certificate: Certificate }>(
      `/certificates/verify?number=${number}`
    );
  }
}
