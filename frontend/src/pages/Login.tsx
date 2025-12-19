import React, { useState, useContext } from "react";
import AuthContext from "../context/AuthContext"; 
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
// We removed 'Grid' and 'Container' to stop the errors/warnings
import { Box, Typography, TextField, Button, Paper, Stack, Divider } from "@mui/material"; 
import { toast } from "react-toastify"; 
import LoginIcon from '@mui/icons-material/Login';
import { GoogleLogin } from '@react-oauth/google';

interface LoginResponse { user: any; token: string; }

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const authContext = useContext(AuthContext);
  const login = authContext ? authContext.login : () => {}; 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
const res = await axios.post<LoginResponse>(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid Email or Password");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        token: credentialResponse.credential
      });
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate("/");
    } catch (err) {
      toast.error("Google Login Failed");
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* Left Side: Image */}
      <Box sx={{
          flex: 1,
          display: { xs: 'none', md: 'block' },
          backgroundImage: 'url(https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Right Side: Form */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Paper elevation={6} square sx={{ p: 4, width: '100%', maxWidth: 450, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
            
            <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: '50%', mb: 2 }}>
               <LoginIcon sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            
            <Typography variant="h4" fontWeight="bold">Sign in</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>Access your dashboard.</Typography>

            <Stack component="form" onSubmit={handleSubmit} spacing={2} width="100%">
              <TextField required fullWidth label="Email Address" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextField required fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              
              <Button type="submit" fullWidth variant="contained" size="large" sx={{ py: 1.5 }}>Sign In</Button>
              
              <Divider sx={{ my: 1 }}>OR</Divider>

              <Box display="flex" justifyContent="center" width="100%">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google Login Failed")}
                  useOneTap
                  width="100%"
                />
              </Box>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Don't have an account? <Link to="/register" style={{ textDecoration: 'none', color: '#4F46E5', fontWeight: 'bold' }}>Sign Up</Link>
                </Typography>
              </Box>
            </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;