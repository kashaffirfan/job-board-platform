import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext, { User } from "../context/AuthContext";
import { Link } from "react-router-dom";

interface Job {
  _id: string;
  title: string;
  category: string;
  createdAt: string;
  client: string | { _id: string }; // Handle populated vs unpopulated
}

const MyJobs: React.FC = () => {
  const { user } = useContext(AuthContext) as { user: User | null };
  const [myJobs, setMyJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const res = await axios.get<Job[]>("http://localhost:5000/api/jobs");
        
        if (user) {
            // Filter jobs locally
            const filteredJobs = res.data.filter(job => {
                const clientId = typeof job.client === 'object' ? job.client._id : job.client;
                return String(clientId) === String(user.id || user._id);
            });
            setMyJobs(filteredJobs);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchMyJobs();
  }, [user]);

  const handleDelete = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from UI instantly
      setMyJobs(myJobs.filter(job => job._id !== jobId));
      alert("Job deleted successfully");
    } catch (err) {
      alert("Error deleting job");
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Job Postings</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Job Title
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Posted Date
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {myJobs.length > 0 ? myJobs.map((job) => (
              <tr key={job._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap font-bold">{job.title}</p>
                  <p className="text-gray-500">{job.category}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {new Date(job.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <Link 
                    to={`/applications/${job._id}`} 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-xs mr-2"
                  >
                    View Applications
                  </Link>
                  <button 
                    onClick={() => handleDelete(job._id)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
               <tr><td colSpan={3} className="p-5 text-center text-gray-500">You haven't posted any jobs yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyJobs;