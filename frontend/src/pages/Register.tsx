import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from "@mui/material";
import { toast } from "react-toastify";
import PersonAddIcon from '@mui/icons-material/PersonAdd';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  city: string;
  role: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    city: "",
    role: "freelancer"
  });
  const navigate = useNavigate();

  // Handle Text Inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Select Input
  const handleRoleChange = (e: SelectChangeEvent) => {
    setFormData({ ...formData, role: e.target.value as string });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      toast.success("Registration Successful! Please login.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error registering");
    }
  };

  return (
    // MAIN CONTAINER
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>

      {/* LEFT SIDE: Image (Hidden on mobile) */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'block' },
          backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* RIGHT SIDE: Register Form */}
      <Paper
        elevation={6}
        square
        sx={{
          width: { xs: '100%', md: '600px' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%', // Take full height
          overflowY: 'auto' // ENABLE SCROLLING
        }}
      >
        <Box 
          sx={{ 
            width: '100%', 
            maxWidth: 450, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            p: 4,
            my: 'auto' // <--- THIS IS THE MAGIC FIX (Centers vertically safely)
          }}
        >

          {/* Icon Bubble */}
          <Box sx={{ p: 2, bgcolor: 'secondary.main', borderRadius: '50%', mb: 2, display: 'flex' }}>
             <PersonAddIcon sx={{ color: 'white', fontSize: 30 }} />
          </Box>

          <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Join as a Freelancer or Client today.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              name="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">I want to...</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                value={formData.role}
                label="I want to..."
                onChange={handleRoleChange}
              >
                <MenuItem value="freelancer">Work as a Freelancer</MenuItem>
                <MenuItem value="client">Hire Talent (Client)</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5, 
                fontSize: '1rem', 
                bgcolor: 'secondary.main', 
                '&:hover': { bgcolor: 'secondary.dark' } 
              }} 
            >
              Sign Up
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link to="/login" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
                  <span style={{ color: '#4F46E5' }}>Log In</span>
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;