// pages/api/change-email.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';
import { getUserFromRequest, signCookie } from '@/utils/auth';
import { serialize } from 'cookie';
import bcrypt from 'bcryptjs';
import { UserModel } from '@/models/User';

type Data = {
  message: string;
  user?: {
    email: string;
  };
};



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
 console.log('Request body:', req.body);
  const sessionUser = await getUserFromRequest(req);
  if (!sessionUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { email: newEmail, currentPassword } = req.body;

  if (!newEmail || !currentPassword) {
    console.log('Missing fields:', {
    emailProvided: !!newEmail,
    passwordProvided: !!currentPassword
  });
    return res.status(400).json({ message: 'New email and current password are required' });
  }

  try {
    await dbConnect();

    const user = await User.findById(sessionUser.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(user);
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Validate new email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if email is already in use
    const emailExists = await User.findOne( newEmail  );
    if (emailExists) {
      return res.status(409).json({ message: 'Email already in use' });
    }

   // ----- RÄTT KOD -----
    const updatedUser = await User.findOneAndUpdate(
        sessionUser.userId,
        { email : newEmail },
        { new: true  }
    );
    if (!updatedUser) {
         return res.status(404).json({ message: 'User update failed' });
    }

    console.log(updatedUser);
    signCookie (updatedUser, res);
   

    return res.status(200).json({
      message: 'Email updated successfully',
      
    });
  } catch (error) {
    console.error('Email change error:', error);
    return res.status(500).json({ message: 'Failed to update email' });
  }
}