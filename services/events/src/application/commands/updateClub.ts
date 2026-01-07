import { memory, Club } from '../state/memory';

interface UpdateClubInput {
  clubId: string;
  name?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  email?: string;
  socialLinks?: { platform: string; url: string }[];
}

export const updateClub = (input: UpdateClubInput, userId: string): Club | null => {
  const club = memory.clubs.get(input.clubId);
  if (!club) return null;

  // Only coordinator of this club or admin can update
  const user = memory.users.get(userId);
  if (!user) return null;
  if (user.role !== 'admin' && club.coordinatorId !== userId) return null;

  const updatedClub: Club = {
    ...club,
    name: input.name ?? club.name,
    description: input.description ?? club.description,
    logoUrl: input.logoUrl ?? club.logoUrl,
    coverImageUrl: input.coverImageUrl ?? club.coverImageUrl,
    email: input.email ?? club.email,
    socialLinks: input.socialLinks ?? club.socialLinks,
    updatedAt: new Date().toISOString(),
  };

  memory.clubs.set(input.clubId, updatedClub);
  return updatedClub;
};
