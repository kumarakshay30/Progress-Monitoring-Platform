import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useUser } from "../../context/userContext";
import { useUsers } from "../../context/usersContext";
import { Box, Typography, TextField, Button, Paper, Tabs, Tab, Divider, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FiUpload, FiX } from 'react-icons/fi';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 800,
  margin: '20px auto',
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

const Profile = () => {
  const { user, updateUser } = useUser();
  const { updateUserInList } = useUsers();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    profileImageUrl: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        profileImageUrl: user.profileImageUrl || '',
      });
      setPreviewUrl(user.profileImageUrl || '');
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    
    setUploadingImage(true);
    try {
      const response = await fetch('/api/auth/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }

      setProfileData(prev => ({
        ...prev,
        profileImageUrl: data.imageUrl
      }));
      setPreviewUrl(data.imageUrl);
      setSelectedFile(null);
      toast.success('Profile image uploaded successfully');
    } catch (error) {
      toast.error(error.message || 'Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setProfileData(prev => ({
      ...prev,
      profileImageUrl: ''
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update user context
      updateUser(data);
      
      // Update users context to reflect changes in admin components
      updateUserInList(data);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>My Profile</Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Profile Information" />
        <Tab label="Change Password" />
      </Tabs>

      <StyledPaper>
        {activeTab === 0 ? (
          <form onSubmit={handleProfileSubmit}>
            <Box sx={{ mb: 4 }}>
              <Box 
                sx={{ 
                  bgcolor: 'primary.main',
                  color: 'white',
                  p: 3,
                  borderRadius: 2,
                  mb: 3,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  width: '100%', 
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                  zIndex: 1
                }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                  <Box sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%',
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    mr: 3,
                    flexShrink: 0,
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Profile" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }} 
                      />
                    ) : (
                      profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </Box>
                  
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                      {profileData.name || 'User Name'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        {profileData.email}
                      </Typography>
                      <Box 
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 4,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {user?.role || 'user'}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Account Information
              </Typography>
            
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              margin="normal"
              variant="outlined"
            />
            
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={profileData.email}
              onChange={handleProfileChange}
              margin="normal"
              variant="outlined"
              disabled
              helperText="Contact support to change your email address"
            />
            
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Profile Image
              </Typography>
              
              <Box sx={{ 
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                bgcolor: 'grey.50',
                position: 'relative'
              }}>
                {previewUrl ? (
                  <Box>
                    <img 
                      src={previewUrl} 
                      alt="Profile preview" 
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '200px',
                        borderRadius: '8px',
                        marginBottom: '16px'
                      }} 
                    />
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<FiUpload />}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? 'Uploading...' : 'Change Image'}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                      </Button>
                      {selectedFile && (
                        <Button
                          variant="contained"
                          color="success"
                          onClick={handleImageUpload}
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? 'Uploading...' : 'Upload'}
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleRemoveImage}
                        startIcon={<FiX />}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <FiUpload size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Click to upload a profile image
                    </Typography>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<FiUpload />}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? 'Uploading...' : 'Select Image'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                    </Button>
                    {selectedFile && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Selected: {selectedFile.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={handleImageUpload}
                            disabled={uploadingImage}
                          >
                            {uploadingImage ? 'Uploading...' : 'Upload'}
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => setSelectedFile(null)}
                            startIcon={<FiX />}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <Typography variant="h6" gutterBottom>Change Password</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <TextField
              fullWidth
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              margin="normal"
              variant="outlined"
              required
            />
            
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              margin="normal"
              variant="outlined"
              required
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              margin="normal"
              variant="outlined"
              required
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </Box>
          </form>
        )}
      </StyledPaper>
    </Box>
  );
};

export default Profile;
