import { memory, Attendance, createNotification } from '../state/memory';

interface MarkAttendanceInput {
  eventId: string;
  userId: string;
  markedBy: string;
  status: Attendance['status'];
}

interface BulkMarkAttendanceInput {
  eventId: string;
  markedBy: string;
  attendees: { userId: string; status: Attendance['status'] }[];
}

export const markAttendance = (input: MarkAttendanceInput): Attendance | null => {
  const event = memory.events.get(input.eventId);
  if (!event) return null;

  // Verify the marker has permission (coordinator or admin)
  const marker = memory.users.get(input.markedBy);
  if (!marker || (marker.role !== 'admin' && marker.role !== 'coordinator')) return null;

  // Check if user is registered
  const registration = Array.from(memory.registrations.values()).find(
    (r) => r.eventId === input.eventId && r.userId === input.userId && r.status === 'registered'
  );
  if (!registration) return null;

  // Check for existing attendance record
  const existingAttendance = Array.from(memory.attendance.values()).find(
    (a) => a.eventId === input.eventId && a.userId === input.userId
  );

  const now = new Date().toISOString();

  if (existingAttendance) {
    // Update existing record
    const updated: Attendance = {
      ...existingAttendance,
      status: input.status,
      checkInTime: input.status !== 'absent' ? now : existingAttendance.checkInTime,
    };
    memory.attendance.set(existingAttendance.id, updated);

    // Update registration status
    if (input.status === 'present' || input.status === 'late') {
      memory.registrations.set(registration.id, { ...registration, status: 'attended' });
    }

    return updated;
  }

  // Create new attendance record
  const id = `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const attendance: Attendance = {
    id,
    eventId: input.eventId,
    userId: input.userId,
    checkInTime: input.status !== 'absent' ? now : '',
    markedBy: input.markedBy,
    status: input.status,
  };

  memory.attendance.set(id, attendance);

  // Update registration status
  if (input.status === 'present' || input.status === 'late') {
    memory.registrations.set(registration.id, { ...registration, status: 'attended' });
  }

  // Notify the user
  createNotification({
    userId: input.userId,
    type: 'attendance_marked',
    title: 'Attendance Recorded',
    message: `Your attendance for "${event.title}" has been marked as ${input.status}.`,
    eventId: input.eventId,
  });

  return attendance;
};

export const bulkMarkAttendance = (input: BulkMarkAttendanceInput): Attendance[] => {
  const results: Attendance[] = [];

  for (const attendee of input.attendees) {
    const result = markAttendance({
      eventId: input.eventId,
      userId: attendee.userId,
      markedBy: input.markedBy,
      status: attendee.status,
    });
    if (result) results.push(result);
  }

  return results;
};

export const markCheckOut = (eventId: string, userId: string): Attendance | null => {
  const attendance = Array.from(memory.attendance.values()).find(
    (a) => a.eventId === eventId && a.userId === userId
  );

  if (!attendance || attendance.checkOutTime) return null;

  const updated: Attendance = {
    ...attendance,
    checkOutTime: new Date().toISOString(),
  };

  memory.attendance.set(attendance.id, updated);
  return updated;
};
