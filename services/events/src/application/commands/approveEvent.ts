import { memory, ExtendedEventItem, createNotification } from '../state/memory';

interface ApproveEventInput {
  eventId: string;
  adminId: string;
  approved: boolean;
  rejectionReason?: string;
}

export const approveEvent = (input: ApproveEventInput): ExtendedEventItem | null => {
  const event = memory.events.get(input.eventId);
  if (!event) return null;

  // Only admin can approve/reject events
  const admin = memory.users.get(input.adminId);
  if (!admin || admin.role !== 'admin') return null;

  // Can only approve events that are pending approval
  if (event.approvalStatus !== 'pending') return null;

  const now = new Date().toISOString();
  const updatedEvent: ExtendedEventItem = {
    ...event,
    approvalStatus: input.approved ? 'approved' : 'rejected',
    status: input.approved ? 'published' : 'draft',
    approvedBy: input.approved ? input.adminId : undefined,
    approvedAt: input.approved ? now : undefined,
    rejectionReason: !input.approved ? input.rejectionReason : undefined,
    updatedAt: now,
  };

  memory.events.set(input.eventId, updatedEvent);

  // Notify the event organizer
  createNotification({
    userId: event.organizerId,
    type: 'event_update',
    title: input.approved ? 'Event Approved!' : 'Event Rejected',
    message: input.approved
      ? `Your event "${event.title}" has been approved and is now published.`
      : `Your event "${event.title}" was rejected. Reason: ${input.rejectionReason || 'Not specified'}`,
    eventId: event.id,
  });

  return updatedEvent;
};

export const submitEventForApproval = (
  eventId: string,
  userId: string
): ExtendedEventItem | null => {
  const event = memory.events.get(eventId);
  if (!event) return null;

  // Only the organizer can submit for approval
  if (event.organizerId !== userId) {
    const user = memory.users.get(userId);
    if (!user || user.role !== 'admin') return null;
  }

  // Can only submit draft events
  if (event.status !== 'draft') return null;

  const now = new Date().toISOString();
  const updatedEvent: ExtendedEventItem = {
    ...event,
    status: 'pending_approval',
    approvalStatus: 'pending',
    updatedAt: now,
  };

  memory.events.set(eventId, updatedEvent);

  // Notify admins
  const admins = Array.from(memory.users.values()).filter((u) => u.role === 'admin');
  admins.forEach((admin) => {
    createNotification({
      userId: admin.id,
      type: 'event_update',
      title: 'Event Pending Approval',
      message: `Event "${event.title}" has been submitted for approval.`,
      eventId: event.id,
    });
  });

  return updatedEvent;
};
