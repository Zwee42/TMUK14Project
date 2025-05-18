import mongoose, { Schema, Document } from 'mongoose';

export interface IDirectMessage extends Document {
  senderId: mongoose.Types.ObjectId;  // Avsändarens användar-ID
  receiverId: mongoose.Types.ObjectId;  // Mottagarens användar-ID
  senderUsername: string;  // Avsändarens användarnamn
  receiverUsername: string;  // Mottagarens användarnamn
  content: string;  // Meddelandets innehåll
  createdAt: Date;  // Tidpunkt då meddelandet skickades
}

const { ObjectId } = mongoose.Types;

const DirectMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: ObjectId, // Användarens ID för avsändaren
      required: true,
    },
    receiverId: {
      type: ObjectId, // Användarens ID för mottagaren
      required: true,
    },
    senderUsername: {
      type: String,
      required: true,
    },
    receiverUsername: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,  // hmmm
  }
);

// Skapa modellen för directMessage
export const DirectMessageModel = mongoose.models.DirectMessage || mongoose.model<IDirectMessage>('DirectMessage', DirectMessageSchema);
