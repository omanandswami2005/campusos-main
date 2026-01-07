import { JWT_SECRET } from '../state/memory';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  collegeId: string;
  exp: number;
}

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const [header, body, sig] = token.split('.');
    if (!header || !body || !sig) return null;

    const expectedSig = Buffer.from(JWT_SECRET).toString('base64').slice(0, 16);
    if (sig !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64').toString()) as TokenPayload;

    // Check expiration
    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
};
