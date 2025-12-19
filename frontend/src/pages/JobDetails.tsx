import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { 
  Container, Box, Typography, Paper, Button, Chip, Divider, TextField, Stack 
} from "@mui/material";
import { toast } from "react-toastify";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UploadFileIcon from '@mui/icons-material/UploadFile'; 
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface Job { _id: string; title: string; description: string; budget: number; city: string; category: string; deadline: string; createdAt: string; }

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  
  const [job, setJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<File | null>(null); // State for Resume

  useEffect(() => {
    const fetchJob = async () => {
      try {
const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`);        const foundJob = res.data.find((j: any) => j._id === id);
        setJob(foundJob || null);
      } catch (err) { console.error(err); }
    };
    if (id) fetchJob();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) {
        toast.error("Please upload your resume.");
        return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // Use FormData to send text + file
      const formData = new FormData();
      formData.append("jobId", id as string);
      formData.append("coverLetter", coverLetter);
      formData.append("resume", resume); // Append file

      await axios.post(`${import.meta.env.VITE_API_URL}/api/applications`, formData, { 
        headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" // Critical for file upload
        } 
      });
      
      toast.success("Application Sent Successfully!");
      navigate("/");
    } catch (err: any) { 
        toast.error(err.response?.data?.message || "Error applying"); 
    }
  };

  const handleAIGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ai/generate-cover-letter`,
        { jobId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCoverLetter(res.data.coverLetter); 
      toast.success("Cover letter generated!");
    } catch (err) {
      toast.error("Failed to generate with AI");
    } finally {
      setGenerating(false);
    }
  };

  if (!job) return <Box p={4} textAlign="center">Loading...</Box>;

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 10 }}>
      <Button startIcon={<ArrowBackIcon />} component={Link} to="/" sx={{ mb: 2 }}>Back</Button>
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 4 }}>
          <Chip label={job.category} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 2 }} />
          <Typography variant="h3" fontWeight="bold">{job.title}</Typography>
          <Stack direction="row" spacing={2} mt={2}>
              <Typography variant="body2">{job.city}</Typography>
              <Typography variant="body2" display="flex" alignItems="center" gap={0.5}><CalendarTodayIcon fontSize="inherit"/> Posted {new Date(job.createdAt).toLocaleDateString()}</Typography>
          </Stack>
        </Box>
        <Box sx={{ p: 4 }}>
          <Stack direction="row" justifyContent="space-between" mb={4}>
             <Box>
                <Typography variant="h6" fontWeight="bold">Job Description</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mt: 1 }}>{job.description}</Typography>
             </Box>
             <Box textAlign="right" sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2, height: 'fit-content' }}>
                <Typography variant="caption">Budget</Typography>
                <Typography variant="h4" fontWeight="bold" color="secondary.main">${job.budget}</Typography>
             </Box>
          </Stack>
          <Divider sx={{ my: 4 }} />
          
          {user && user.role === "freelancer" ? (
            <Box sx={{ bgcolor: '#F9FAFB', p: 3, borderRadius: 2, border: '1px solid #e5e7eb' }}>
              
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">Apply Now</Typography>
                
                {/* AI BUTTON */}
                <Button 
                  startIcon={<AutoAwesomeIcon />} 
                  variant="text" 
                  color="secondary" 
                  onClick={handleAIGenerate}
                  disabled={generating}
                  sx={{ fontWeight: 'bold' }}
                >
                  {generating ? "Writing..." : "Write with AI"}
                </Button>
              </Stack>

              <form onSubmit={handleApply}>
                <TextField 
                    fullWidth multiline rows={6} // Increased rows for better view
                    placeholder="Why are you the best fit? (Click 'Write with AI' to auto-generate)" 
                    value={coverLetter} 
                    onChange={(e) => setCoverLetter(e.target.value)} 
                    required 
                    sx={{ mb: 2, bgcolor: 'white' }} 
                />

                {/* RESUME UPLOAD BUTTON */}
                <Box mb={3}>
                    <input
                        accept="application/pdf"
                        style={{ display: 'none' }}
                        id="resume-upload"
                        type="file"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="resume-upload">
                        <Button variant="outlined" component="span" startIcon={<UploadFileIcon />} fullWidth sx={{ py: 1.5, borderStyle: 'dashed' }}>
                            {resume ? resume.name : "Upload Resume (PDF)"}
                        </Button>
                    </label>
                </Box>

                <Button type="submit" variant="contained" size="large" fullWidth>Submit Proposal</Button>
              </form>
            </Box>
          ) : !user && <Button component={Link} to="/login" variant="outlined">Login to Apply</Button>}
        </Box>
      </Paper>
    </Container>
  );
};
export default JobDetails;