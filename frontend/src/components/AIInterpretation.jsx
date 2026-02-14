import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Typography,
  Chip,
  OutlinedInput,
  Divider,
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { aiAPI, dataAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';

function AIInterpretation({ well, curves }) {
  const [selectedCurves, setSelectedCurves] = useState([]);
  const [startDepth, setStartDepth] = useState(well.startDepth);
  const [endDepth, setEndDepth] = useState(well.startDepth + 500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleInterpret = async () => {
    if (selectedCurves.length === 0) {
      setError('Please select at least one curve');
      return;
    }

    if (startDepth >= endDepth) {
      setError('Start depth must be less than end depth');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await aiAPI.interpret({
        wellId: well.id,
        curves: selectedCurves,
        startDepth,
        endDepth,
      });

      setResult(response.data);
    } catch (err) {
      setError('Failed to generate interpretation: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCurveChange = (event) => {
    const value = event.target.value;
    setSelectedCurves(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" paragraph>
        Select curves and a depth range to generate an AI-powered geological interpretation
        of your well-log data.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Select Curves</InputLabel>
            <Select
              multiple
              value={selectedCurves}
              onChange={handleCurveChange}
              input={<OutlinedInput label="Select Curves" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {curves.map((curve) => (
                <MenuItem key={curve.mnemonic} value={curve.mnemonic}>
                  {curve.mnemonic} - {curve.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Start Depth (ft)"
            type="number"
            value={startDepth}
            onChange={(e) => setStartDepth(parseFloat(e.target.value))}
            inputProps={{
              min: well.startDepth,
              max: well.stopDepth,
              step: well.step,
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="End Depth (ft)"
            type="number"
            value={endDepth}
            onChange={(e) => setEndDepth(parseFloat(e.target.value))}
            inputProps={{
              min: well.startDepth,
              max: well.stopDepth,
              step: well.step,
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            startIcon={<PsychologyIcon />}
            onClick={handleInterpret}
            disabled={loading || selectedCurves.length === 0}
            sx={{ height: '56px' }}
          >
            {loading ? 'Analyzing...' : 'Interpret'}
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>
            Generating AI interpretation... This may take a moment.
          </Typography>
        </Box>
      )}

      {result && !loading && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Interpretation Results
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Well Name
              </Typography>
              <Typography variant="body2">{result.wellName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Depth Range
              </Typography>
              <Typography variant="body2">
                {result.depthRange.start} - {result.depthRange.end} ft
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Analyzed Curves
              </Typography>
              <Typography variant="body2">{result.curves.join(', ')}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Data Points
              </Typography>
              <Typography variant="body2">{result.dataPoints}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          {result.statistics && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Statistical Summary
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(result.statistics).map(([curve, stats]) => (
                  stats && (
                    <Grid item xs={12} sm={6} md={4} key={curve}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {curve}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Min: {stats.min?.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Max: {stats.max?.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Mean: {stats.mean?.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Count: {stats.count}
                        </Typography>
                      </Paper>
                    </Grid>
                  )
                ))}
              </Grid>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Geological Interpretation
          </Typography>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1,
              '& h1': { fontSize: '1.5rem', mt: 2, mb: 1, fontWeight: 600 },
              '& h2': { fontSize: '1.25rem', mt: 2, mb: 1, fontWeight: 600 },
              '& h3': { fontSize: '1.1rem', mt: 1.5, mb: 1, fontWeight: 600 },
              '& p': { mb: 1, lineHeight: 1.6 },
              '& ul, & ol': { mb: 1, pl: 3 },
              '& li': { mb: 0.5 },
              '& strong': { fontWeight: 600 },
            }}
          >
            <ReactMarkdown>{result.interpretation}</ReactMarkdown>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Generated at: {new Date(result.timestamp).toLocaleString()}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default AIInterpretation;
