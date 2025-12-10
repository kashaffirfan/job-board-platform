import React, { useState, useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import axios from "axios";

// 1. Define the shape of the form state
interface ProfileFormData {
  name: string;
  email: string;
  skills: string;
  bio: string;
  portfolio: string;
}

const Profile: React.FC = () => {
  const authContext = useContext(AuthContext);
  
  // Safely access context values (handling potential null context)
  const user = authContext?.user;
  const login = authContext?.login;

  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    skills: "",
    bio: "",
    portfolio: ""
  });

  // Load existing data when page opens
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        // We use (user as any) here because 'bio' and 'portfolio' might not be in the base User type yet
        skills: user.skills ? user.skills.join(", ") : "",
        bio: (user as any).bio || "",
        portfolio: (user as any).portfolio || ""
      });
    }
  }, [user]);

  // 2. Type the Change Handler to accept both Input and TextArea events
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Type the Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Guard clause in case login function is missing
    if (!login) return;

    try {
      const token = localStorage.getItem("token");
      
      // Convert comma-separated string back to array for skills
      const updatedData = {
        ...formData,
        skills: formData.skills.split(",").map(skill => skill.trim())
      };

      const res = await axios.put("http://localhost:5000/api/auth/profile", updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Profile Updated Successfully!");
      // Update the global user context so the new name/skills show up instantly
      login(res.data, token || ""); 

    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">My Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Full Name</label>
          <input 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            className="w-full p-2 border rounded" 
          />
        </div>
        
        {user?.role === 'freelancer' && (
          <>
            <div>
              <label className="block text-gray-700">Skills (Comma separated)</label>
              <input 
                name="skills" 
                value={formData.skills} 
                onChange={handleChange} 
                placeholder="e.g. React, Python, Design"
                className="w-full p-2 border rounded" 
              />
            </div>
            <div>
              <label className="block text-gray-700">Bio / Summary</label>
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                className="w-full p-2 border rounded h-24"
                placeholder="Tell clients about yourself..."
              />
            </div>
            <div>
              <label className="block text-gray-700">Portfolio URL</label>
              <input 
                name="portfolio" 
                value={formData.portfolio} 
                onChange={handleChange} 
                className="w-full p-2 border rounded" 
                placeholder="https://myportfolio.com"
              />
            </div>
          </>
        )}

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;