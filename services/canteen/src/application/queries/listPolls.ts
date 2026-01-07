import { memory } from '../../application/state/memory';

export const listPolls = async (collegeId: string) => {
  return Array.from(memory.polls.values()).filter((p) => p.collegeId === collegeId);
};
