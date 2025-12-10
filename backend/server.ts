import express, { Application } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server, Socket } from 'socket.io';
import Message from './models/Message'; 

// --- FIXED: Import routes using 'import' instead of 'require' ---
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import chatRoutes from './routes/chatRoutes';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

// --- FIXED: Use the imported route variables ---
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chat', chatRoutes);

// Database Connection
const mongoURI = process.env.MONGO_URI as string;

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error(err));

// Socket.io Setup
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
      const newMessage = await Message.create({
        sender: senderId, 
        recipient: recipientId,
        content
      });
      
      io.to(recipientId).emit('receive_message', newMessage);
      io.to(senderId).emit('receive_message', newMessage);
      
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