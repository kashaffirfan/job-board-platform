import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { Container, Box, Typography, Paper, Button, Chip, Divider, TextField, Stack } from "@mui/material";
import { toast } from "react-toastify";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface Job { _id: string; title: string; description: string; budget: number; city: string; category: string; deadline: string; createdAt: string; }

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const { user } = useContext(AuthContext) as any;
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get<Job[]>(`http://localhost:5000/api/jobs`);
        setJob(res.data.find(j => j._id === id) || null);
      } catch (err) { console.error(err); }
    };
    if (id) fetchJob();
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/applications", { jobId: id, coverLetter }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Application Sent!");
      navigate("/");
    } catch (err: any) { toast.error(err.response?.data?.message || "Error applying"); }
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
              <Typography variant="h6" fontWeight="bold" mb={2}>Apply Now</Typography>
              <form onSubmit={handleApply}>
                <TextField fullWidth multiline rows={4} placeholder="Why are you the best fit?" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} required sx={{ mb: 2, bgcolor: 'white' }} />
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