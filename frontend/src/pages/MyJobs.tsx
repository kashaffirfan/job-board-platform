import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { 
  Box, Typography, Button, Card, CardContent, CardActions, Chip, Stack, Container, IconButton 
} from "@mui/material";
import { toast } from "react-toastify";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';

interface Job {
  _id: string;
  title: string;
  category: string;
  budget: number;
  city: string;
  createdAt: string;
}

const MyJobs: React.FC = () => {
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<Job[]>("http://localhost:5000/api/jobs/myjobs", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyJobs(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchMyJobs();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyJobs(myJobs.filter(job => job._id !== id));
      toast.success("Job Deleted Successfully");
    } catch (err) {
      toast.error("Error deleting job");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 10 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={5}>
        <Box>
            <Typography variant="h4" fontWeight="bold">My Posted Jobs</Typography>
            <Typography variant="body2" color="text.secondary">Manage your active listings and applicants</Typography>
        </Box>
        <Button 
            component={Link} 
            to="/post-job" 
            variant="contained" 
            startIcon={<WorkIcon />}
            sx={{ fontWeight: 'bold' }}
        >
            Post New Job
        </Button>
      </Stack>

      <Stack spacing={3}>
        {myJobs.length > 0 ? (
          myJobs.map((job) => (
            <Card key={job._id} elevation={2} sx={{ borderRadius: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
              <CardContent sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} mb={1}>
                    <Chip label={job.category} size="small" color="primary" variant="outlined" />
                    <Chip label={job.city} size="small" variant="outlined" />
                </Stack>
                <Typography variant="h6" fontWeight="bold">{job.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                    Posted on: {new Date(job.createdAt).toLocaleDateString()} • Budget: ${job.budget}
                </Typography>
              </CardContent>
              
              <CardActions>
                <Stack direction="row" spacing={1}>
                    <Button 
                        component={Link} 
                        to={`/applications/${job._id}`} 
                        variant="outlined" 
                        size="small" 
                        startIcon={<PeopleIcon />}
                    >
                        Applicants
                    </Button>
                    <IconButton component={Link} to={`/edit-job/${job._id}`} color="primary">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(job._id)} color="error">
                        <DeleteIcon />
                    </IconButton>
                </Stack>
              </CardActions>
            </Card>
          ))
        ) : (
          <Box textAlign="center" py={10} bgcolor="#F9FAFB" borderRadius={3}>
            <Typography variant="h6" color="text.secondary">You haven't posted any jobs yet.</Typography>
            <Button component={Link} to="/post-job" variant="text" sx={{ mt: 1 }}>Get Started</Button>
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default MyJobs;