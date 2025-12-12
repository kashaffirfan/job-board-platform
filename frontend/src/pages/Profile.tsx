import React, { useState, useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import { 
  Box, Typography, TextField, Button, Paper, Avatar, IconButton, Stack 
} from "@mui/material";
import { toast } from "react-toastify";
import PhotoCamera from '@mui/icons-material/PhotoCamera';

interface ProfileFormData {
  name: string;
  email: string;
  skills: string;
  bio: string;
  portfolio: string;
  companyName: string;
  companyDescription: string;
}

const Profile: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const login = authContext?.login;

  const [formData, setFormData] = useState<ProfileFormData>({
    name: "", email: "", skills: "", bio: "", portfolio: "", companyName: "", companyDescription: ""
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        skills: user.skills ? user.skills.join(", ") : "",
        bio: (user as any).bio || "",
        portfolio: (user as any).portfolio || "",
        companyName: (user as any).companyName || "",
        companyDescription: (user as any).companyDescription || ""
      });
      if ((user as any).profilePicture) {
        setPreview(`http://localhost:5000${(user as any).profilePicture}`);
      }
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login) return;

    try {
      const token = localStorage.getItem("token");
      const data = new FormData(); 

      data.append('name', formData.name);
      if (file) data.append('profilePicture', file);

      if (user?.role === 'freelancer') {
          data.append('skills', formData.skills);
          data.append('bio', formData.bio);
          data.append('portfolio', formData.portfolio);
      } else if (user?.role === 'client') {
          data.append('companyName', formData.companyName);
          data.append('companyDescription', formData.companyDescription);
      }

      const res = await axios.put("http://localhost:5000/api/auth/profile", data, {
        headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'multipart/form-data' 
        }
      });

      toast.success("Profile Updated Successfully!");
      login(res.data, token || ""); 
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating profile");
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: 5, width: '100%', maxWidth: 700, borderRadius: 3 }}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom color="primary.main">
            My Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your personal details and public information
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            
            {/* --- PROFILE PICTURE --- */}
            <Box display="flex" justifyContent="center">
              <Box position="relative">
                <Avatar 
                  src={preview} 
                  sx={{ width: 120, height: 120, border: '4px solid white', boxShadow: 3 }}
                />
                <IconButton 
                  color="primary" 
                  aria-label="upload picture" 
                  component="label"
                  sx={{ 
                    position: 'absolute', bottom: 0, right: 0, 
                    bgcolor: 'background.paper', boxShadow: 2, 
                    '&:hover': { bgcolor: 'background.default' } 
                  }}
                >
                  <input hidden accept="image/*" type="file" onChange={handleFileChange} />
                  <PhotoCamera />
                </IconButton>
              </Box>
            </Box>

            {/* --- BASIC INFO (Row) --- */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                disabled
                variant="filled"
              />
            </Stack>

            {/* --- FREELANCER FIELDS --- */}
            {user?.role === 'freelancer' && (
              <>
                <TextField
                  fullWidth
                  label="Skills (Comma separated)"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. React, Node.js, Design"
                />
                <TextField
                  fullWidth
                  label="Portfolio URL"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="https://myportfolio.com"
                />
                <TextField
                  fullWidth
                  label="Bio / Summary"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </>
            )}

            {/* --- CLIENT FIELDS --- */}
            {user?.role === 'client' && (
               <>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Tech Solutions Inc."
                />
                <TextField
                  fullWidth
                  label="Company Description"
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="Tell freelancers about your company..."
                />
               </>
            )}

            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              fullWidth
              sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1.1rem', mt: 2 }}
            >
              Save Changes
            </Button>

          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile;