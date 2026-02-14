import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { wellsAPI } from '../services/api';
import WellInfo from '../components/WellInfo';
import Visualization from '../components/Visualization';
import FloatingAIAssistant from '../components/FloatingAIAssistant';

function WellViewer() {
  const { id } = useParams();
  const [well, setWell] = useState(null);
  const [curves, setCurves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWellData();
  }, [id]);

  const loadWellData = async () => {
    try {
      setLoading(true);
      const [wellResponse, curvesResponse] = await Promise.all([
        wellsAPI.getById(id),
        wellsAPI.getCurves(id),
      ]);
      setWell(wellResponse.data);
      setCurves(curvesResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to load well data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!well) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Well not found
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {well.wellName}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <WellInfo well={well} />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Visualization well={well} curves={curves} />
          </Paper>
        </Grid>
      </Grid>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant well={well} curves={curves} />
    </Box>
  );
}

export default WellViewer;
