import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import dbConnect from '@/lib/mongodb';
import {User} from '@/models/User';

import bcrypt from 'bcryptjs';

const SECRET_KEY = process.env.JWT_SECRET as string;  

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | { error: string }>
) {

  const loginUser = async () => {
    try {

      if (req.method !== 'POST') return res.status(405).end();

      await dbConnect();
    //  const emailOrUsername: string = req.body.emailOrUsername;
    //   console.log(req.body);
    //   const password: string = req.body['password'];
    

      const { emailOrUsername, password }: { emailOrUsername: string; password: string } = req.body;

      console.log(emailOrUsername);
      console.log(password);  
    
      const user = await User.findOne( emailOrUsername );
      if (!user) return res.status(400).json({ message: '111111111Invalid credentials' });
    
      console.log(user.id);


      
      const isMatch = await user.comparePassword(password);

      if (!isMatch) return res.status(400).json({ message: '22222222222Invalid credentials' });
    
      // Create a JWT with user data
      const token = jwt.sign({
        userId: user.id,
        username: user.name,
        email: user.email,
        avatar : user.image,
        bio : user.bio
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
