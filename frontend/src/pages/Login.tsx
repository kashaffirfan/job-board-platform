import React, { useState, useContext } from "react";
import AuthContext, { User } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Define Response Type
interface LoginResponse {
  user: User;
  token: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  
  // Cast Context
  const authContext = useContext(AuthContext);
  const login = authContext ? authContext.login : () => {}; 
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post<LoginResponse>("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      
      // Save data to context
      login(res.data.user, res.data.token);
      
      alert("Login Successful!");
      navigate("/");
      
    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl mb-4 font-bold text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;