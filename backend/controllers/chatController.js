const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  try {
    const myId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: otherUserId },
        { sender: otherUserId, recipient: myId }
      ]
    }).sort({ createdAt: 1 }); 

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const myId = req.user.id;

    // 1. Find all messages involving me
    const messages = await Message.find({
      $or: [{ sender: myId }, { recipient: myId }]
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .sort({ createdAt: -1 });

    // 2. Filter for unique partners
    const partnersMap = new Map();

    messages.forEach(msg => {
      // Handle cases where populate might fail (deleted users)
      if (!msg.sender || !msg.recipient) return;

      const senderId = msg.sender._id.toString();
      const recipientId = msg.recipient._id.toString();
      
      // Determine who the "other person" is
      const partner = senderId === myId ? msg.recipient : msg.sender;
      const partnerId = partner._id.toString();

      // Only add to Map if not already present
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
    res.json(conversations);

  } catch (error) {
    console.error("Inbox Error:", error);
    res.status(500).json({ message: error.message });
  }
};