import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthUser {
  userId: string;
  username: string;
  avatar?: string;
}

export const getUserFromToken = (token?: string): AuthUser | null => {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
};

export const isAuthenticated = (token?: string): boolean => {
  return !!getUserFromToken(token);
};
