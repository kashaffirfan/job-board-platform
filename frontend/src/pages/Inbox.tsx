import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  Box, Typography, Paper, Avatar, Stack, Container, Divider, Chip 
} from "@mui/material";
import ChatIcon from '@mui/icons-material/Chat';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface Conversation {
  _id: string;
  name: string;
  lastMessage: string;
  date: string;
}

const Inbox: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<Conversation[]>(`${import.meta.env.VITE_API_URL}/api/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConversations();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 10 }}>
      {/* HEADER */}
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: 2, color: 'white', display: 'flex' }}>
            <ChatIcon />
        </Box>
        <Typography variant="h4" fontWeight="800" color="text.primary">
          Messages
        </Typography>
        <Chip label={conversations.length} color="primary" size="small" />
      </Stack>
      
      {/* MESSAGE LIST CARD */}
      <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        {conversations.length > 0 ? (
          conversations.map((chat, index) => (
            <div key={chat._id}>
                {/* We use a standard Link wrapper with Box to avoid TS errors.
                   This acts like a button but is typesafe.
                */}
                <Box 
                    component={Link} 
                    to={`/chat/${chat._id}`}
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 3, 
                        textDecoration: 'none', 
                        color: 'inherit',
                        transition: '0.2s',
                        '&:hover': { bgcolor: '#F9FAFB' } // Tailwind 'gray-50' equivalent
                    }}
                >
                    {/* AVATAR */}
                    <Avatar 
                        sx={{ 
                            width: 56, height: 56, mr: 3, 
                            bgcolor: 'secondary.main', // Teal color for avatar
                            fontWeight: 'bold', fontSize: '1.2rem'
                        }}
                    >
                        {chat.name.charAt(0).toUpperCase()}
                    </Avatar>

                    {/* TEXT CONTENT */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={0.5}>
                            <Typography variant="h6" fontWeight="bold" noWrap>
                                {chat.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight="medium">
                                {new Date(chat.date).toLocaleDateString()}
                            </Typography>
                        </Stack>
                        
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            noWrap 
                            sx={{ maxWidth: '90%' }}
                        >
                            {chat.lastMessage}
                        </Typography>
                    </Box>

                    {/* ARROW ICON */}
                    <ArrowForwardIosIcon sx={{ fontSize: 16, color: 'text.disabled', ml: 2 }} />
                </Box>
                
                {/* DIVIDER (Except for last item) */}
                {index < conversations.length - 1 && <Divider />}
            </div>
          ))
        ) : (
          // EMPTY STATE
          <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <Box 
                sx={{ 
                    display: 'inline-flex', p: 3, borderRadius: '50%', 
                    bgcolor: '#F3F4F6', mb: 2 
                }}
            >
                <ChatIcon sx={{ fontSize: 40, color: '#9CA3AF' }} />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No messages yet
            </Typography>
            <Typography variant="body2" color="text.disabled">
              When you connect with clients or freelancers, your chats will appear here.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Inbox;