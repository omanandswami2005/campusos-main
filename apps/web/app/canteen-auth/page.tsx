'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MessVotingPoll } from '@campus-os/types';
import { AppShell, Button } from '@campus-os/ui';
import { CanteenClient, HttpClient } from '@campus-os/api-client';

const apiBase = process.env.NEXT_PUBLIC_CANTEEN_API ?? 'http://localhost:4000';
const collegeId = 'college-a';

interface AuthUser {
  token: string;
  user: { id: string; name: string; email: string; role: string };
}

export default function CanteenAuthPage() {
  const client = useMemo(() => new CanteenClient(new HttpClient({ baseUrl: apiBase })), []);
  const [auth, setAuth] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState('demo@college.edu');
  const [password, setPassword] = useState('demo123');
  const [polls, setPolls] = useState<MessVotingPoll[]>([]);
  const [userVote, setUserVote] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await client.login({ email, password });
      client.setToken(result.token);
      setAuth(result);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    }
  };

  useEffect(() => {
    if (!auth) return;
    const load = async () => {
      try {
        const data = await client.listPolls(collegeId);
        setPolls(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load polls');
      }
    };
    load();
  }, [auth, client]);

  const handleVote = async (pollId: string, option: string) => {
    try {
      setError(null);
      const updated = await client.vote({ pollId, option });
      setPolls(polls.map((p) => (p.id === pollId ? updated : p)));
      setUserVote({ ...userVote, [pollId]: option });
    } catch (err: any) {
      setError(err?.message || 'Vote failed');
    }
  };

  if (!auth) {
    return (
      <AppShell header={<div className="font-semibold">Canteen Login</div>}>
        <div className="space-y-4 max-w-md">
          <p className="text-gray-700 text-sm">
            Demo credentials: demo@college.edu / demo123 (student) or admin@college.edu / admin123 (admin)
          </p>
          {error && <div className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</div>}
          <form onSubmit={login} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
            <Button className="w-full">Login</Button>
          </form>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell header={<div className="font-semibold">Canteen - {auth.user.name}</div>}>
      <div className="space-y-4">
        <div className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-800">
          Logged in as {auth.user.email} ({auth.user.role})
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Mess Menu Voting</h2>
          {error && <div className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</div>}
          {polls.length === 0 ? (
            <div className="text-sm text-gray-600">No active polls.</div>
          ) : (
            polls.map((poll) => (
              <div key={poll.id} className="rounded border bg-white p-4 space-y-2">
                <div className="font-semibold">{poll.title}</div>
                <div className="space-y-1">
                  {poll.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleVote(poll.id, option)}
                      className={`w-full text-left px-3 py-2 rounded border text-sm transition ${
                        userVote[poll.id] === option
                          ? 'bg-blue-100 border-blue-600'
                          : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {option} ({poll.votes[option] || 0} votes)
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
