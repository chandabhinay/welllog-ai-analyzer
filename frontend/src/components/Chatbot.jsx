import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactMarkdown from 'react-markdown';
import { chatbotAPI } from '../services/api';

function Chatbot({ well }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your AI assistant for analyzing well "${well.wellName}". I can help you understand the available data, explain measurements, and guide you through your analysis. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      setLoading(true);
      setError(null);

      // Prepare conversation history for API
      const conversationHistory = newMessages.slice(1).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await chatbotAPI.query({
        wellId: well.id,
        message: userMessage,
        conversationHistory,
      });

      // Add assistant response
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response.data.response },
      ]);
    } catch (err) {
      setError('Failed to get response: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Hello! I'm your AI assistant for analyzing well "${well.wellName}". I can help you understand the available data, explain measurements, and guide you through your analysis. What would you like to know?`,
      },
    ]);
    setError(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Ask questions about the well data, available curves, or get guidance on analysis.
        </Typography>
        <Button
          size="small"
          startIcon={<DeleteIcon />}
          onClick={handleClear}
        >
          Clear
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          height: 500,
          overflowY: 'auto',
          p: 2,
          mb: 2,
          bgcolor: 'grey.50',
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              mb: 2,
              flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
            }}
          >
            <Avatar
              sx={{
                bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                mx: 1,
              }}
            >
              {message.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
            </Avatar>
            <Paper
              sx={{
                p: 2,
                maxWidth: '70%',
                bgcolor: message.role === 'user' ? 'primary.light' : 'background.paper',
                color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
              }}
            >
              <Box
                sx={{
                  '& p': { mb: 0.5, mt: 0.5 },
                  '& ul, & ol': { mb: 0.5, pl: 2 },
                  '& li': { mb: 0.25 },
                  '& strong': { fontWeight: 600 },
                  '& h1, & h2, & h3': { fontSize: '1rem', fontWeight: 600, mt: 0.5, mb: 0.5 },
                }}
              >
                {message.role === 'user' ? (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {message.content}
                  </Typography>
                ) : (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                )}
              </Box>
            </Paper>
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', mx: 1 }}>
              <SmartToyIcon />
            </Avatar>
            <Paper sx={{ p: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="caption" sx={{ ml: 1 }}>
                Thinking...
              </Typography>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Ask a question about the well data..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleSend}
          disabled={loading || !input.trim()}
          sx={{ minWidth: 100 }}
        >
          Send
        </Button>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Example questions:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {[
            'What curves are available?',
            'What does HC1 measure?',
            'What depth range is covered?',
            'Suggest curves for hydrocarbon analysis',
          ].map((example, index) => (
            <Button
              key={index}
              size="small"
              variant="outlined"
              onClick={() => setInput(example)}
              disabled={loading}
            >
              {example}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default Chatbot;
