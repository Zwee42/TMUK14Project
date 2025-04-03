import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const SECRET_KEY = process.env.SECRET_KEY as string;  

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | { error: string }>
) {
  const code = req.query.code as string;

  // Handle missing or invalid code
  if (!code) {
    return res.status(400).json({ error: 'Authorization code is missing' });
  }

  const loginUser = async () => {
    try {

      //TODO implement the loginUser function

      const userData: any = null;

      // Create a JWT with user data
      const token = jwt.sign({
        userId: userData.id,
        username: userData.username,
        avatar: userData.avatar,
        global_name: userData.global_name,
        discriminator: userData.discriminator,
      }, SECRET_KEY, { expiresIn: '1h' });

      // Set the JWT as a cookie
      res.setHeader('Set-Cookie', serialize('auth_token', token, {
        httpOnly: true, // Prevent client-side JavaScript from accessing it
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        sameSite: 'strict', // Prevent CSRF attacks
        path: '/', // Available across the entire site
        maxAge: 3600, // 1 hour in seconds
      }));

      res.status(200).json({ message: 'Logged in successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  };

  // Call the fetchToken function and wait for it to finish
  await loginUser();



}
