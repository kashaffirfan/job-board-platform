import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const Applications = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);

  // Fetch applications
  useEffect(() => {
    const fetchApp = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/applications/job/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchApp();
  }, [jobId]);

  // Handle Accept/Reject
  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/applications/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update UI immediately
      setApplications(apps => apps.map(app => 
        app._id === id ? { ...app, status } : app
      ));
    } catch (err) {
      alert("Error updating status");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Applicants for Job</h1>
      <div className="grid gap-6">
        {applications.length > 0 ? applications.map(app => (
          <div key={app._id} className="bg-white p-6 shadow rounded-lg border-l-4 border-blue-500 flex justify-between items-start">
            
            {/* Left Side: Freelancer Info */}
            <div>
              <h3 className="text-xl font-bold">{app.freelancer.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{app.freelancer.email} • {app.freelancer.skills?.join(", ")}</p>
              <div className="bg-gray-50 p-3 rounded text-gray-700 italic border">
                "{app.coverLetter}"
              </div>
              <p className="mt-2 text-xs text-gray-400">Applied on: {new Date(app.createdAt).toLocaleDateString()}</p>
            </div>
            
            {/* Right Side: Actions */}
            <div className="flex flex-col items-end space-y-2">
              
              {/* Status Badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                ${app.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                  app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {app.status}
              </span>

              {/* Action Buttons */}
              <div className="space-x-2 mt-2 flex items-center">
                
                {/* Message Button (Always visible) */}
                <Link 
                  to={`/chat/${app.freelancer._id}`}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 no-underline"
                >
                  Message
                </Link>

                {app.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => updateStatus(app._id, 'accepted')}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => updateStatus(app._id, 'rejected')}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        )) : (
          <p className="text-center text-gray-500">No applications yet.</p>
        )}
      </div>
    </div>
  );
};

export default Applications;