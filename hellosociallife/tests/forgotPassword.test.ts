// 👇 Mockar Mongoose-modellen och andra beroenden först!
jest.mock('@/models/User', () => ({
    __esModule: true,
    UserModel: {
      findOne: jest.fn()
    }
  }));
  
  jest.mock('@/lib/mongodb', () => ({
    __esModule: true,
    default: jest.fn()
  }));
  
  jest.mock('@/lib/nodemailer', () => ({
    __esModule: true,
    sendResetEmail: jest.fn()
  }));
  
  import handler from '@/pages/api/forgotPassword';
  import { UserModel } from '@/models/User';
  import { sendResetEmail } from '@/lib/nodemailer';
  import type { NextApiRequest, NextApiResponse } from 'next';
  
  // Mock för res-objektet
  const mockRes = (): NextApiResponse => {
    const res: Partial<NextApiResponse> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };
    return res as NextApiResponse;
  };
  
  describe('Reset Password API', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('returnerar 404 om användare inte finns', async () => {
      // 🔧 Mocka att användaren inte hittas
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
  
      const req = {
        method: 'POST',
        body: { email: 'notfound@example.com' }
      } as unknown as NextApiRequest;
  
      const res = mockRes();
  
      await handler(req, res);
  
      // ✅ Kontrollera att rätt anrop gjorts
      console.log('Mock calls:', (UserModel.findOne as jest.Mock).mock.calls);
  
      expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'notfound@example.com' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  
    it('genererar token, sparar användare och skickar mail', async () => {
      const mockUser = {
        email: 'user@example.com',
        resetToken: null,
        resetTokenExpire: null,
        save: jest.fn().mockResolvedValue(true),
      };
  
      (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);
  
      const req = {
        method: 'POST',
        body: { email: 'user@example.com' }
      } as unknown as NextApiRequest;
  
      const res = mockRes();
  
      await handler(req, res);
  
      expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(mockUser.save).toHaveBeenCalled();
  
      expect(typeof mockUser.resetToken).toBe('string');
      expect(typeof mockUser.resetTokenExpire).toBe('number');
  
      expect(sendResetEmail).toHaveBeenCalledWith(
        'user@example.com',
        expect.stringContaining('http://localhost:3000/reset-password?token=')
      );
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Reset email sent' });
    });
  
    it('returnerar 405 om ej POST', async () => {
      const req = {
        method: 'GET'
      } as unknown as NextApiRequest;
  
      const res = mockRes();
  
      await handler(req, res);
  
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.end).toHaveBeenCalled();
    });
  });
  