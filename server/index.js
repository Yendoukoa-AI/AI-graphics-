const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
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

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

app.post('/api/generate', async (req, res) => {
  const { prompt, mode } = req.body;

  if (!prompt || !mode) {
    return res.status(400).json({ error: 'Prompt and mode are required' });
  }

  const keywords = `${mode},${prompt}`.replace(/\s+/g, ',');
  let imageUrl = `https://loremflickr.com/800/600/${encodeURIComponent(keywords)}`;
  let videoUrl = mode === 'video' ? 'https://www.w3schools.com/html/mov_bbb.mp4' : null;

  if (videoUrl) {
    imageUrl = null;
  }

  try {
    let insight = '';

    // Attempt to use Google AI for insight if API key is provided
    if (process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your_api_key_here') {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const aiPrompt = `As a design expert, provide a short, inspiring design insight (2 sentences) for the following ${mode} request: "${prompt}"`;

      const result = await model.generateContent(aiPrompt);
      const response = await result.response;
      insight = response.text();
    } else {
      insight = `Simulated insight for ${mode}: Great choice! This will look amazing.`;
    }

    res.json({
      imageUrl,
      videoUrl,
      insight,
      mode
    });
  } catch (error) {
    console.error('Error with Google AI API:', error);
    // Fallback to simple response if AI fails
    res.json({
      imageUrl,
      videoUrl,
      insight: `Design insight: Focus on balance and typography for your ${mode} project.`,
      mode,
      error: 'Google AI API error, using fallback'
    });
  }
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
