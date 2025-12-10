import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";

// 1. Define Types for your data
interface Job {
  _id: string;
  title: string;
  category: string;
  city: string;
  description: string;
  budget: number;
}

interface User {
  name: string;
  role: 'client' | 'freelancer' | 'admin'; // Adjust roles as needed
}

// 2. Define Context Type (Ideally this moves to your AuthContext file later)
interface AuthContextType {
  user: User | null;
  logout: () => void;
}

const Home: React.FC = () => {
  // We assert the context type here for now
  const { user, logout } = useContext(AuthContext) as AuthContextType;
  
  // 3. Apply Types to State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        let url = "http://localhost:5000/api/jobs?";
        if (search) url += `search=${search}&`;
        if (category) url += `category=${category}&`;

        // TypeScript now knows res.data is an array of Job objects
        const res = await axios.get<Job[]>(url);
        setJobs(res.data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, category]); 

  // 4. Type the Event Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  return (
    <div className="container mx-auto p-6">
      
      {/* Header & Navigation */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Local Jobs</h1>
        
        <div className="space-x-4">
          {user ? (
            <>
              <span className="text-gray-600">Hello, {user.name} ({user.role})</span>
              <Link to="/inbox" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mx-2">Inbox</Link>
              <Link to="/profile" className="text-gray-600 hover:text-blue-500 mr-4 font-bold">Profile</Link>

              {user.role === 'client' && (
                <>
                  <Link to="/post-job" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Post Job</Link>
                  <Link to="/my-jobs" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-2">My Jobs</Link>
                </>
              )}
              <button onClick={logout} className="text-red-500 hover:underline ml-4">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded">Login</Link>
              <Link to="/register" className="bg-green-500 text-white px-4 py-2 rounded ml-2">Register</Link>
            </>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-gray-100 p-4 rounded-lg mb-8 flex flex-col md:flex-row gap-4 shadow-sm">
        <input 
          type="text" 
          placeholder="Search jobs (e.g. React, Logo Design)..." 
          className="flex-1 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={search}
          onChange={handleSearchChange}
        />
        <select 
          className="p-3 border rounded w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          value={category}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          <option value="Development">Development</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
          <option value="Writing">Writing</option>
        </select>
      </div>

      {/* Job List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job._id} className="bg-white p-6 shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{job.title}</h3>
                <p className="text-xs text-blue-500 font-bold uppercase mb-2">{job.category}</p>
                <p className="text-sm text-gray-500 mb-3">{job.city}</p>
                <p className="text-gray-600 line-clamp-3 mb-4">{job.description}</p>
              </div>
              
              <div className="flex justify-between items-center mt-4 border-t pt-4">
                <span className="font-bold text-green-600 text-lg">${job.budget}</span>
                <Link to={`/job/${job._id}`} className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                  View Details →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No jobs found matching your search.</p>
            <button 
              onClick={() => {setSearch(""); setCategory("");}} 
              className="mt-2 text-blue-500 underline"
            >
              Clear Filters
            </button>
          </div>
          
        )}
      </div>
    </div>
  );
};

export default Home;