import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext"; 
import io, { Socket } from "socket.io-client";
import { 
  Box, Typography, Paper, TextField, IconButton, Avatar, Container, Divider 
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Message {
  _id?: string;
  sender: string | { _id: string; name?: string };
  content: string;
  createdAt: string;
}

const socket: Socket = io(import.meta.env.VITE_API_URL);
const Chat: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  // Safe Context Access
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Helper: Am I the sender?
  const isMe = (sender: string | { _id: string }) => {
    if (!user) return false;
    const senderId = typeof sender === 'object' ? sender._id : sender;
    return String(senderId) === String(user.id || (user as any)._id);
  };

  useEffect(() => {
    if (user) {
      socket.emit("join_room", user.id || (user as any)._id);
    }
  }, [user]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<Message[]>(`${import.meta.env.VITE_API_URL}/api/chat/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) { console.error(err); }
    };
    if (userId) fetchHistory();
  }, [userId]);

  useEffect(() => {
    const handleReceiveMessage = (data: Message) => {
      if (!user || !userId) return;
      const senderId = typeof data.sender === 'object' ? data.sender._id : data.sender;
      if (String(senderId) === String(userId) || String(senderId) === String(user.id || (user as any)._id)) {
        setMessages((prev) => [...prev, data]);
      }
    };
    socket.on("receive_message", handleReceiveMessage);
    return () => { socket.off("receive_message", handleReceiveMessage); };
  }, [userId, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage.trim() === "" || !user || !userId) return;
    const myId = user.id || (user as any)._id;
    const messageData = { senderId: myId, recipientId: userId, content: newMessage };
    socket.emit("send_message", messageData);
    setNewMessage(""); 
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, height: '85vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* --- CHAT HEADER --- */}
      <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', mb: 2, borderRadius: 2 }}>
        <IconButton component={Link} to="/inbox" sx={{ mr: 1 }}>
            <ArrowBackIcon />
        </IconButton>
        <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>C</Avatar>
        <Box>
            <Typography variant="h6" fontWeight="bold">Conversation</Typography>
            <Typography variant="caption" color="text.secondary">Real-time chat</Typography>
        </Box>
      </Paper>

      {/* --- MESSAGES AREA --- */}
      <Paper 
        elevation={0} 
        sx={{ 
            flexGrow: 1, 
            bgcolor: '#f0f2f5', // WhatsApp-like background
            p: 3, 
            overflowY: 'auto', 
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mb: 2,
            border: '1px solid #e0e0e0'
        }}
      >
        {messages.map((msg, index) => {
          const fromMe = isMe(msg.sender);
          return (
            <Box 
              key={index} 
              ref={index === messages.length - 1 ? scrollRef : null}
              sx={{ 
                  alignSelf: fromMe ? 'flex-end' : 'flex-start',
                  maxWidth: '70%',
              }}
            >
                <Paper 
                    elevation={1}
                    sx={{
                        p: 2,
                        bgcolor: fromMe ? 'primary.main' : 'white',
                        color: fromMe ? 'white' : 'text.primary',
                        borderRadius: 2,
                        borderTopRightRadius: fromMe ? 0 : 2,
                        borderTopLeftRadius: fromMe ? 2 : 0,
                    }}
                >
                    <Typography variant="body1">{msg.content}</Typography>
                    <Typography 
                        variant="caption" 
                        display="block" 
                        textAlign="right" 
                        sx={{ mt: 0.5, opacity: 0.8, fontSize: '0.7rem' }}
                    >
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                </Paper>
            </Box>
          );
        })}
      </Paper>

      {/* --- INPUT AREA --- */}
      <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 4 }}>
        <TextField
            fullWidth
            placeholder="Type a message..."
            variant="standard"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            InputProps={{ disableUnderline: true }}
            sx={{ px: 2 }}
        />
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <IconButton color="primary" onClick={sendMessage} disabled={!newMessage.trim()}>
            <SendIcon />
        </IconButton>
      </Paper>
    </Container>
  );
};

export default Chat;