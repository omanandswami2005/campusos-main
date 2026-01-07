import { memory, Club, createNotification } from '../state/memory';

interface CreateClubInput {
  name: string;
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;
  collegeId: string;
  coordinatorId: string;
  category: string;
  email: string;
  socialLinks?: { platform: string; url: string }[];
}

export const createClub = (input: CreateClubInput): Club => {
  const id = `club-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const club: Club = {
    id,
    name: input.name,
    description: input.description,
    logoUrl: input.logoUrl,
    coverImageUrl: input.coverImageUrl,
    collegeId: input.collegeId,
    coordinatorId: input.coordinatorId,
    category: input.category,
    status: 'pending', // Requires admin approval
    memberCount: 0,
    foundedDate: now.split('T')[0],
    email: input.email,
    socialLinks: input.socialLinks,
    createdAt: now,
    updatedAt: now,
  };

  memory.clubs.set(id, club);

  // Notify admins about new club registration
  const admins = Array.from(memory.users.values()).filter((u) => u.role === 'admin');
  admins.forEach((admin) => {
    createNotification({
      userId: admin.id,
      type: 'club_approved', // Using this type for pending notification
      title: 'New Club Registration',
      message: `A new club "${club.name}" has been submitted for approval.`,
      clubId: club.id,
    });
  });

  return club;
};
