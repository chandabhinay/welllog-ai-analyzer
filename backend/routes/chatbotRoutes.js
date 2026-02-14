const express = require('express');
const router = express.Router();
const { WellData, Well } = require('../models');
const { Op } = require('sequelize');
const openai = require('../config/openai');

/**
 * Chatbot endpoint for conversational queries about well data
 * POST /api/chatbot/query
 */
router.post('/query', async (req, res) => {
  try {
    const { wellId, message, conversationHistory = [] } = req.body;

    if (!wellId || !message) {
      return res.status(400).json({ error: 'wellId and message are required' });
    }

    // Fetch well information
    const well = await Well.findByPk(wellId);
    if (!well) {
      return res.status(404).json({ error: 'Well not found' });
    }

    // Get data statistics for context
    const dataCount = await WellData.count({ where: { wellId } });
    
    // Sample some data points for context
    const sampleData = await WellData.findAll({
      where: { wellId },
      order: [['depth', 'ASC']],
      limit: 100
    });

    // Build context about the well
    const contextInfo = `
You are an AI assistant helping analyze well-log data. Here's information about the current well:

Well Information:
- Name: ${well.wellName}
- Company: ${well.company || 'N/A'}
- Field: ${well.field || 'N/A'}
- Location: ${well.location || 'N/A'}
- Country: ${well.country || 'N/A'}
- Depth Range: ${well.startDepth} to ${well.stopDepth} feet
- Step Size: ${well.step} feet
- Total Data Points: ${dataCount}

Available Curves (${well.curves.length}):
${well.curves.map(c => `- ${c.mnemonic}: ${c.description}`).slice(0, 20).join('\n')}
${well.curves.length > 20 ? `... and ${well.curves.length - 20} more curves` : ''}

You can help users:
1. Understand what data is available
2. Explain what specific curves measure
3. Provide insights about depth ranges
4. Suggest curves for specific types of analysis
5. Explain geological concepts related to well logging
6. Guide users on how to visualize the data

Answer questions clearly and concisely. If the user asks about specific data values, remind them to use the visualization and interpretation tools for detailed analysis.
`;

    // Build conversation messages
    const messages = [
      {
        role: 'system',
        content: contextInfo
      }
    ];

    // Add conversation history (limit to last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    // Call OpenAI API
    let response = '';
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: messages,
        temperature: 0.7,
        max_tokens: 800
      });

      response = completion.choices[0].message.content;
    } catch (aiError) {
      console.error('OpenAI API error:', aiError);
      
      // Fallback response
      response = handleFallbackQuery(message, well);
    }

    res.json({
      wellId,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing chatbot query:', error);
    res.status(500).json({ 
      error: 'Failed to process query',
      message: error.message 
    });
  }
});

/**
 * Fallback query handler when AI is unavailable
 */
function handleFallbackQuery(message, well) {
  const lowerMessage = message.toLowerCase();

  // Handle common queries
  if (lowerMessage.includes('curves') || lowerMessage.includes('available')) {
    return `This well has ${well.curves.length} curves available:\n\n${well.curves.slice(0, 15).map(c => `• ${c.mnemonic}: ${c.description}`).join('\n')}\n\n${well.curves.length > 15 ? `...and ${well.curves.length - 15} more curves.` : ''}`;
  }

  if (lowerMessage.includes('depth')) {
    return `The well data spans from ${well.startDepth} to ${well.stopDepth} feet, with measurements taken every ${well.step} feet. That's approximately ${Math.round((well.stopDepth - well.startDepth) / well.step)} data points.`;
  }

  if (lowerMessage.includes('where') || lowerMessage.includes('location')) {
    return `Well ${well.wellName} is located at ${well.location || 'location not specified'} in ${well.country || 'country not specified'}.`;
  }

  if (lowerMessage.includes('what') || lowerMessage.includes('explain')) {
    return `I can help you understand the well data! This well contains ${well.curves.length} different measurements (curves) recorded at various depths. Each curve represents different physical properties of the rock formation. You can visualize these curves using the chart interface or request AI interpretation for specific depth ranges.`;
  }

  // Default response
  return `I'm here to help you analyze well "${well.wellName}". You can ask me about:\n\n• Available curves and what they measure\n• Depth ranges and data coverage\n• Well location and metadata\n• How to interpret specific measurements\n• Suggestions for analysis\n\nWhat would you like to know?`;
}

module.exports = router;
