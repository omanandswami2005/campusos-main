import { randomUUID } from 'node:crypto';
import { memory, findUserByEmail, JWT_SECRET } from '../state/memory';

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    collegeId: string;
    role: string;
  };
}

// Simple base64 JWT (demo only)
const createToken = (payload: object): string => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const sig = Buffer.from(JWT_SECRET).toString('base64').slice(0, 16);
  return `${header}.${body}.${sig}`;
};

export const login = async (input: LoginInput): Promise<LoginResult> => {
  const user = findUserByEmail(input.email);
  if (!user || user.password !== input.password) {
    throw new Error('Invalid credentials');
  }

  const token = createToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    collegeId: user.collegeId,
    exp: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      collegeId: user.collegeId,
      role: user.role,
    },
  };
};
