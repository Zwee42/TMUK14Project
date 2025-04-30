import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { email, username, password } = req.body;

    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if email or username already exists
    const existingEmail = await User.findOne( email );
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const existingUsername = await User.findOne( username );
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    // Hash password

    // Create new user using your User class
    const user = new User(
      username,
      email,
      password, // Using the hashed password
      undefined, // bio
      undefined  // image
    );

    // Save the user to database
    await user.save();

    // Return success response without sensitive data
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        username: username // Note: In your User class, name is used for username
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

