const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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
    const keywords = `${mode},${prompt}`.replace(/\s+/g, ',');
    const imageUrl = `https://loremflickr.com/800/600/${encodeURIComponent(keywords)}`;
    res.json({ imageUrl });
  }, 1500);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
