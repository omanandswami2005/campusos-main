import type { ExtendedEventItem } from '../../application/state/memory';

export class Event {
  constructor(private readonly data: ExtendedEventItem) {}

  get id() {
    return this.data.id;
  }
  get title() {
    return this.data.title;
  }
  get description() {
    return this.data.description;
  }
  get start() {
    return this.data.start;
  }
  get end() {
    return this.data.end;
  }
  get location() {
    return this.data.location;
  }
  get tags() {
    return this.data.tags;
  }
  get collegeId() {
    return this.data.collegeId;
  }
  get organizerId() {
    return this.data.organizerId;
  }
  get category() {
    return this.data.category;
  }
  get capacity() {
    return this.data.capacity;
  }
  get registeredCount() {
    return this.data.registeredCount;
  }
  get imageUrl() {
    return this.data.imageUrl;
  }
  get venue() {
    return this.data.venue;
  }
  get isPublic() {
    return this.data.isPublic;
  }
  get registrationDeadline() {
    return this.data.registrationDeadline;
  }
  get status() {
    return this.data.status;
  }
  get createdAt() {
    return this.data.createdAt;
  }
  get updatedAt() {
    return this.data.updatedAt;
  }

  get availableSpots() {
    return this.data.capacity - this.data.registeredCount;
  }

  get isRegistrationOpen() {
    return (
      this.data.status === 'published' &&
      new Date() < new Date(this.data.registrationDeadline) &&
      this.availableSpots > 0
    );
  }

  get isUpcoming() {
    return new Date(this.data.start) > new Date();
  }

  toJSON() {
    return {
      ...this.data,
      availableSpots: this.availableSpots,
      isRegistrationOpen: this.isRegistrationOpen,
      isUpcoming: this.isUpcoming,
    };
  }
}
