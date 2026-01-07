import {
  memory,
  Certificate,
  createNotification,
  generateCertificateNumber,
} from '../state/memory';

interface GenerateCertificateInput {
  eventId: string;
  userId: string;
  type: Certificate['type'];
  position?: string;
  issuedBy: string;
}

interface BulkGenerateCertificatesInput {
  eventId: string;
  type: Certificate['type'];
  issuedBy: string;
}

export const generateCertificate = (input: GenerateCertificateInput): Certificate | null => {
  const event = memory.events.get(input.eventId);
  if (!event) return null;

  const user = memory.users.get(input.userId);
  if (!user) return null;

  // Verify issuer is coordinator or admin
  const issuer = memory.users.get(input.issuedBy);
  if (!issuer || (issuer.role !== 'admin' && issuer.role !== 'coordinator')) return null;

  // Check if certificate already exists for this user and event
  const existingCert = Array.from(memory.certificates.values()).find(
    (c) => c.eventId === input.eventId && c.userId === input.userId && c.type === input.type
  );
  if (existingCert) return existingCert;

  // For participation certificates, verify attendance
  if (input.type === 'participation') {
    const attendance = Array.from(memory.attendance.values()).find(
      (a) => a.eventId === input.eventId && a.userId === input.userId && a.status !== 'absent'
    );
    if (!attendance) {
      // Check if at least registered
      const registration = Array.from(memory.registrations.values()).find(
        (r) => r.eventId === input.eventId && r.userId === input.userId && r.status === 'attended'
      );
      if (!registration) return null;
    }
  }

  const id = `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const certNumber = generateCertificateNumber();
  const now = new Date().toISOString();

  const certificate: Certificate = {
    id,
    eventId: input.eventId,
    userId: input.userId,
    type: input.type,
    certificateNumber: certNumber,
    issuedAt: now,
    downloadUrl: `/certificates/${id}/download`,
    studentName: user.name,
    eventName: event.title,
    eventDate: event.start.split('T')[0],
    position: input.position,
  };

  memory.certificates.set(id, certificate);

  // Notify the user
  createNotification({
    userId: input.userId,
    type: 'certificate_ready',
    title: 'Certificate Ready!',
    message: `Your ${input.type} certificate for "${event.title}" is ready for download.`,
    eventId: input.eventId,
  });

  return certificate;
};

export const bulkGenerateCertificates = (input: BulkGenerateCertificatesInput): Certificate[] => {
  const event = memory.events.get(input.eventId);
  if (!event) return [];

  // Get all attendees who attended
  const attendees = Array.from(memory.attendance.values())
    .filter((a) => a.eventId === input.eventId && a.status !== 'absent')
    .map((a) => a.userId);

  // Also include registered users marked as attended
  const registeredAttended = Array.from(memory.registrations.values())
    .filter((r) => r.eventId === input.eventId && r.status === 'attended')
    .map((r) => r.userId);

  const allUserIds = [...new Set([...attendees, ...registeredAttended])];

  const certificates: Certificate[] = [];
  for (const userId of allUserIds) {
    const cert = generateCertificate({
      eventId: input.eventId,
      userId,
      type: input.type,
      issuedBy: input.issuedBy,
    });
    if (cert) certificates.push(cert);
  }

  return certificates;
};
