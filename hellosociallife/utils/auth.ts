import { GetServerSidePropsContext, NextApiRequest, Redirect } from 'next';
import jwt from 'jsonwebtoken';
import { SessionUser } from '@/models/sessionUser';


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

export function getTokenFromCookies(req: NextApiRequest): string | null {
  const cookie = req.headers.cookie;
  if (!cookie) return null;

  const match = cookie.match(/auth_token=([^;]+)/);
  return match ? match[1] : null;
}

export function getUserFromRequest(req: NextApiRequest): SessionUser | null {
  const token = getTokenFromCookies(req);
  console.log("Headers:", req.headers.cookie);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded as SessionUser;
  } catch (err) {
    console.error('Invalid JWT:', err);
    return null;
  }
}
