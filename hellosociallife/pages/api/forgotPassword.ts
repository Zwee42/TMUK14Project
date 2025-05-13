import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { sendResetEmail, transporter } from '@/lib/nodemailer';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  await dbConnect();

  const user = await UserModel.findOne({ email });

  if (!user) return res.status(404).json({ error: 'User not found' });

  const resetToken = uuidv4();
  const resetTokenExpire = Date.now() + 1000 * 60 * 60;

  user.resetToken = resetToken;
  user.resetTokenExpire = resetTokenExpire;

  console.log("Generated token:", resetToken);
  console.log("Before saving:", user);
  await user.save();
  console.log("After saving:", await UserModel.findOne({ email }));

  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

await sendResetEmail(email, resetUrl);

  // await transporter.sendMail({
  //   to: email,
  //   subject: 'Återställ ditt lösenord',
  //   html: `<p>Klicka på länken nedan för att återställa ditt lösenord:</p>
  //          <a href="${resetUrl}">${resetUrl}</a>`
  // });

  res.status(200).json({ message: 'Reset email sent' });
}
