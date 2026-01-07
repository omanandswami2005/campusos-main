import { memory, Attendance } from '../state/memory';

interface GetEventAttendanceParams {
  eventId: string;
}

interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
}

export const getEventAttendance = (params: GetEventAttendanceParams): Attendance[] => {
  return Array.from(memory.attendance.values()).filter((a) => a.eventId === params.eventId);
};

export const getUserAttendance = (userId: string): Attendance[] => {
  return Array.from(memory.attendance.values()).filter((a) => a.userId === userId);
};

export const getAttendanceStats = (eventId: string): AttendanceStats => {
  const attendance = getEventAttendance({ eventId });
  const total = attendance.length;
  const present = attendance.filter((a) => a.status === 'present').length;
  const absent = attendance.filter((a) => a.status === 'absent').length;
  const late = attendance.filter((a) => a.status === 'late').length;

  return {
    total,
    present,
    absent,
    late,
    attendanceRate: total > 0 ? ((present + late) / total) * 100 : 0,
  };
};

export const getParticipantList = (eventId: string) => {
  const attendance = getEventAttendance({ eventId });
  return attendance.map((a) => {
    const user = memory.users.get(a.userId);
    return {
      attendanceId: a.id,
      userId: a.userId,
      userName: user?.name || 'Unknown',
      userEmail: user?.email || 'Unknown',
      status: a.status,
      checkInTime: a.checkInTime,
      checkOutTime: a.checkOutTime,
    };
  });
};
