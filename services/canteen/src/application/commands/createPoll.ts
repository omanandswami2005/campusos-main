import { randomUUID } from 'node:crypto';
import { memory } from '../../application/state/memory';
import type { MessVotingPoll } from '@campus-os/types';

export interface CreatePollInput {
  collegeId: string;
  title: string;
  options: string[];
}

export const createPoll = async (input: CreatePollInput): Promise<MessVotingPoll> => {
  const id = randomUUID();
  const now = new Date();
  const poll: MessVotingPoll = {
    id,
    collegeId: input.collegeId,
    title: input.title,
    options: input.options,
    votes: Object.fromEntries(input.options.map((o) => [o, 0])),
    active: true,
    startDate: now.toISOString(),
    endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  memory.polls.set(id, poll);
  return poll;
};
