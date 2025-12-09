import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);

  // Fetch Jobs on Component Mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/jobs");
        setJobs(res.data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="container mx-auto p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Local Jobs</h1>
        
        {/* --- NAVIGATION SECTION START --- */}
        <div className="space-x-4">
          {user ? (
            <>
              <span className="text-gray-600">Hello, {user.name} ({user.role})</span>
              
              {/* Inbox Link (For Everyone) */}
              <Link to="/inbox" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mx-2">
                Inbox
              </Link>

              {/* Client Only Links */}
              {user.role === 'client' && (
                <>
                  <Link to="/post-job" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    + Post Job
                  </Link>
                  <Link to="/my-jobs" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-2">
                    My Jobs
                  </Link>
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
        {/* --- NAVIGATION SECTION END --- */}

      </div>

      {/* Job List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job._id} className="bg-white p-6 shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{job.category} • {job.city}</p>
              <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>
              <div className="flex justify-between items-center mt-4 border-t pt-4">
                <span className="font-bold text-green-600">${job.budget}</span>
                <Link 
                  to={`/job/${job._id}`} 
                  className="text-blue-500 hover:underline"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-3 text-center">No jobs found. Be the first to post one!</p>
        )}
      </div>
    </div>
  );
};

export default Home;