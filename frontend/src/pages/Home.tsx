import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom"; 
import Notifications from '../components/Notifications';
import { 
  Box, Typography, TextField, Button, Card, CardContent, CardActions, Chip, Stack, MenuItem, InputAdornment, Paper, Container
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface Job { _id: string; title: string; category: string; city: string; description: string; budget: number; }

const Home: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const logout = authContext?.logout;
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState(""); const [category, setCategory] = useState(""); const [city, setCity] = useState(""); const [minBudget, setMinBudget] = useState(""); const [maxBudget, setMaxBudget] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search); if (category) params.append("category", category); if (city) params.append("city", city); if (minBudget) params.append("minBudget", minBudget); if (maxBudget) params.append("maxBudget", maxBudget);
        const res = await axios.get<Job[]>(`${import.meta.env.VITE_API_URL}/api/jobs?${params.toString()}`);
        setJobs(res.data);
      } catch (err) { console.error(err); }
    };
    const t = setTimeout(() => fetchJobs(), 500);
    return () => clearTimeout(t);
  }, [search, category, city, minBudget, maxBudget]); 

  const handleLogout = () => { if(logout) { logout(); navigate('/login'); } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F3F4F6', pb: 8 }}>
      {/* NAVBAR */}
      <Paper square elevation={1} sx={{ bgcolor: 'white', py: 2, px: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" maxWidth="lg" mx="auto">
          <Typography variant="h5" fontWeight="900" color="primary">Local Jobs</Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            {user ? (
              <>
                <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
                  <Typography variant="subtitle2" fontWeight="bold">{user.name}</Typography>
                  <Typography variant="caption" color="text.secondary" textTransform="uppercase">{user.role}</Typography>
                </Box>
                <Notifications />
                <Button component={Link} to="/inbox" variant="outlined" size="small">Inbox</Button>
                <Button component={Link} to="/profile" color="inherit">Profile</Button>
                {user.role === 'client' && <><Button component={Link} to="/post-job" variant="contained" color="secondary">+ Post Job</Button><Button component={Link} to="/my-jobs" color="inherit">My Jobs</Button></>}
                {user.role === 'freelancer' && <Button component={Link} to="/my-applications" color="inherit">My Apps</Button>}
                <Button onClick={handleLogout} color="error">Logout</Button>
              </>
            ) : (
              <><Button component={Link} to="/login">Login</Button><Button component={Link} to="/register" variant="contained">Register</Button></>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        {/* SEARCH BAR (Only for Freelancers) */}
        {user?.role !== 'client' && (
          <Paper elevation={0} sx={{ p: 3, mb: 5, borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField fullWidth placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
                <TextField select fullWidth value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 200 }} SelectProps={{ displayEmpty: true }}>
                    <MenuItem value="">All Categories</MenuItem><MenuItem value="Development">Development</MenuItem><MenuItem value="Marketing">Marketing</MenuItem><MenuItem value="Design">Design</MenuItem><MenuItem value="Writing">Writing</MenuItem>
                </TextField>
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField fullWidth placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon /></InputAdornment> }} />
                <Stack direction="row" spacing={2} sx={{ minWidth: 300 }}>
                  <TextField fullWidth placeholder="Min $" type="number" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} />
                  <TextField fullWidth placeholder="Max $" type="number" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} />
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        )}

        {/* JOB CARDS */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {jobs.map((job) => (
            <Card key={job._id} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4, borderColor: 'primary.main' } }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" mb={2}>
                    <Chip label={job.category} size="small" color="primary" variant="filled" />
                    <Typography variant="caption" display="flex" alignItems="center"><LocationOnIcon fontSize="inherit" /> {job.city}</Typography>
                </Stack>
                <Typography variant="h6" fontWeight="bold" noWrap>{job.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ height: 60, overflow: 'hidden', mb: 2 }}>{job.description}</Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold" color="secondary.main">${job.budget}</Typography>
                <Button component={Link} to={`/job/${job._id}`} variant="contained" size="small" sx={{ borderRadius: 10 }}>View</Button>
              </CardActions>
            </Card>
          ))}
          {jobs.length === 0 && <Typography textAlign="center" width="100%">No jobs found.</Typography>}
        </Box>
      </Container>
    </Box>
  );
};
export default Home;