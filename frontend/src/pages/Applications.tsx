import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Card, CardContent, Chip, Button, Stack, Container, Avatar } from "@mui/material";
import { toast } from "react-toastify";

interface Application {
  _id: string;
  freelancer: { _id: string; name: string; email: string; skills?: string[] };
  coverLetter: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const Applications: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const token = localStorage.getItem("token");
       const res = await axios.get<Application[]>(`${import.meta.env.VITE_API_URL}/api/applications/job/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` }
});
        setApplications(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (jobId) fetchApp();
  }, [jobId]);

  const updateStatus = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      const token = localStorage.getItem("token");
await axios.put(`${import.meta.env.VITE_API_URL}/api/applications/${id}/status`, { status }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      setApplications(apps => apps.map(app => app._id === id ? { ...app, status } : app));
      toast.success(`Application ${status}`);
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>Job Applicants</Typography>
      
      <Stack spacing={3}>
        {applications.length > 0 ? applications.map(app => (
          <Card key={app._id} elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2}>
                
                {/* Info */}
                <Box>
                  <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>{app.freelancer.name.charAt(0)}</Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">{app.freelancer.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{app.freelancer.email}</Typography>
                    </Box>
                  </Stack>
                  
                  <Box bgcolor="grey.50" p={2} borderRadius={2} border={1} borderColor="divider" my={2}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>"{app.coverLetter}"</Typography>
                  </Box>

                  {app.freelancer.skills && (
                    <Stack direction="row" spacing={1} mb={2}>
                        {app.freelancer.skills.map((skill, i) => (
                            <Chip key={i} label={skill} size="small" variant="outlined" />
                        ))}
                    </Stack>
                  )}
                  <Typography variant="caption" color="text.disabled">Applied: {new Date(app.createdAt).toLocaleDateString()}</Typography>
                </Box>

                {/* Actions */}
                <Stack alignItems="flex-end" spacing={2}>
                   <Chip 
                      label={app.status} 
                      color={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'error' : 'warning'}
                      variant="filled"
                      sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                   />
                   
                   <Button component={Link} to={`/chat/${app.freelancer._id}`} variant="outlined" size="small">
                     Message
                   </Button>

                   {app.status === 'pending' && (
                     <Stack direction="row" spacing={1}>
                        <Button onClick={() => updateStatus(app._id, 'accepted')} variant="contained" color="success" size="small">Hire</Button>
                        <Button onClick={() => updateStatus(app._id, 'rejected')} variant="contained" color="error" size="small">Reject</Button>
                     </Stack>
                   )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )) : (
          <Typography textAlign="center" color="text.secondary" py={5}>No applicants yet.</Typography>
        )}
      </Stack>
    </Container>
  );
};

export default Applications;