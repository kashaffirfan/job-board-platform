import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AuthContext, { User } from "../context/AuthContext";
import io, { Socket } from "socket.io-client";

// Define the Message Interface
interface Message {
  _id?: string;
  sender: string | { _id: string }; // Sender can be populated (object) or unpopulated (string ID)
  recipient?: string;
  content: string;
  createdAt: string;
}

// Initialize Socket outside component to prevent reconnection loops
const socket: Socket = io("http://localhost:5000");

const Chat: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  // Cast context to the correct type
  const { user } = useContext(AuthContext) as { user: User | null };
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Helper: Safe ID Comparison
  const isMe = (sender: string | { _id: string }) => {
    if (!user) return false;
    const senderId = typeof sender === 'object' ? sender._id : sender;
    const myId = user.id || user._id;
    return String(senderId) === String(myId);
  };

  // 1. Join Room
  useEffect(() => {
    if (user) {
      socket.emit("join_room", user.id || user._id);
    }
  }, [user]);

  // 2. Load History
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<Message[]>(`http://localhost:5000/api/chat/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (userId) fetchHistory();
  }, [userId]);

  // 3. Listen for Real-Time Messages
  useEffect(() => {
    const handleReceiveMessage = (data: Message) => {
      if (!user || !userId) return;

      const senderId = typeof data.sender === 'object' ? data.sender._id : data.sender;
      
      // Check if message belongs to this specific conversation
      if (String(senderId) === String(userId) || String(senderId) === String(user.id || user._id)) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [userId, user]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage.trim() === "" || !user || !userId) return;

    const myId = user.id || user._id;

    const messageData = {
      senderId: myId,
      recipientId: userId,
      content: newMessage,
    };

    socket.emit("send_message", messageData);
    setNewMessage(""); 
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 border rounded-lg shadow-lg bg-white overflow-hidden">
      <div className="bg-blue-600 p-4 text-white font-bold text-lg">
        Chat Conversation
      </div>

      <div className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {messages.map((msg, index) => {
          const fromMe = isMe(msg.sender);

          return (
            <div 
              key={index} 
              // Only attach ref to the last message for auto-scroll
              ref={index === messages.length - 1 ? scrollRef : null}
              className={`flex ${fromMe ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-xs px-4 py-2 rounded-lg text-sm shadow 
                  ${fromMe 
                    ? "bg-blue-600 text-white rounded-br-none" 
                    : "bg-white text-gray-800 rounded-bl-none border" 
                  }`}
              >
                <p>{msg.content}</p>
                <span className={`text-[10px] block mt-1 text-right ${fromMe ? "text-blue-100" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t flex gap-2 bg-white">
        <input 
          type="text" 
          placeholder="Type a message..." 
          className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button 
          onClick={sendMessage}
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 font-bold"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;