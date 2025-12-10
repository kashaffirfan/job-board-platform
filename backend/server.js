const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message'); 

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});


io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. User joins their own room (based on their User ID)
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  // 2. Handling Send Message
    socket.on('send_message', async (data) => {
    const { senderId, recipientId, content } = data; 

    try {
      const newMessage = await Message.create({
        sender: senderId, 
        recipient: recipientId,
        content
      });
      

      // Emit to Recipient (Real-time)
      io.to(recipientId).emit('receive_message', newMessage);
      
      // Emit back to Sender (so their UI updates too)
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