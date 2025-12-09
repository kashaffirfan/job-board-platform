import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Inbox = () => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/chat/conversations", {
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
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">My Messages</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {conversations.length > 0 ? (
          conversations.map((chat) => (
            <Link 
              to={`/chat/${chat._id}`} 
              key={chat._id}
              className="flex p-4 border-b hover:bg-gray-50 transition justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-800">{chat.name}</h3>
                <p className="text-gray-500 text-sm truncate w-64">{chat.lastMessage}</p>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(chat.date).toLocaleDateString()}
              </span>
            </Link>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            No messages yet. Applying for jobs to start chatting!
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;