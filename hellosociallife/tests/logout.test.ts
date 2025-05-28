import handler from '@/pages/api/logout';
import type { NextApiRequest, NextApiResponse } from 'next';

describe('Logout API', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let setHeaderMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    setHeaderMock = jest.fn();

    req = {};
    res = {
      status: statusMock,
      json: jsonMock,
      setHeader: setHeaderMock,
    };
  });

  it('clears the auth_token cookie and returns success message', () => {
    handler(req as NextApiRequest, res as NextApiResponse);

    expect(setHeaderMock).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('auth_token=') // cookie name cleared
    );

    // Check cookie options for expiry
    expect(setHeaderMock.mock.calls[0][1]).toContain('Max-Age=0');
    expect(setHeaderMock.mock.calls[0][1]).toContain('HttpOnly');
    expect(setHeaderMock.mock.calls[0][1]).toContain('Path=/');
    expect(setHeaderMock.mock.calls[0][1]).toContain('SameSite=Strict');

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Logged out successfully' });
  });
});
