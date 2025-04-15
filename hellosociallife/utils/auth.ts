import { GetServerSidePropsContext, Redirect } from 'next';
import jwt from 'jsonwebtoken';

export async function requireAuth(ctx: GetServerSidePropsContext, redirectTo = '/') {
  const { req } = ctx;
  const cookie = req.headers.cookie || '';

  const authToken = cookie
    .split(';')
    .find((cookie) => cookie.trim().startsWith('auth_token='));

  if (!authToken) {
    return {
      redirect: {
        destination: redirectTo,
        permanent: false,
      } as Redirect,
    };
  }

  const token = authToken.split('=')[1];

  try {
    const decodedToken = jwt.decode(token);

    if (!decodedToken) throw new Error('Invalid token');

    return { props: { user: decodedToken } };
  } catch (error) {
    console.error('Error decoding token:', error);
    return {
      redirect: {
        destination: redirectTo,
        permanent: false,
      } as Redirect,
    };
  }
}

export async function hasSessionClient(): Promise<boolean> {
  try {
    const res = await fetch('/api/session', {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return data.isLoggedIn;
    } else
      return false;
  } catch (error) {
    return false;
  }
}