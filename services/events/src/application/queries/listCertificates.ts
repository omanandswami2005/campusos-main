import { memory, Certificate } from '../state/memory';

export const listUserCertificates = (userId: string): Certificate[] => {
  return Array.from(memory.certificates.values())
    .filter((c) => c.userId === userId)
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
};

export const listEventCertificates = (eventId: string): Certificate[] => {
  return Array.from(memory.certificates.values())
    .filter((c) => c.eventId === eventId)
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
};

export const getCertificate = (certificateId: string): Certificate | null => {
  return memory.certificates.get(certificateId) || null;
};

export const getCertificateByNumber = (certificateNumber: string): Certificate | null => {
  for (const cert of memory.certificates.values()) {
    if (cert.certificateNumber === certificateNumber) {
      return cert;
    }
  }
  return null;
};
