import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  Box, Typography, TextField, Button, Paper, Container, Stack, MenuItem, FormControl, InputLabel, Select, SelectChangeEvent 
} from "@mui/material";
import { toast } from "react-toastify";
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Define Interface for clarity
interface JobData {
  title: string;
  description: string;
  category: string;
  budget: number | string;
  deadline: string;
  city: string;
}

const EditJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<JobData>({
    title: "", description: "", category: "Development", budget: 0, deadline: "", city: ""
  });
  const [loading, setLoading] = useState(true);

  // Load existing job data
  useEffect(() => {
    const fetchJob = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/jobs`); 
            const job = res.data.find((j: any) => j._id === id);
            
            if (job) {
                setFormData({
                    title: job.title,
                    description: job.description,
                    category: job.category,
                    budget: job.budget,
                    deadline: job.deadline ? job.deadline.split('T')[0] : "",
                    city: job.city
                });
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load job details");
            setLoading(false);
        }
    };
    if (id) fetchJob();
  }, [id]);

  // Handle Text Inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Select Input
  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData({ ...formData, category: e.target.value as string });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/jobs/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Job Updated Successfully!");
      navigate("/my-jobs");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error updating job");
    }
  };

  if (loading) return <Box p={5} textAlign="center"><Typography>Loading Job Details...</Typography></Box>;

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 10 }}>
      {/* Back Button */}
      <Button startIcon={<ArrowBackIcon />} component={Link} to="/my-jobs" sx={{ mb: 2, color: 'text.secondary' }}>
        Back to My Jobs
      </Button>

      <Paper elevation={3} sx={{ p: 5, borderRadius: 3 }}>
        
        {/* Header */}
        <Box display="flex" alignItems="center" mb={4}>
          <Box sx={{ p: 1.5, bgcolor: 'primary.main', borderRadius: 2, color: 'white', mr: 2 }}>
            <EditIcon />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold">Edit Job Post</Typography>
            <Typography variant="body2" color="text.secondary">Update the details of your job listing.</Typography>
          </Box>
        </Box>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            
            <TextField 
              label="Job Title" 
              name="title" 
              fullWidth 
              required 
              variant="outlined" 
              value={formData.title} 
              onChange={handleChange} 
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
               <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="Development">Development</MenuItem>
                  <MenuItem value="Design">Design</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Writing">Writing</MenuItem>
                </Select>
              </FormControl>

              <TextField 
                label="Budget ($)" 
                name="budget" 
                type="number" 
                fullWidth 
                required 
                value={formData.budget} 
                onChange={handleChange} 
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField 
                label="City" 
                name="city" 
                fullWidth 
                required 
                value={formData.city} 
                onChange={handleChange} 
              />
              <TextField 
                label="Deadline" 
                name="deadline" 
                type="date" 
                fullWidth 
                required 
                InputLabelProps={{ shrink: true }}
                value={formData.deadline} 
                onChange={handleChange} 
              />
            </Stack>

            <TextField 
              label="Job Description" 
              name="description" 
              multiline 
              rows={6} 
              fullWidth 
              required 
              value={formData.description} 
              onChange={handleChange} 
            />

            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              color="success"
              sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              Update Job
            </Button>

          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default EditJob;