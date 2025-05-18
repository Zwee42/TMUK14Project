import { createMocks } from 'node-mocks-http';
import mongoose from 'mongoose';

// ✅ Mocka mongoose-modellen först
const leanMock = jest.fn();
const sortMock = jest.fn(() => ({ lean: leanMock }));
const findMock = jest.fn(() => ({ sort: sortMock }));

jest.mock('@/models/DirectMessage', () => ({
  DirectMessageModel: {
    find: findMock,
  },
}));

// ✅ Mocka dbConnect innan handler importeras
jest.mock('@/lib/mongodb', () => jest.fn(() => Promise.resolve()));

// ✅ Importera handler EFTER mockningen
import handler from '@/pages/api/directmessages';

describe('/api/directMessages API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if userId or partnerId is missing', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'Missing userId or partnerId' });
  });

  it('returns 200 and messages between user and partner', async () => {
    const userId = new mongoose.Types.ObjectId();
    const partnerId = new mongoose.Types.ObjectId();
  
    const now = new Date().toISOString();
  
    const mockMessages = [
      { senderId: userId.toString(), receiverId: partnerId.toString(), content: 'Hello', createdAt: now },
      { senderId: partnerId.toString(), receiverId: userId.toString(), content: 'Hi!', createdAt: now },
    ];
  
    leanMock.mockResolvedValue(mockMessages);
  
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        userId: userId.toString(),
        partnerId: partnerId.toString(),
      },
    });
  
    await handler(req, res);
  
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual(mockMessages);
  });
  
  it('returns 405 for unsupported methods', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
