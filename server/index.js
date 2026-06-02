const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/generate', (req, res) => {
  const { prompt, mode } = req.body;

  if (!prompt || !mode) {
    return res.status(400).json({ error: 'Prompt and mode are required' });
  }

  // Simulate AI generation delay
  setTimeout(() => {
    if (mode === 'video') {
      // Return a sample video URL for demonstration
      res.json({ videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' });
    } else {
      const keywords = `${mode},${prompt}`.replace(/\s+/g, ',');
      const imageUrl = `https://loremflickr.com/800/600/${encodeURIComponent(keywords)}`;
      res.json({ imageUrl });
    }
  }, 1500);
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
