const express = require('express');
const router = express.Router();
const { WellData, Well } = require('../models');
const { Op } = require('sequelize');

/**
 * Get well data for specific curves and depth range
 * POST /api/data/query
 */
router.post('/query', async (req, res) => {
  try {
    const { wellId, curves, startDepth, endDepth, limit = 10000 } = req.body;

    if (!wellId) {
      return res.status(400).json({ error: 'wellId is required' });
    }

    // Build query
    const query = {
      where: { wellId },
      order: [['depth', 'ASC']],
      limit: parseInt(limit)
    };

    // Add depth range filter
    if (startDepth !== undefined && endDepth !== undefined) {
      query.where.depth = {
        [Op.between]: [parseFloat(startDepth), parseFloat(endDepth)]
      };
    } else if (startDepth !== undefined) {
      query.where.depth = { [Op.gte]: parseFloat(startDepth) };
    } else if (endDepth !== undefined) {
      query.where.depth = { [Op.lte]: parseFloat(endDepth) };
    }

    const data = await WellData.findAll(query);

    // Filter curves if specified
    let processedData = data.map(d => ({
      depth: d.depth,
      measurements: d.measurements
    }));

    if (curves && curves.length > 0) {
      processedData = processedData.map(point => {
        const filtered = { depth: point.depth };
        curves.forEach(curve => {
          if (point.measurements[curve] !== undefined) {
            filtered[curve] = point.measurements[curve];
          }
        });
        return filtered;
      });
    }

    res.json({
      wellId,
      startDepth: startDepth || data[0]?.depth,
      endDepth: endDepth || data[data.length - 1]?.depth,
      dataPoints: processedData.length,
      data: processedData
    });
  } catch (error) {
    console.error('Error querying well data:', error);
    res.status(500).json({ error: 'Failed to query well data' });
  }
});

/**
 * Get statistics for specific curves
 * POST /api/data/statistics
 */
router.post('/statistics', async (req, res) => {
  try {
    const { wellId, curves, startDepth, endDepth } = req.body;

    if (!wellId || !curves || curves.length === 0) {
      return res.status(400).json({ error: 'wellId and curves are required' });
    }

    // Build query
    const query = { where: { wellId } };

    // Add depth range filter
    if (startDepth !== undefined && endDepth !== undefined) {
      query.where.depth = {
        [Op.between]: [parseFloat(startDepth), parseFloat(endDepth)]
      };
    }

    const data = await WellData.findAll(query);
    const well = await Well.findByPk(wellId);

    // Calculate statistics for each curve
    const statistics = {};
    
    curves.forEach(curveName => {
      const values = data
        .map(d => d.measurements[curveName])
        .filter(v => v !== null && v !== undefined && v !== well.nullValue);

      if (values.length > 0) {
        values.sort((a, b) => a - b);
        
        const sum = values.reduce((acc, val) => acc + val, 0);
        const mean = sum / values.length;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        statistics[curveName] = {
          count: values.length,
          min: values[0],
          max: values[values.length - 1],
          mean: mean,
          median: values[Math.floor(values.length / 2)],
          stdDev: stdDev,
          p25: values[Math.floor(values.length * 0.25)],
          p75: values[Math.floor(values.length * 0.75)]
        };
      } else {
        statistics[curveName] = null;
      }
    });

    res.json({
      wellId,
      startDepth,
      endDepth,
      totalDataPoints: data.length,
      statistics
    });
  } catch (error) {
    console.error('Error calculating statistics:', error);
    res.status(500).json({ error: 'Failed to calculate statistics' });
  }
});

/**
 * Get depth range for a well
 * GET /api/data/depth-range/:wellId
 */
router.get('/depth-range/:wellId', async (req, res) => {
  try {
    const well = await Well.findByPk(req.params.wellId, {
      attributes: ['startDepth', 'stopDepth', 'step']
    });

    if (!well) {
      return res.status(404).json({ error: 'Well not found' });
    }

    res.json({
      startDepth: well.startDepth,
      stopDepth: well.stopDepth,
      step: well.step
    });
  } catch (error) {
    console.error('Error fetching depth range:', error);
    res.status(500).json({ error: 'Failed to fetch depth range' });
  }
});

module.exports = router;
