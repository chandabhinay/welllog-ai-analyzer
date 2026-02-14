import React, { useState } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ChatIcon from '@mui/icons-material/Chat';
import Chatbot from './Chatbot';
import AIInterpretation from './AIInterpretation';

function FloatingAIAssistant({ well, curves }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [interpretOpen, setInterpretOpen] = useState(false);

  return (
    <>
      {/* Floating Chatbot Button */}
      <Tooltip title="AI Chatbot" placement="left">
        <Fab
          color="secondary"
          aria-label="chatbot"
          onClick={() => setChatOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            width: 56,
            height: 56,
            boxShadow: 3,
            '&:hover': {
              transform: 'scale(1.1)',
              transition: 'transform 0.2s',
            },
          }}
        >
          <ChatIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Tooltip>

      {/* Floating AI Interpretation Button */}
      <Tooltip title="AI Interpretation" placement="left">
        <Fab
          color="primary"
          aria-label="ai-interpretation"
          onClick={() => setInterpretOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 96,
            right: 24,
            zIndex: 1000,
            width: 56,
            height: 56,
            boxShadow: 3,
            '&:hover': {
              transform: 'scale(1.1)',
              transition: 'transform 0.2s',
            },
          }}
        >
          <PsychologyIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Tooltip>

      {/* Chatbot Dialog */}
      <Dialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: 700,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChatIcon color="secondary" />
            AI Chatbot
          </Box>
          <IconButton onClick={() => setChatOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, overflow: 'auto' }}>
          <Chatbot well={well} />
        </DialogContent>
      </Dialog>

      {/* AI Interpretation Dialog */}
      <Dialog
        open={interpretOpen}
        onClose={() => setInterpretOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: 700,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon color="primary" />
            AI Interpretation
          </Box>
          <IconButton onClick={() => setInterpretOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, overflow: 'auto' }}>
          <AIInterpretation well={well} curves={curves} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FloatingAIAssistant;
