import { useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const PostJob = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "", description: "", category: "Development", budget: "", deadline: "", city: ""
  });

  // Redirect if not a client
  if (user && user.role !== "client") {
    return <div className="p-10 text-center text-red-500">Only Clients can post jobs.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get token from storage
      const token = localStorage.getItem("token");
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post("http://localhost:5000/api/jobs", formData, config);
      alert("Job Posted Successfully!");
      navigate("/"); // Go back to Home
    } catch (err) {
      alert(err.response?.data?.message || "Error posting job");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Post a New Job</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          placeholder="Job Title" 
          className="w-full p-2 border rounded" 
          required 
          onChange={e => setFormData({...formData, title: e.target.value})} 
        />
        <textarea 
          placeholder="Description" 
          className="w-full p-2 border rounded h-32" 
          required 
          onChange={e => setFormData({...formData, description: e.target.value})} 
        />
        <div className="grid grid-cols-2 gap-4">
          <select 
            className="p-2 border rounded" 
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            <option value="Development">Development</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Writing">Writing</option>
          </select>
          <input 
            type="number" 
            placeholder="Budget ($)" 
            className="p-2 border rounded" 
            required 
            onChange={e => setFormData({...formData, budget: e.target.value})} 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="date" 
            className="p-2 border rounded" 
            required 
            onChange={e => setFormData({...formData, deadline: e.target.value})} 
          />
          <input 
            placeholder="City (Local Only)" 
            className="p-2 border rounded" 
            required 
            onChange={e => setFormData({...formData, city: e.target.value})} 
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Post Job
        </button>
      </form>
    </div>
  );
};

export default PostJob;