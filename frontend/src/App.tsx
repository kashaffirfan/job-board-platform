import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register"; 
import Home from "./pages/Home";
import PostJob from "./pages/PostJob";
import JobDetails from "./pages/JobDetails";
import MyJobs from "./pages/MyJobs";
import Applications from "./pages/Applications";
import Chat from "./pages/Chat";
import Inbox from "./pages/Inbox"
import Profile from "./pages/Profile"
import MyApplications from "./pages/MyApplications"

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/job/:id" element={<JobDetails />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/applications/:jobId" element={<Applications />} />
          <Route path="/chat/:userId" element={<Chat />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-applications" element={<MyApplications />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;