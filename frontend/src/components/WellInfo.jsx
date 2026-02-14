import React from 'react';
import { Paper, Grid, Typography, Chip, Box } from '@mui/material';

function WellInfo({ well }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Well Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="caption" color="text.secondary">
            Company
          </Typography>
          <Typography variant="body1">{well.company || 'N/A'}</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="caption" color="text.secondary">
            Field
          </Typography>
          <Typography variant="body1">{well.field || 'N/A'}</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="caption" color="text.secondary">
            Location
          </Typography>
          <Typography variant="body1">{well.location || 'N/A'}</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="caption" color="text.secondary">
            Country
          </Typography>
          <Typography variant="body1">{well.country || 'N/A'}</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="caption" color="text.secondary">
            Start Depth
          </Typography>
          <Typography variant="body1">{well.startDepth?.toFixed(2)} ft</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="caption" color="text.secondary">
            Stop Depth
          </Typography>
          <Typography variant="body1">{well.stopDepth?.toFixed(2)} ft</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="caption" color="text.secondary">
            Step
          </Typography>
          <Typography variant="body1">{well.step} ft</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="caption" color="text.secondary">
            Available Curves
          </Typography>
          <Typography variant="body1">{well.curves?.length || 0}</Typography>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Date Analyzed
        </Typography>
        <Chip
          label={well.dateAnalyzed ? new Date(well.dateAnalyzed).toLocaleDateString() : 'N/A'}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>
    </Paper>
  );
}

export default WellInfo;
