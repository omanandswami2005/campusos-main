import { useEffect, useState } from 'react';
import type { MessVotingPoll } from '@campus-os/types';
import { Button } from '@campus-os/ui';
import { CanteenClient, HttpClient } from '@campus-os/api-client';

const apiBase = import.meta.env.VITE_CANTEEN_API ?? 'http://localhost:4000';
const collegeId = 'college-a';

interface AuthUser {
  token: string;
  user: { id: string; name: string; email: string; role: string };
}

export function CanteenAuthView() {
  const [client] = useState(() => new CanteenClient(new HttpClient({ baseUrl: apiBase })));
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
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Canteen Login</h2>
        <div className="space-y-3 max-w-sm">
          <p className="text-xs text-gray-600">
            Demo: demo@college.edu / demo123 or admin@college.edu / admin123
          </p>
          {error && <div className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">{error}</div>}
          <form onSubmit={login} className="space-y-2">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-2 py-1 text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-2 py-1 text-sm"
            />
            <Button className="w-full">Login</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">{auth.user.name}</h2>
      <div className="text-xs text-gray-600 mb-4">
        {auth.user.email} ({auth.user.role})
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-sm">Mess Menu Voting</h3>
        {error && <div className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">{error}</div>}
        {polls.length === 0 ? (
          <div className="text-xs text-gray-600">No active polls.</div>
        ) : (
          polls.map((poll) => (
            <div key={poll.id} className="rounded border bg-white p-2 space-y-1">
              <div className="text-xs font-semibold">{poll.title}</div>
              {poll.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleVote(poll.id, option)}
                  className={`w-full text-left px-2 py-1 rounded border text-xs transition ${
                    userVote[poll.id] === option
                      ? 'bg-blue-100 border-blue-600'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  {option} ({poll.votes[option] || 0})
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
