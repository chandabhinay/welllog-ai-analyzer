import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Skeleton,
  Chip,
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
    } catch (err) {
      setError('Failed to load well data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
        <Skeleton height={45} width="40%" />
        <Skeleton height={110} sx={{ my: 2 }} />
        <Skeleton height={420} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!well) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Alert severity="warning">Well not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Stack spacing={1} mb={3}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h4" fontWeight={600}>
            {well.wellName}
          </Typography>

          <Chip
            label={well.company || 'Unknown Company'}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Detailed well log visualization and analysis workspace
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {/* Well Metadata */}
        <Grid item xs={12}>
          <Paper
            elevation={2}
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(180deg, #1f2937, #111827)'
                  : 'linear-gradient(180deg, #ffffff, #f9fafb)',
            }}
          >
            <WellInfo well={well} />
          </Paper>
        </Grid>

        {/* Visualization */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 3,
              height: '100%',
            }}
          >
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
