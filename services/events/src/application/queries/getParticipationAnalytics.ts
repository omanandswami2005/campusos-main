import { memory } from '../state/memory';

interface ParticipationAnalytics {
  totalEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  averageAttendanceRate: number;
  eventsByCategory: { [category: string]: number };
  registrationsByMonth: { [month: string]: number };
  topEvents: { eventId: string; title: string; registrations: number }[];
  userEngagement: {
    activeUsers: number;
    repeatParticipants: number;
  };
}

export const getParticipationAnalytics = (collegeId?: string): ParticipationAnalytics => {
  let events = Array.from(memory.events.values());
  if (collegeId) {
    events = events.filter((e) => e.collegeId === collegeId);
  }

  const eventIds = new Set(events.map((e) => e.id));
  const registrations = Array.from(memory.registrations.values()).filter(
    (r) => eventIds.has(r.eventId) && r.status !== 'cancelled'
  );
  const attendance = Array.from(memory.attendance.values()).filter((a) => eventIds.has(a.eventId));

  // Events by category
  const eventsByCategory: { [category: string]: number } = {};
  events.forEach((e) => {
    const category = memory.categories.get(e.category)?.name || 'Other';
    eventsByCategory[category] = (eventsByCategory[category] || 0) + 1;
  });

  // Registrations by month
  const registrationsByMonth: { [month: string]: number } = {};
  registrations.forEach((r) => {
    const month = r.registeredAt.substring(0, 7); // YYYY-MM
    registrationsByMonth[month] = (registrationsByMonth[month] || 0) + 1;
  });

  // Top events by registrations
  const eventRegCounts = new Map<string, number>();
  registrations.forEach((r) => {
    eventRegCounts.set(r.eventId, (eventRegCounts.get(r.eventId) || 0) + 1);
  });

  const topEvents = Array.from(eventRegCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([eventId, count]) => {
      const event = memory.events.get(eventId);
      return {
        eventId,
        title: event?.title || 'Unknown',
        registrations: count,
      };
    });

  // User engagement
  const userRegistrations = new Map<string, number>();
  registrations.forEach((r) => {
    userRegistrations.set(r.userId, (userRegistrations.get(r.userId) || 0) + 1);
  });

  const activeUsers = userRegistrations.size;
  const repeatParticipants = Array.from(userRegistrations.values()).filter(
    (count) => count > 1
  ).length;

  // Average attendance rate
  const eventsWithAttendance = new Set(attendance.map((a) => a.eventId));
  let totalAttendanceRate = 0;
  eventsWithAttendance.forEach((eventId) => {
    const eventAttendance = attendance.filter((a) => a.eventId === eventId);
    const present = eventAttendance.filter(
      (a) => a.status === 'present' || a.status === 'late'
    ).length;
    totalAttendanceRate += (present / eventAttendance.length) * 100;
  });
  const averageAttendanceRate =
    eventsWithAttendance.size > 0 ? totalAttendanceRate / eventsWithAttendance.size : 0;

  return {
    totalEvents: events.length,
    totalRegistrations: registrations.length,
    totalAttendance: attendance.filter((a) => a.status === 'present' || a.status === 'late').length,
    averageAttendanceRate: Math.round(averageAttendanceRate * 10) / 10,
    eventsByCategory,
    registrationsByMonth,
    topEvents,
    userEngagement: {
      activeUsers,
      repeatParticipants,
    },
  };
};
