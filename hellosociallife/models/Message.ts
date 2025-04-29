import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  userId?: mongoose.Types.ObjectId;
  username: string;
  content: string;
  createdAt: Date;
}

const { ObjectId } = mongoose.Types;

const MessageSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId, // Keep as ObjectId
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MessageModel = mongoose.models.Message || mongoose.model('Message', MessageSchema);
