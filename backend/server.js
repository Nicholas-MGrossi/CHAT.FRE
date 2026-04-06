const express = require('express');
const cors = require('cors');
require('dotenv').config();

const conversationRoutes = require('./routes/conversations');
const analysisRoutes = require('./routes/analysis');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'chatfree-backend' });
});

// Routes
app.use('/api/conversations', conversationRoutes);
app.use('/api/analyze', analysisRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

app.listen(PORT, () => {
  console.log(`ChatFree backend running on http://localhost:${PORT}`);
});
