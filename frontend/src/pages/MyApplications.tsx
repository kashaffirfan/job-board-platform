import React, { useState, useEffect } from "react";
import axios from "axios";

interface Job {
  _id: string;
  title: string;
}

interface Application {
  _id: string;
  job: Job | null; 
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const MyApplications: React.FC = () => {
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const token = localStorage.getItem("token");
const res = await axios.get<Application[]>(`${import.meta.env.VITE_API_URL}/api/applications/my-applications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setApps(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchApps();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Job Title</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applied Date</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {apps.length > 0 ? apps.map((app) => (
              <tr key={app._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-bold">
                  {app.job ? app.job.title : "Job Deleted"}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {new Date(app.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                    ${app.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                      app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {app.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={3} className="p-5 text-center text-gray-500">You haven't applied to any jobs yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyApplications;