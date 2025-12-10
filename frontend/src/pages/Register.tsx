import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  city: string;
  role: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    city: "",
    role: "freelancer"
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      alert("Registration Successful! Please login.");
      navigate("/login");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error registering");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        
        {/* Name */}
        <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full p-2 mb-2 border rounded" required />
        
        {/* Email */}
        <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full p-2 mb-2 border rounded" required />
        
        {/* Password */}
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full p-2 mb-2 border rounded" required />
        
        {/* City */}
        <input name="city" placeholder="City" onChange={handleChange} className="w-full p-2 mb-2 border rounded" required />

        {/* Role Selection */}
        <select name="role" onChange={handleChange} className="w-full p-2 mb-4 border rounded">
          <option value="freelancer">Freelancer</option>
          <option value="client">Client</option>
        </select>

        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Register;