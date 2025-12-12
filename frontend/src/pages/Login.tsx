import React, { useState, useContext } from "react";
import AuthContext from "../context/AuthContext"; 
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { 
  Box, Typography, TextField, Button, Paper 
} from "@mui/material";
import { toast } from "react-toastify"; 
import LoginIcon from '@mui/icons-material/Login';

interface LoginResponse {
  user: any;
  token: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  
  const authContext = useContext(AuthContext);
  const login = authContext ? authContext.login : () => {}; 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post<LoginResponse>("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      
      login(res.data.user, res.data.token);
      
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate("/");
      
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid Email or Password");
    }
  };

  return (
    // MAIN CONTAINER (Flexbox)
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* LEFT SIDE: Brand Image */}
      <Box
        sx={{
          flex: 1, // Takes up all remaining space
          display: { xs: 'none', md: 'block' }, // Hide on mobile
          backgroundImage: 'url(https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* RIGHT SIDE: Login Form (Fixed Width) */}
      <Paper 
        elevation={6} 
        square 
        sx={{ 
          width: { xs: '100%', md: '500px' }, // Full width on mobile, 500px on desktop
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          p: 4,
          zIndex: 1
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Icon Bubble */}
          <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: '50%', mb: 2, display: 'flex' }}>
             <LoginIcon sx={{ color: 'white', fontSize: 30 }} />
          </Box>
          
          <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
            Sign in
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Access your Job Board dashboard.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
            >
              Sign In
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link to="/register" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
                  <span style={{ color: '#4F46E5' }}>Sign Up</span>
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;