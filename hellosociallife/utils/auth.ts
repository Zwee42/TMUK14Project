import { GetServerSidePropsContext, NextApiRequest, Redirect } from 'next';
import jwt from 'jsonwebtoken';
import { SessionUser } from '@/models/sessionUser';
import { execOnce, NextApiResponse } from 'next/dist/shared/lib/utils';
import { User } from '@/models/User';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET!;
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
export function signCookie (user: User, res: NextApiResponse ) {
  const newToken = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          avtar: user.image,
          bio: user.bio,
          email: user.newEmail,
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      console.log ("Token för changed mail",newToken);
  
      // Set new cookie
      res.setHeader(
        'Set-Cookie',
        serialize('auth_token', newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60, // 1 hour
        })
      );
  const updateToken = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          avatar: user.image,
          bio: user.bio,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      // Sätt cookie med ny token
      res.setHeader(
        'Set-Cookie',
        serialize('auth_token', updateToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60,
        })
      );

      const token = jwt.sign({
            userId: user.id,
            username: user.username,
            email: user.email,
            avatar: user.image,
            bio: user.bio
          }, JWT_SECRET, { expiresIn: '1h' });
      
          // Set the token in an HTTP-only cookie
          res.setHeader('Set-Cookie', serialize('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 3600,
          }));
}