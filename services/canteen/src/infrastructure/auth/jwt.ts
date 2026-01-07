import { JWT_SECRET } from '../../application/state/memory';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// Simple JWT-like token (not cryptographic, for demo)
export const generateToken = (payload: TokenPayload): string => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) })
  ).toString('base64url');
  const signature = Buffer.from(JWT_SECRET).toString('base64url').substring(0, 10);
  return `${header}.${body}.${signature}`;
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const [, body] = token.split('.');
    if (!body) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    return { userId: payload.userId, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
};
