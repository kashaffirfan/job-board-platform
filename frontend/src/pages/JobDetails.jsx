import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const JobDetails = () => {
  const { id } = useParams(); // Get the ID from the URL
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");

  // Fetch Job Data
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/jobs`);
        // Note: In a real app, you'd fetch /api/jobs/:id directly. 
        // For now, we filter from the list or you can implement the single GET route.
        // Let's assume we implement the single GET route in backend or filter here:
        const foundJob = res.data.find(j => j._id === id);
        setJob(foundJob);
      } catch (err) {
        console.error(err);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/applications",
        { jobId: id, coverLetter },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Application Sent Successfully!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Error applying");
    }
  };

  if (!job) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      {/* Job Header */}
      <div className="border-b pb-4 mb-4">
        <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
        <p className="text-gray-500 mt-1">
          Posted by <span className="font-semibold text-blue-600">Client</span> • {new Date(job.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Job Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-500">Budget</p>
          <p className="text-xl font-bold text-green-600">${job.budget}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-500">Location</p>
          <p className="text-xl font-bold">{job.city}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-500">Deadline</p>
          <p className="text-lg font-semibold">{new Date(job.deadline).toLocaleDateString()}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-500">Category</p>
          <p className="text-lg font-semibold badge">{job.category}</p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-3">Job Description</h3>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{job.description}</p>
      </div>

      {/* Application Section (Only for Freelancers) */}
      {user && user.role === "freelancer" ? (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-xl font-bold mb-4">Apply for this position</h3>
          <form onSubmit={handleApply}>
            <textarea
              className="w-full p-3 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows="4"
              placeholder="Write a short cover letter explaining why you are the best fit..."
              required
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            ></textarea>
            <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition">
              Submit Proposal
            </button>
          </form>
        </div>
      ) : (
        !user && (
          <div className="text-center p-4 bg-gray-100 rounded">
            <p>Please <a href="/login" className="text-blue-600 underline">login</a> as a freelancer to apply.</p>
          </div>
        )
      )}
    </div>
  );
};

export default JobDetails;