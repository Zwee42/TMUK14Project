import { useEffect, useState } from 'react';
import { AuthUser, getUserFromToken } from '@/lib/auth';

export default function useAuth(): AuthUser | null {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = getUserFromToken(token);
      if (decoded) setUser(decoded);
    }
  }, []);

  return user;
}
