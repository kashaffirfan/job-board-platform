import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { theme } from './theme';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostJob from './pages/PostJob';
import JobDetails from './pages/JobDetails';
import MyJobs from './pages/MyJobs';
import EditJob from './pages/EditJob';
import Applications from './pages/Applications';
import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';
import Inbox from './pages/Inbox';
import Chat from './pages/Chat';
import ProtectedRoute from './components/ProtectedRoute';


function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/job/:id" element={<JobDetails />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/chat/:userId" element={<Chat />} />
        </Route>

        {/* --- CLIENT ONLY ROUTES --- */}
        <Route element={<ProtectedRoute allowedRoles={['client']} />}>
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/edit-job/:id" element={<EditJob />} />
          <Route path="/applications/:jobId" element={<Applications />} />
        </Route>

        {/* --- FREELANCER ONLY ROUTES --- */}
        <Route element={<ProtectedRoute allowedRoles={['freelancer']} />}>
          <Route path="/my-applications" element={<MyApplications />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;