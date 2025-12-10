import { Response } from 'express';
import Message from '../models/Message';
import { AuthRequest } from '../middleware/authMiddleware';
import { IUser } from '../models/User';

interface Partner {
  _id: string;
  name: string;
  email: string;
  lastMessage: string;
  date: Date;
}

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const myId = req.user._id; // In TS, use _id from the document
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: otherUserId },
        { sender: otherUserId, recipient: myId }
      ]
    }).sort({ createdAt: 1 }); 

    return res.json(messages);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    const myId = req.user._id.toString();

    // 1. Find all messages involving me
    const messages = await Message.find({
      $or: [{ sender: myId }, { recipient: myId }]
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .sort({ createdAt: -1 });

    // 2. Filter for unique partners
    const partnersMap = new Map<string, Partner>();

    messages.forEach((msg: any) => {
      // Handle cases where populate might fail (deleted users)
      if (!msg.sender || !msg.recipient) return;

      const senderId = msg.sender._id.toString();
      
      // Determine who the "other person" is
      // If I am the sender, the partner is the recipient.
      const partner = senderId === myId ? msg.recipient : msg.sender;
      const partnerId = partner._id.toString();

      // Only add to Map if not already present (since we sorted by date desc, first one is latest)
      if (!partnersMap.has(partnerId)) {
        partnersMap.set(partnerId, {
          _id: partner._id,
          name: partner.name,
          email: partner.email,
          lastMessage: msg.content,
          date: msg.createdAt
        });
      }
    });

    const conversations = Array.from(partnersMap.values());
    return res.json(conversations);

  } catch (error: any) {
    console.error("Inbox Error:", error);
    return res.status(500).json({ message: error.message });
  }
};