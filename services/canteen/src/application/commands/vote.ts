import { memory } from '../../application/state/memory';

export interface VoteInput {
  userId: string;
  pollId: string;
  option: string;
}

export const vote = async (input: VoteInput) => {
  const poll = memory.polls.get(input.pollId);
  if (!poll) throw new Error('Poll not found');
  if (!poll.active) throw new Error('Poll is closed');
  if (!poll.options.includes(input.option)) throw new Error('Invalid option');

  const voteKey = `${input.userId}:${input.pollId}`;
  const existingVote = Array.from(memory.userVotes.values()).find(
    (v) => v.userId === input.userId && v.pollId === input.pollId
  );

  if (existingVote) {
    poll.votes[existingVote.option] -= 1;
  }

  poll.votes[input.option] += 1;
  memory.userVotes.set(voteKey, input);
  return poll;
};
