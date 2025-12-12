import React, { useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { 
  Box, Typography, TextField, Button, Paper, MenuItem, Select, FormControl, InputLabel, Container, Stack, SelectChangeEvent 
} from "@mui/material";
import { toast } from "react-toastify";
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface JobFormData {
  title: string; description: string; category: string; budget: string; deadline: string; city: string;
}

const PostJob: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const navigate = useNavigate();
  const [formData, setFormData] = useState<JobFormData>({
    title: "", description: "", category: "Development", budget: "", deadline: "", city: ""
  });

  if (user && user.role !== "client") {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <Typography color="error" variant="h6">Only Clients can post jobs.</Typography>
      </Box>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData({...formData, category: e.target.value as string});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/jobs", formData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Job Posted Successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error posting job");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 10 }}>
      {/* Back Button */}
      <Button startIcon={<ArrowBackIcon />} component={Link} to="/" sx={{ mb: 2, color: 'text.secondary' }}>
        Back to Dashboard
      </Button>

      <Paper elevation={3} sx={{ p: 5, borderRadius: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={4}>
          <Box sx={{ p: 1.5, bgcolor: 'secondary.main', borderRadius: 2, color: 'white', mr: 2 }}>
            <WorkOutlineIcon />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold">Post a New Job</Typography>
            <Typography variant="body2" color="text.secondary">Find the perfect freelancer for your project.</Typography>
          </Box>
        </Box>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Job Title"
              name="title"
              placeholder="e.g. Senior React Developer needed"
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
                placeholder="e.g. Lahore"
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
              placeholder="Describe the project details, requirements, and deliverables..."
              value={formData.description}
              onChange={handleChange}
            />

            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              Post Job Now
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default PostJob;