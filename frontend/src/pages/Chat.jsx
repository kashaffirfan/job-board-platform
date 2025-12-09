import { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import io from "socket.io-client";

// Ensure this matches your backend URL
const socket = io.connect("http://localhost:5000");

const Chat = () => {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  // 1. Join Room
  useEffect(() => {
    // Only join if we have a user ID and the socket is open
    if (user && user.id) {
      console.log("🔌 Joining Room:", user.id);
      socket.emit("join_room", user.id);
    }
  }, [user]);

  // 2. Fetch History
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/chat/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
        console.log("📜 Chat history loaded:", res.data);
      } catch (err) {
        console.error("❌ Error loading chat:", err);
      }
    };
    fetchHistory();
  }, [userId]);

  // 3. Listen for Messages
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      console.log("📩 Message received via Socket:", data);
      
      // Fix: Ensure we compare Strings to Strings to avoid ID mismatch issues
      const isFromContact = data.sender === userId || data.sender._id === userId;
      const isFromMe = data.sender === user.id || data.sender._id === user.id;

      if (isFromContact || isFromMe) {
        setMessages((prev) => [...prev, data]);
      } else {
        console.log("⚠️ Message ignored (belongs to another chat)");
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => socket.off("receive_message", handleReceiveMessage);
  }, [userId, user]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      senderId: user.id,
      recipientId: userId,
      content: newMessage,
    };

    console.log("📤 Sending message:", messageData);
    socket.emit("send_message", messageData);
    setNewMessage(""); 
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 border rounded-lg shadow-lg bg-white overflow-hidden">
      <div className="bg-blue-600 p-4 text-white font-bold text-lg">Chat</div>
      <div className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} ref={scrollRef} className={`flex ${msg.sender === user.id || msg.sender._id === user.id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg text-sm ${msg.sender === user.id || msg.sender._id === user.id ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-800"}`}>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex gap-2 bg-white">
        <input 
          type="text" 
          className="flex-1 p-2 border rounded-full"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold">Send</button>
      </div>
    </div>
  );
};

export default Chat;