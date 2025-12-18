import express, { Application } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server, Socket } from 'socket.io';
import Message from './models/Message'; 
import Notification from './models/Notification';
import User from './models/User'; 

import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import chatRoutes from './routes/chatRoutes';
import notificationRoutes from './routes/notificationRoutes';
import aiRoutes from './routes/aiRoutes';

import path from 'path';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Database Connection
const mongoURI = process.env.MONGO_URI as string;

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error(err));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket: Socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('join_room', (userId: string) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  socket.on('send_message', async (data: { senderId: string, recipientId: string, content: string }) => {
    const { senderId, recipientId, content } = data; 

    try {
      // 1. Save Message to Database
      const newMessage = await Message.create({
        sender: senderId, 
        recipient: recipientId,
        content
      });
      
      // 2. Emit Real-Time Message to Frontend
      io.to(recipientId).emit('receive_message', newMessage);
      io.to(senderId).emit('receive_message', newMessage);

      // 3. Create Notification for the Recipient
      // We look up the sender's name first to make the notification nice
      const senderUser = await User.findById(senderId);
      
      if (senderUser) {
        await Notification.create({
          recipient: recipientId,
          sender: senderId,
          type: 'new_message',
          message: `New message from ${senderUser.name}`,
          link: `/chat/${senderId}`,
          read: false
        });
      }

    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));