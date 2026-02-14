const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { Well, WellData } = require('../models');
const LASParser = require('../utils/lasParser');
const { uploadToS3 } = require('../config/s3');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.originalname.toLowerCase().endsWith('.las')) {
      cb(null, true);
    } else {
      cb(new Error('Only LAS files are allowed'));
    }
  }
});

/**
 * Upload and process LAS file
 * POST /api/wells/upload
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const parser = new LASParser(fileContent);
    const parsed = parser.parse();
    const metadata = parser.getWellMetadata();

    // Upload to S3
    const s3FileName = `wells/${uuidv4()}_${req.file.originalname}`;
    let s3FileUrl = null;

    try {
      s3FileUrl = await uploadToS3(req.file.buffer, s3FileName, 'text/plain');
    } catch (s3Error) {
      console.warn('S3 upload failed, continuing without S3 storage:', s3Error.message);
      // Continue without S3 if it fails (for local testing)
    }

    // Create well record
    const well = await Well.create({
      wellName: metadata.wellName,
      company: metadata.company,
      field: metadata.field,
      location: metadata.location,
      country: metadata.country,
      state: metadata.state,
      uwi: metadata.uwi,
      api: metadata.api,
      startDepth: metadata.startDepth,
      stopDepth: metadata.stopDepth,
      step: metadata.step,
      nullValue: metadata.nullValue,
      dateAnalyzed: metadata.dateAnalyzed ? new Date(metadata.dateAnalyzed) : null,
      s3FileUrl: s3FileUrl,
      s3FileName: s3FileName,
      curves: parsed.curves,
      metadata: {
        version: parsed.version,
        totalDataPoints: parsed.data.length
      }
    });

    // Store well data in batches for better performance
    const batchSize = 1000;
    for (let i = 0; i < parsed.data.length; i += batchSize) {
      const batch = parsed.data.slice(i, i + batchSize);
      const dataRecords = batch.map(dataPoint => ({
        wellId: well.id,
        depth: dataPoint.Depth || dataPoint.DEPT,
        measurements: dataPoint
      }));
      await WellData.bulkCreate(dataRecords);
    }

    res.json({
      success: true,
      message: 'LAS file uploaded and processed successfully',
      well: {
        id: well.id,
        wellName: well.wellName,
        startDepth: well.startDepth,
        stopDepth: well.stopDepth,
        curveCount: parsed.curves.length,
        dataPointCount: parsed.data.length
      }
    });
  } catch (error) {
    console.error('Error uploading LAS file:', error);
    res.status(500).json({ 
      error: 'Failed to upload and process LAS file',
      message: error.message 
    });
  }
});

/**
 * Get all wells
 * GET /api/wells
 */
router.get('/', async (req, res) => {
  try {
    const wells = await Well.findAll({
      attributes: ['id', 'wellName', 'company', 'field', 'location', 'startDepth', 'stopDepth', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json(wells);
  } catch (error) {
    console.error('Error fetching wells:', error);
    res.status(500).json({ error: 'Failed to fetch wells' });
  }
});

/**
 * Get well by ID
 * GET /api/wells/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const well = await Well.findByPk(req.params.id);
    
    if (!well) {
      return res.status(404).json({ error: 'Well not found' });
    }

    res.json(well);
  } catch (error) {
    console.error('Error fetching well:', error);
    res.status(500).json({ error: 'Failed to fetch well details' });
  }
});

/**
 * Get curves for a well
 * GET /api/wells/:id/curves
 */
router.get('/:id/curves', async (req, res) => {
  try {
    const well = await Well.findByPk(req.params.id, {
      attributes: ['curves']
    });
    
    if (!well) {
      return res.status(404).json({ error: 'Well not found' });
    }

    res.json(well.curves);
  } catch (error) {
    console.error('Error fetching curves:', error);
    res.status(500).json({ error: 'Failed to fetch curves' });
  }
});

/**
 * Delete well
 * DELETE /api/wells/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const well = await Well.findByPk(req.params.id);
    
    if (!well) {
      return res.status(404).json({ error: 'Well not found' });
    }

    // Delete associated data
    await WellData.destroy({ where: { wellId: well.id } });
    
    // Delete well
    await well.destroy();

    res.json({ success: true, message: 'Well deleted successfully' });
  } catch (error) {
    console.error('Error deleting well:', error);
    res.status(500).json({ error: 'Failed to delete well' });
  }
});

module.exports = router;
