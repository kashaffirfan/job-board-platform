import React, { useState, useEffect } from "react";
import axios from "axios";
// We removed 'useContext' and 'AuthContext' since we aren't using the user object directly
import { useNavigate, useParams } from "react-router-dom";

const EditJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "", description: "", category: "Development", budget: 0, deadline: "", city: ""
  });
  const [loading, setLoading] = useState(true);

  // Load existing job data
  useEffect(() => {
    const fetchJob = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/jobs`); 
            const job = res.data.find((j: any) => j._id === id);
            
            if (job) {
                setFormData({
                    title: job.title,
                    description: job.description,
                    category: job.category,
                    budget: job.budget,
                    deadline: job.deadline ? job.deadline.split('T')[0] : "",
                    city: job.city
                });
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };
    fetchJob();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/jobs/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Job Updated Successfully!");
      navigate("/my-jobs");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error updating job");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Edit Job</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          value={formData.title}
          placeholder="Job Title" 
          className="w-full p-2 border rounded" 
          required 
          onChange={(e) => setFormData({...formData, title: e.target.value})} 
        />
        <textarea 
          value={formData.description}
          placeholder="Description" 
          className="w-full p-2 border rounded h-32" 
          required 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
        />
        <div className="grid grid-cols-2 gap-4">
          <select 
            value={formData.category}
            className="p-2 border rounded" 
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="Development">Development</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Writing">Writing</option>
          </select>
          <input 
            value={formData.budget}
            type="number" 
            placeholder="Budget ($)" 
            className="p-2 border rounded" 
            required 
            onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})} 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input 
            value={formData.deadline}
            type="date" 
            className="p-2 border rounded" 
            required 
            onChange={(e) => setFormData({...formData, deadline: e.target.value})} 
          />
          <input 
            value={formData.city}
            placeholder="City" 
            className="p-2 border rounded" 
            required 
            onChange={(e) => setFormData({...formData, city: e.target.value})} 
          />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Update Job
        </button>
      </form>
    </div>
  );
};

export default EditJob;