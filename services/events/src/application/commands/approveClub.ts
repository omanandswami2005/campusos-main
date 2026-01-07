import { memory, Club, createNotification } from '../state/memory';

interface ApproveClubInput {
  clubId: string;
  adminId: string;
  approved: boolean;
  rejectionReason?: string;
}

export const approveClub = (input: ApproveClubInput): Club | null => {
  const club = memory.clubs.get(input.clubId);
  if (!club) return null;

  // Only admin can approve/reject
  const admin = memory.users.get(input.adminId);
  if (!admin || admin.role !== 'admin') return null;

  const now = new Date().toISOString();
  const updatedClub: Club = {
    ...club,
    status: input.approved ? 'approved' : 'rejected',
    updatedAt: now,
  };

  memory.clubs.set(input.clubId, updatedClub);

  // Update coordinator's clubIds if approved
  if (input.approved) {
    const coordinator = memory.users.get(club.coordinatorId);
    if (coordinator) {
      const updatedCoordinator = {
        ...coordinator,
        role: 'coordinator' as const,
        clubIds: [...(coordinator.clubIds || []), club.id],
      };
      memory.users.set(coordinator.id, updatedCoordinator);
    }
  }

  // Notify the coordinator
  createNotification({
    userId: club.coordinatorId,
    type: input.approved ? 'club_approved' : 'club_rejected',
    title: input.approved ? 'Club Approved!' : 'Club Registration Rejected',
    message: input.approved
      ? `Your club "${club.name}" has been approved. You can now create events!`
      : `Your club "${club.name}" registration was rejected. Reason: ${input.rejectionReason || 'Not specified'}`,
    clubId: club.id,
  });

  return updatedClub;
};

export const suspendClub = (clubId: string, adminId: string): Club | null => {
  const club = memory.clubs.get(clubId);
  if (!club) return null;

  const admin = memory.users.get(adminId);
  if (!admin || admin.role !== 'admin') return null;

  const updatedClub: Club = {
    ...club,
    status: 'suspended',
    updatedAt: new Date().toISOString(),
  };

  memory.clubs.set(clubId, updatedClub);

  // Notify the coordinator
  createNotification({
    userId: club.coordinatorId,
    type: 'club_rejected',
    title: 'Club Suspended',
    message: `Your club "${club.name}" has been suspended by the administrator.`,
    clubId: club.id,
  });

  return updatedClub;
};
