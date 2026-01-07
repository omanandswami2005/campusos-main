import { memory, type User } from '../../application/state/memory';
import { generateToken } from '../../infrastructure/auth/jwt';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const login = async (input: LoginInput): Promise<LoginResponse> => {
  const user = memory.users.get(input.email);
  if (!user || user.password !== input.password) {
    throw new Error('Invalid email or password');
  }
  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
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
