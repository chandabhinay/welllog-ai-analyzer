import React, { useState, useEffect } from 'react';
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
  Chip,
  OutlinedInput,
} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import Plot from 'react-plotly.js';
import { dataAPI } from '../services/api';

function Visualization({ well, curves }) {
  const [selectedCurves, setSelectedCurves] = useState([]);
  const [startDepth, setStartDepth] = useState(well.startDepth);
  const [endDepth, setEndDepth] = useState(well.startDepth + 500); // Show first 500 ft by default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plotData, setPlotData] = useState([]);
  const [plotLayout, setPlotLayout] = useState({});

  useEffect(() => {
    // Select first few curves by default
    if (curves.length > 0) {
      const defaultCurves = curves.slice(0, 3).map(c => c.mnemonic);
      setSelectedCurves(defaultCurves);
    }
  }, [curves]);

  useEffect(() => {
    // Auto-load when curves are selected
    if (selectedCurves.length > 0) {
      loadData();
    }
  }, [selectedCurves]);

  const loadData = async () => {
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

      const response = await dataAPI.query({
        wellId: well.id,
        curves: selectedCurves,
        startDepth,
        endDepth,
        limit: 5000,
      });

      // Prepare data for Plotly
      const traces = selectedCurves.map((curveName, index) => {
        const xData = response.data.data.map(d => d[curveName]);
        const yData = response.data.data.map(d => d.depth);

        return {
          x: xData,
          y: yData,
          type: 'scatter',
          mode: 'lines',
          name: curveName,
          line: { width: 1.5 },
          xaxis: `x${index + 1}`,
          yaxis: 'y',
        };
      });

      // Create layout with multiple x-axes (one for each curve)
      const layout = {
        title: `Well Log - ${well.wellName}`,
        height: 800,
        yaxis: {
          title: 'Depth (ft)',
          autorange: 'reversed',
          side: 'right',
        },
        grid: {
          rows: 1,
          columns: selectedCurves.length,
          pattern: 'independent',
          roworder: 'top to bottom',
        },
        showlegend: true,
        legend: {
          orientation: 'h',
          y: -0.1,
        },
        margin: { t: 50, b: 100, l: 50, r: 100 },
      };

      // Add x-axes for each curve
      selectedCurves.forEach((curveName, index) => {
        const axisName = index === 0 ? 'xaxis' : `xaxis${index + 1}`;
        layout[axisName] = {
          title: curveName,
          domain: [index / selectedCurves.length, (index + 1) / selectedCurves.length - 0.02],
        };
      });

      setPlotData(traces);
      setPlotLayout(layout);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
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
            startIcon={<ShowChartIcon />}
            onClick={loadData}
            disabled={loading || selectedCurves.length === 0}
            sx={{ height: '56px' }}
          >
            {loading ? 'Loading...' : 'Visualize'}
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
        </Box>
      )}

      {plotData.length > 0 && !loading && (
        <Box sx={{ mt: 2, border: '1px solid #ddd', borderRadius: 1 }}>
          <Plot
            data={plotData}
            layout={plotLayout}
            config={{
              responsive: true,
              displayModeBar: true,
              modeBarButtonsToRemove: ['lasso2d', 'select2d'],
              displaylogo: false,
            }}
            style={{ width: '100%' }}
          />
        </Box>
      )}
    </Box>
  );
}

export default Visualization;
