// pages/api/resetPassword.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token och lösenord krävs' });
  }

  await dbConnect();

  const user = await UserModel.findOne({
    resetToken: token,
    resetTokenExpire: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    return res.status(400).json({ error: 'Ogiltig eller utgången token' });
  }
  
  // Validera lösenordet manuellt om du vill
  const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
  if (!isValid) {
    return res.status(400).json({ error: 'Lösenordet uppfyller inte kraven' });
  }

  user.password = password;
  user.resetToken = null;
  user.resetTokenExpire = null;
  console.log('Sparar användare...');
  await user.save();
  console.log(' Användare sparad');
  return res.status(200).json({ message: 'Lösenordet har återställts' });
}
