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
  
  import handler from '@/pages/api/resetPassword';
  import { UserModel } from '@/models/User';
  import type { NextApiRequest, NextApiResponse } from 'next';
  
  // Mock-responsobjekt
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
  
    it('returnerar 405 om ej POST', async () => {
      const req = { method: 'GET' } as unknown as NextApiRequest;
      const res = mockRes();
  
      await handler(req, res);
  
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.end).toHaveBeenCalled();
    });
  
    it('returnerar 400 om token saknas eller lösenord saknas', async () => {
      const req = {
        method: 'POST',
        body: { token: '', password: '' },
      } as unknown as NextApiRequest;
  
      const res = mockRes();
  
      await handler(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token och lösenord krävs' });
    });
  
    it('returnerar 400 om token är ogiltig eller utgången', async () => {
      // Mockar findOne().select() -> null
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
  
      const req = {
        method: 'POST',
        body: { token: 'invalid-token', password: 'Valid123!' },
      } as unknown as NextApiRequest;
  
      const res = mockRes();
  
      await handler(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Ogiltig eller utgången token' });
    });
  
    it('returnerar 400 om lösenordet inte uppfyller kraven', async () => {
      const mockUser = {
        password: '',
        save: jest.fn(),
      };
  
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
  
      const req = {
        method: 'POST',
        body: { token: 'valid-token', password: 'short' },
      } as unknown as NextApiRequest;
  
      const res = mockRes();
  
      await handler(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Lösenordet uppfyller inte kraven' });
    });
  
    it('uppdaterar lösenordet om allt är korrekt', async () => {
      const mockUser = {
        password: '',
        resetToken: 'valid-token',
        resetTokenExpire: Date.now() + 10000,
        save: jest.fn(),
      };
  
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
  
      const req = {
        method: 'POST',
        body: { token: 'valid-token', password: 'Valid123!' },
      } as unknown as NextApiRequest;
  
      const res = mockRes();
  
      await handler(req, res);
  
      expect(mockUser.password).toBe('Valid123!');
      expect(mockUser.resetToken).toBeNull();
      expect(mockUser.resetTokenExpire).toBeNull();
      expect(mockUser.save).toHaveBeenCalled();
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Lösenordet har återställts' });
    });
  });
  