import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", city: "", role: "freelancer"
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      alert("Registration Successful! Please login.");
      navigate("/login");
    } catch (err) {
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