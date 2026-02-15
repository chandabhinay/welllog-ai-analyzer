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
  Paper,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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
    } catch (err) {
      setError('Failed to load wells');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.las')) {
      setError('Only LAS files are supported');
      return;
    }

    setSelectedFile(file);
    setUploadDialog(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await wellsAPI.uploadLAS(formData);
      setSuccess(`Uploaded: ${response.data.well.wellName}`);
      setUploadDialog(false);
      setSelectedFile(null);
      loadWells();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (wellId, wellName) => {
    if (!window.confirm(`Delete "${wellName}"? This action is permanent.`)) return;

    try {
      await wellsAPI.delete(wellId);
      setSuccess(`Deleted ${wellName}`);
      loadWells();
    } catch (err) {
      setError('Delete failed');
    }
  };

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Well Log Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload, manage and visualize LAS well log data
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          component="label"
          startIcon={<UploadFileIcon />}
        >
          Upload LAS
          <input hidden type="file" accept=".las" onChange={handleFileSelect} />
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress size={50} />
        </Box>
      )}

      {/* Empty State */}
      {!loading && wells.length === 0 && (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 70, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6">No LAS Files Uploaded</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload your first LAS file to start analyzing well logs
          </Typography>
          <Button variant="contained" component="label" startIcon={<UploadFileIcon />}>
            Upload File
            <input hidden type="file" accept=".las" onChange={handleFileSelect} />
          </Button>
        </Paper>
      )}

      {/* Wells Grid */}
      <Grid container spacing={3}>
        {wells.map((well) => (
          <Grid item xs={12} sm={6} md={4} key={well.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: '0.25s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {well.wellName}
                </Typography>

                <Stack spacing={0.7}>
                  <Typography variant="body2">Company: {well.company || '—'}</Typography>
                  <Typography variant="body2">Field: {well.field || '—'}</Typography>
                  <Typography variant="body2">Location: {well.location || '—'}</Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="caption" color="text.secondary">
                    Depth: {well.startDepth?.toFixed(0)} – {well.stopDepth?.toFixed(0)} ft
                  </Typography>

                  <Chip
                    size="small"
                    label={`Uploaded: ${new Date(well.createdAt).toLocaleDateString()}`}
                    sx={{ mt: 1, alignSelf: 'flex-start' }}
                  />
                </Stack>
              </CardContent>

              <Divider />

              <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                <Button size="small" startIcon={<VisibilityIcon />} onClick={() => navigate(`/well/${well.id}`)}>
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

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => !uploading && setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload LAS File</DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography fontWeight={600}>{selectedFile?.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Paper>

            {uploading && (
              <>
                <Typography variant="body2">Uploading & processing...</Typography>
                <LinearProgress />
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setUploadDialog(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} variant="contained" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Start Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Home;
