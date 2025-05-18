import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, // Din Gmail-adress
    pass: process.env.EMAIL_PASS  // App-lösenord från Google
  }
});

export async function sendResetEmail(email: string, resetUrl: string) {
  try {
    const info = await transporter.sendMail({
      from: 'noreply.'+process.env.EMAIL_USER,
      to: email,
      subject: 'Återställ ditt lösenord',
      html: `<p>Klicka på länken nedan för att återställa ditt lösenord:</p>
             <a href="${resetUrl}">${resetUrl}</a>`,
    });

    console.log('✅ E-post skickad:', info.response);
  } catch (error) {
    console.error('❌ Fel vid e-postutskick:', error);
  }
}