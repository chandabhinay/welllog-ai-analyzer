const express = require('express');
const router = express.Router();
const { WellData, Well } = require('../models');
const { Op } = require('sequelize');
const openai = require('../config/openai');

/**
 * Perform AI-based interpretation on well data
 * POST /api/ai/interpret
 */
router.post('/interpret', async (req, res) => {
  try {
    const { wellId, curves, startDepth, endDepth } = req.body;

    if (!wellId || !curves || curves.length === 0) {
      return res.status(400).json({ error: 'wellId and curves are required' });
    }

    // Fetch well data
    const query = {
      where: {
        wellId,
        depth: {
          [Op.between]: [parseFloat(startDepth), parseFloat(endDepth)]
        }
      },
      order: [['depth', 'ASC']],
      limit: 500 // Limit for AI processing
    };

    const data = await WellData.findAll(query);
    const well = await Well.findByPk(wellId);

    if (!well) {
      return res.status(404).json({ error: 'Well not found' });
    }

    // Calculate statistics
    const statistics = {};
    curves.forEach(curveName => {
      const values = data
        .map(d => d.measurements[curveName])
        .filter(v => v !== null && v !== undefined && v !== well.nullValue);

      if (values.length > 0) {
        const sum = values.reduce((acc, val) => acc + val, 0);
        const mean = sum / values.length;
        statistics[curveName] = {
          min: Math.min(...values),
          max: Math.max(...values),
          mean: mean,
          count: values.length
        };
      }
    });

    // Sample data points for AI analysis (every 10th point)
    const sampledData = data.filter((_, index) => index % 10 === 0).slice(0, 50);
    const dataForAI = sampledData.map(d => {
      const point = { depth: d.depth };
      curves.forEach(curve => {
        point[curve] = d.measurements[curve];
      });
      return point;
    });

    // Get curve descriptions
    const curveDescriptions = curves.map(curveName => {
      const curveInfo = well.curves.find(c => c.mnemonic === curveName);
      return `${curveName}: ${curveInfo?.description || 'No description'}`;
    }).join('\n');

    // Prepare prompt for AI
    const prompt = `You are a petroleum geologist analyzing well-log data. 

Well Information:
- Well Name: ${well.wellName}
- Location: ${well.location}
- Depth Range: ${startDepth} to ${endDepth} feet

Curves Being Analyzed:
${curveDescriptions}

Statistical Summary:
${JSON.stringify(statistics, null, 2)}

Sample Data Points:
${JSON.stringify(dataForAI.slice(0, 10), null, 2)}

Please provide a detailed interpretation of this well-log data including:
1. Key observations about the measured values and trends
2. Geological implications (rock types, fluid content, porosity, permeability indicators if applicable)
3. Any anomalies or notable features in the data
4. Potential hydrocarbon indicators if present
5. Recommendations for further analysis

Keep the interpretation professional and technical but accessible.`;

    // Call OpenAI API
    let interpretation = '';
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert petroleum geologist and petrophysicist specializing in well-log interpretation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      interpretation = completion.choices[0].message.content;
    } catch (aiError) {
      console.error('OpenAI API error:', aiError);
      
      // Fallback interpretation if OpenAI fails
      interpretation = generateFallbackInterpretation(well, curves, statistics, startDepth, endDepth);
    }

    res.json({
      wellId,
      wellName: well.wellName,
      depthRange: { start: startDepth, end: endDepth },
      curves,
      statistics,
      interpretation,
      dataPoints: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error performing AI interpretation:', error);
    res.status(500).json({ 
      error: 'Failed to perform AI interpretation',
      message: error.message 
    });
  }
});

/**
 * Generate fallback interpretation when AI is unavailable
 */
function generateFallbackInterpretation(well, curves, statistics, startDepth, endDepth) {
  let interpretation = `# Well Log Interpretation Report\n\n`;
  interpretation += `**Well:** ${well.wellName}\n`;
  interpretation += `**Depth Interval:** ${startDepth} - ${endDepth} feet\n\n`;
  interpretation += `## Analyzed Curves\n\n`;

  curves.forEach(curve => {
    const stats = statistics[curve];
    if (stats) {
      interpretation += `### ${curve}\n`;
      interpretation += `- Minimum: ${stats.min.toFixed(2)}\n`;
      interpretation += `- Maximum: ${stats.max.toFixed(2)}\n`;
      interpretation += `- Average: ${stats.mean.toFixed(2)}\n`;
      interpretation += `- Data Points: ${stats.count}\n\n`;
    }
  });

  interpretation += `## Observations\n\n`;
  interpretation += `The analyzed depth interval from ${startDepth} to ${endDepth} feet shows variations in the measured parameters. `;
  interpretation += `The selected curves provide insights into formation properties.\n\n`;
  interpretation += `**Note:** This is an automated statistical summary. For detailed geological interpretation, `;
  interpretation += `please consult with a petroleum geologist or petrophysicist.\n\n`;
  interpretation += `## Recommendations\n\n`;
  interpretation += `1. Cross-reference findings with additional well logs if available\n`;
  interpretation += `2. Compare with nearby wells in the field\n`;
  interpretation += `3. Consider core data if available for validation\n`;
  interpretation += `4. Perform detailed petrophysical analysis for reservoir characterization\n`;

  return interpretation;
}

module.exports = router;
