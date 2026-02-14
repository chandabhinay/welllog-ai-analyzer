import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { wellsAPI } from '../services/api';

function Home() {
  const navigate = useNavigate();
  const [wells, setWells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadWells();
  }, []);

  const loadWells = async () => {
    try {
      setLoading(true);
      const response = await wellsAPI.getAll();
      setWells(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load wells: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.las')) {
        setError('Please select a LAS file');
        return;
      }
      setSelectedFile(file);
      setUploadDialog(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await wellsAPI.uploadLAS(formData);
      setSuccess(`Successfully uploaded ${response.data.well.wellName}`);
      setUploadDialog(false);
      setSelectedFile(null);
      loadWells();
    } catch (err) {
      setError('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (wellId, wellName) => {
    if (!window.confirm(`Are you sure you want to delete ${wellName}?`)) {
      return;
    }

    try {
      await wellsAPI.delete(wellId);
      setSuccess(`Deleted ${wellName}`);
      loadWells();
    } catch (err) {
      setError('Delete failed: ' + err.message);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Well Log Data
        </Typography>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadFileIcon />}
        >
          Upload LAS File
          <input
            type="file"
            hidden
            accept=".las"
            onChange={handleFileSelect}
          />
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : wells.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center" color="text.secondary">
              No wells uploaded yet. Upload a LAS file to get started.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {wells.map((well) => (
            <Grid item xs={12} sm={6} md={4} key={well.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    {well.wellName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Company: {well.company || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Field: {well.field || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location: {well.location || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Depth: {well.startDepth?.toFixed(0)} - {well.stopDepth?.toFixed(0)} ft
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Uploaded: {new Date(well.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/well/${well.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(well.id, well.wellName)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => !uploading && setUploadDialog(false)}>
        <DialogTitle>Upload LAS File</DialogTitle>
        <DialogContent>
          <Typography>
            File: <strong>{selectedFile?.name}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Size: {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </Typography>
          {uploading && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Uploading and processing...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} variant="contained" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Home;
