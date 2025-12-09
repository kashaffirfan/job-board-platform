import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";

const MyJobs = () => {
  const { user } = useContext(AuthContext);
  const [myJobs, setMyJobs] = useState([]);

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/jobs");
        // Filter jobs in frontend for now (Optimally, backend should have /api/jobs/myjobs)
        const filteredJobs = res.data.filter(job => job.client._id === user.id || job.client === user.id);
        setMyJobs(filteredJobs);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchMyJobs();
  }, [user]);

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
            {myJobs.map((job) => (
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
                  <button className="text-red-500 hover:text-red-700 text-xs font-bold">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {myJobs.length === 0 && <div className="p-5 text-center text-gray-500">You haven't posted any jobs yet.</div>}
      </div>
    </div>
  );
};

export default MyJobs;