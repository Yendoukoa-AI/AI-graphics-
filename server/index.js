const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatAnthropic } = require('@langchain/anthropic');
const { HumanMessage } = require('@langchain/core/messages');
const { Octokit } = require('octokit');
const { google } = require('googleapis');
const puppeteer = require('puppeteer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Shared Puppeteer browser instance for efficiency
let sharedBrowser = null;
const getBrowser = async () => {
  if (!sharedBrowser || !sharedBrowser.connected) {
    sharedBrowser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }
  return sharedBrowser;
};

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'designai-studio-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport Google Strategy
const isGoogleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const isFacebookConfigured = !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);

if (isGoogleConfigured) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      proxy: true
    },
    (accessToken, refreshToken, profile, done) => {
      // In a real app, you would find or create a user in your database here
      return done(null, profile);
    }
  ));
}

if (isFacebookConfigured) {
  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'photos', 'email'],
      proxy: true
    },
    (accessToken, refreshToken, profile, done) => {
      // Store the access token if needed for Graph API calls later
      profile.accessToken = accessToken;
      return done(null, profile);
    }
  ));
}

passport.serializeUser((user, done) => {
  // Store only the essential info in the session
  done(null, {
    id: user.id,
    displayName: user.displayName,
    photos: user.photos,
    emails: user.emails,
    accessToken: user.accessToken // Crucial for Facebook Graph API calls
  });
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/shopline/products', async (req, res) => {
  const accessToken = process.env.SHOPLINE_ACCESS_TOKEN;
  const storeDomain = process.env.SHOPLINE_STORE_DOMAIN;

  if (!accessToken || !storeDomain) {
    // Return mock data if credentials are not set for easier demo
    return res.json({
      products: [
        { id: '1', title: 'Avenue T-Shirt', handle: 'avenue-t-shirt', image: 'https://loremflickr.com/200/200/tshirt' },
        { id: '2', title: 'Summer Sneakers', handle: 'summer-sneakers', image: 'https://loremflickr.com/200/200/sneakers' },
        { id: '3', title: 'Pro Headphones', handle: 'pro-headphones', image: 'https://loremflickr.com/200/200/headphones' },
        { id: '4', title: 'Cinematic Camera', handle: 'cinematic-camera', image: 'https://loremflickr.com/200/200/camera' },
        { id: '5', title: 'Studio Microphone', handle: 'studio-microphone', image: 'https://loremflickr.com/200/200/microphone' }
      ],
      isMock: true
    });
  }

  try {
    const response = await axios.get(`https://${storeDomain}/admin/api/2022-01/products.json`, {
      headers: {
        'X-SHOPLINE-Access-Token': accessToken,
      },
    });
    res.json({ products: response.data.products });
  } catch (error) {
    console.error('Error fetching Shopline products:', error.message);
    res.status(500).json({ error: 'Failed to fetch Shopline products' });
  }
});

// Initialize LangChain ChatGoogleGenerativeAI (Google AI Studio)
const googleModel = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.GOOGLE_AI_API_KEY || 'dummy_key',
});

// Initialize LangChain ChatAnthropic (Claude)
const claudeModel = new ChatAnthropic({
  model: "claude-3-5-sonnet-20240620",
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
});

app.post('/api/generate', async (req, res) => {
  const { prompt, mode, product, provider = 'google' } = req.body;

  if (!prompt || !mode) {
    return res.status(400).json({ error: 'Prompt and mode are required' });
  }

  const keywords = product ? `${product.title},${prompt}` : `${mode},${prompt}`;
  let imageUrl = `https://loremflickr.com/800/600/${encodeURIComponent(keywords.replace(/\s+/g, ','))}`;
  let videoUrl = (mode === 'video' || mode === 'cinema') ? 'https://www.w3schools.com/html/mov_bbb.mp4' : null;

  if (videoUrl) {
    imageUrl = null;
  }

  try {
    let insight = '';

    // Attempt to use LangChain for insight if API key is provided
    const hasGoogleKey = process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your_api_key_here';
    const hasClaudeKey = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';

    if ((provider === 'google' && hasGoogleKey) || (provider === 'claude' && hasClaudeKey)) {
      const chatModel = provider === 'claude' ? claudeModel : googleModel;
      let aiPrompt = `As a design expert, provide a short, inspiring design insight (2 sentences) for the following ${mode} request: "${prompt}"`;

      if (mode === 'shopline' && product) {
        aiPrompt = `As an e-commerce and dropshipping expert, provide a short, inspiring insight (2 sentences) for a product promotion. Product: "${product.title}". Request: "${prompt}"`;
      } else if (mode === 'cinema') {
        aiPrompt = `As a cinematography expert, provide a short, professional insight (2 sentences) for this shot/scene request: "${prompt}"`;
      } else if (mode === 'music') {
        aiPrompt = `As a music producer, provide a short, inspiring insight (2 sentences) for this audio/music request: "${prompt}"`;
      } else if (mode === 'entertainment') {
        aiPrompt = `As a global entertainment industry expert, provide a short, strategic insight (2 sentences) for this project: "${prompt}"`;
      } else if (mode === 'ad-creative') {
        aiPrompt = `As an expert ad creative director, provide a short, high-conversion insight (2 sentences) for this advertisement request: "${prompt}"`;
      } else if (mode === 'web') {
        aiPrompt = `As a professional web designer, provide a short, strategic insight (2 sentences) for this layout request: "${prompt}"`;
      } else if (mode === 'mobile') {
        aiPrompt = `As a mobile UI/UX design expert, provide a short, professional insight (2 sentences) for this mobile app/interface request: "${prompt}"`;
      } else if (mode === 'desktop') {
        aiPrompt = `As a desktop software interface design expert, provide a short, strategic insight (2 sentences) for this application layout request: "${prompt}"`;
      } else if (mode === 'graphics') {
        aiPrompt = `As a graphic design expert, provide a short, professional insight (2 sentences) for this graphic request: "${prompt}"`;
      } else if (mode === 'posters') {
        aiPrompt = `As a professional poster designer, provide a short, artistic insight (2 sentences) for this poster request: "${prompt}"`;
      } else if (mode === 'games') {
        aiPrompt = `As a game design and development expert, provide a short, strategic insight (2 sentences) for this game-related request: "${prompt}"`;
      } else if (mode === 'automotive') {
        aiPrompt = `As an automotive and aerospace design expert, provide a short, technical and inspiring insight (2 sentences) for this vehicle/aircraft concept: "${prompt}"`;
      } else if (mode === 'dropshipper') {
        aiPrompt = `As a dropshipping and e-commerce expert, provide a short, strategic insight (2 sentences) for this product discovery or marketing request: "${prompt}"`;
      } else if (mode === 'telecoms') {
        aiPrompt = `As a telecommunications infrastructure and network expert, provide a short, technical and strategic insight (2 sentences) for this request: "${prompt}"`;
      } else if (mode === 'medias') {
        aiPrompt = `As a media production and broadcasting expert, provide a short, professional insight (2 sentences) for this request: "${prompt}"`;
      } else if (mode === 'social-networks') {
        aiPrompt = `As a social media strategist and content creator, provide a short, high-engagement insight (2 sentences) for this request: "${prompt}"`;
      } else if (mode === 'github') {
        aiPrompt = `As a GitHub ecosystem and open source expert, provide a short, professional insight (2 sentences) for this GitHub Pages or repository request: "${prompt}"`;
      } else if (mode === 'sports') {
        aiPrompt = `As a sports branding and performance analytics expert, provide a short, professional insight (2 sentences) for this sports-related request: "${prompt}"`;
      } else if (mode === 'health') {
        aiPrompt = `As a medical interface and healthcare design expert, provide a short, professional and precise insight (2 sentences) for this health-related request: "${prompt}"`;
      } else if (mode === 'finance') {
        aiPrompt = `As a finance AI expert for banks, insurance, VC, fintechs, and mobile operators, provide a short, professional and strategic marketing/product insight (2 sentences) for this request: "${prompt}"`;
      } else if (mode === 'art-ai') {
        aiPrompt = `As a professional AI artist and digital painter, provide a short, inspiring insight (2 sentences) about the artistic style and technique for this request: "${prompt}"`;
      } else if (mode === 'education') {
        aiPrompt = `As a global education and ed-tech expert, provide a short, professional and strategic insight (2 sentences) for this educational design or content request: "${prompt}"`;
      } else if (mode === 'maps') {
        aiPrompt = `As a geographic design and cartography expert, provide a short, professional insight (2 sentences) for this map-related design request: "${prompt}"`;
      }

      const response = await chatModel.invoke([
        new HumanMessage(aiPrompt),
      ]);
      insight = response.content;
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

// Auth Routes
app.get('/auth/google', (req, res, next) => {
  if (!isGoogleConfigured) {
    return res.status(501).json({ error: 'Google OAuth not configured' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/auth/google/callback', (req, res, next) => {
  if (!isGoogleConfigured) {
    return res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
  passport.authenticate('google', { failureRedirect: '/' })(req, res, next);
}, (req, res) => {
  // Successful authentication, redirect home.
  res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
});

// Facebook Auth Routes
app.get('/auth/facebook', (req, res, next) => {
  if (!isFacebookConfigured) {
    return res.status(501).json({ error: 'Facebook OAuth not configured' });
  }
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })(req, res, next);
});

app.get('/auth/facebook/callback', (req, res, next) => {
  if (!isFacebookConfigured) {
    return res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
  passport.authenticate('facebook', { failureRedirect: '/' })(req, res, next);
}, (req, res) => {
  // Successful authentication, redirect home.
  res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
});

app.get('/auth/user', (req, res) => {
  res.json(req.user || null);
});

app.get('/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  });
});

app.post('/api/langflow', async (req, res) => {
  const { prompt } = req.body;
  const LANGFLOW_ID = process.env.LANGFLOW_ID;
  const FLOW_ID = process.env.FLOW_ID;
  const LANGFLOW_TOKEN = process.env.LANGFLOW_TOKEN;
  const LANGFLOW_BASE_URL = process.env.LANGFLOW_BASE_URL || 'https://api.langflow.astra.datastax.com';

  if (!LANGFLOW_ID || !FLOW_ID || !LANGFLOW_TOKEN) {
    return res.json({
      result: `LangFlow is not configured. (Mock) You said: ${prompt}`,
      isMock: true
    });
  }

  try {
    const response = await axios.post(
      `${LANGFLOW_BASE_URL}/lf/${LANGFLOW_ID}/api/v1/run/${FLOW_ID}`,
      {
        input_value: prompt,
        output_type: 'chat',
        input_type: 'chat',
      },
      {
        headers: {
          'Authorization': `Bearer ${LANGFLOW_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = response.data.outputs[0].outputs[0].results.message.text;
    res.json({ result });
  } catch (error) {
    console.error('Error calling LangFlow:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to communicate with LangFlow' });
  }
});

app.post('/api/github/deploy', async (req, res) => {
  const { prompt, mode } = req.body;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  if (!GITHUB_TOKEN) {
    return res.json({
      success: true,
      url: `https://github.com/username/design-ai-output-${Date.now()}`,
      isMock: true,
      message: 'GitHub Token not configured. This is a simulated deployment.'
    });
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  try {
    // 1. Create a repository
    const repoName = `design-ai-${Date.now()}`;
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      description: `Generated by DesignAI Studio: ${prompt}`,
      auto_init: true,
    });

    // 2. Create an index.html file with some basic content based on the prompt
    const content = `
<!DOCTYPE html>
<html>
<head>
    <title>DesignAI - ${mode}</title>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #0f172a; color: white; }
        .container { text-align: center; border: 1px solid #1e293b; padding: 2rem; border-radius: 1rem; background: rgba(30, 41, 59, 0.5); }
    </style>
</head>
<body>
    <div class="container">
        <h1>Generated Design for: ${prompt}</h1>
        <p>This is a live preview deployed via GitHub API.</p>
    </div>
</body>
</html>
    `;

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: repo.owner.login,
      repo: repoName,
      path: 'index.html',
      message: 'Initial commit from DesignAI Studio',
      content: Buffer.from(content).toString('base64'),
    });

    // 3. Enable GitHub Pages
    await octokit.rest.repos.createPagesSite({
      owner: repo.owner.login,
      repo: repoName,
      source: {
        branch: 'main',
        path: '/'
      }
    });

    res.json({
      success: true,
      url: `https://${repo.owner.login}.github.io/${repoName}/`,
      repoUrl: repo.html_url
    });
  } catch (error) {
    console.error('Error deploying to GitHub:', error);
    res.status(500).json({ error: 'Failed to deploy to GitHub', details: error.message });
  }
});

app.post('/api/github/copilot-suggestion', async (req, res) => {
  const { prompt, mode, provider = 'google' } = req.body;

  try {
    let suggestion = '';
    const hasGoogleKey = process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your_api_key_here';
    const hasClaudeKey = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';

    if ((provider === 'google' && hasGoogleKey) || (provider === 'claude' && hasClaudeKey)) {
      const chatModel = provider === 'claude' ? claudeModel : googleModel;
      const aiPrompt = `As GitHub Copilot, provide a snippet of high-quality React or CSS code that would enhance a "${mode}" project with the following description: "${prompt}". Also explain why this code helps.`;

      const response = await chatModel.invoke([
        new HumanMessage(aiPrompt),
      ]);
      suggestion = response.content;
    } else {
      suggestion = "GitHub Copilot Suggestion: Consider using a responsive grid layout with CSS glassmorphism to enhance the visual appeal of your GitHub Pages site.";
    }

    res.json({ suggestion });
  } catch (error) {
    console.error('Error getting Copilot suggestion:', error);
    res.status(500).json({ error: 'Failed to get Copilot suggestion' });
  }
});

app.post('/api/dropshipper/suggestions', async (req, res) => {
  const { niche, provider = 'google' } = req.body;

  if (!niche) {
    return res.status(400).json({ error: 'Niche is required' });
  }

  try {
    let suggestions = [];
    const hasGoogleKey = process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your_api_key_here';
    const hasClaudeKey = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';

    if ((provider === 'google' && hasGoogleKey) || (provider === 'claude' && hasClaudeKey)) {
      const chatModel = provider === 'claude' ? claudeModel : googleModel;
      const aiPrompt = `As an AI Dropshipping expert, suggest 3 trending products and a basic marketing strategy for the niche: "${niche}". Return the response as a JSON array of objects with "title", "reason", and "strategy" fields.`;

      const response = await chatModel.invoke([
        new HumanMessage(aiPrompt),
      ]);

      // Simple parsing of AI response if it's JSON-like
      try {
        const cleanedContent = response.content.replace(/```json|```/g, '').trim();
        suggestions = JSON.parse(cleanedContent);
      } catch (e) {
        // Fallback if AI doesn't return perfect JSON
        suggestions = [
          { title: `${niche} Pro Kit`, reason: 'High demand in current market', strategy: 'Influencer marketing on TikTok' },
          { title: `Eco-friendly ${niche}`, reason: 'Growing sustainability trend', strategy: 'Facebook Ads targeting eco-conscious users' },
          { title: `Smart ${niche} Gadget`, reason: 'Tech-savvy audience appeal', strategy: 'Email marketing and blog SEO' }
        ];
      }
    } else {
      suggestions = [
        { title: `${niche} Pro Kit`, reason: 'High demand in current market', strategy: 'Influencer marketing on TikTok' },
        { title: `Eco-friendly ${niche}`, reason: 'Growing sustainability trend', strategy: 'Facebook Ads targeting eco-conscious users' },
        { title: `Smart ${niche} Gadget`, reason: 'Tech-savvy audience appeal', strategy: 'Email marketing and blog SEO' }
      ];
    }

    res.json({ suggestions });
  } catch (error) {
    console.error('Error with Google AI API for dropshipper:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

app.get('/api/google/search', async (req, res) => {
  const { q } = req.query;
  const API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
  const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!API_KEY || !SEARCH_ENGINE_ID) {
    return res.json({
      items: [
        { title: `Mock Result for ${q}`, link: 'https://example.com', snippet: 'Google Search API is not configured. This is mock data.' },
        { title: 'Design Inspiration', link: 'https://dribbble.com', snippet: 'Check out Dribbble for amazing design ideas.' }
      ],
      isMock: true
    });
  }

  const customsearch = google.customsearch('v1');
  try {
    const response = await customsearch.cse.list({
      auth: API_KEY,
      cx: SEARCH_ENGINE_ID,
      q: q,
    });
    res.json({ items: response.data.items });
  } catch (error) {
    console.error('Error with Google Search API:', error);
    res.status(500).json({ error: 'Failed to fetch search results' });
  }
});

app.get('/api/google/places', async (req, res) => {
  const { q } = req.query;
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  if (!API_KEY) {
    return res.json({
      results: [
        { name: 'Mock Place', formatted_address: '123 AI Street, Tech City', geometry: { location: { lat: 37.7749, lng: -122.4194 } } }
      ],
      isMock: true
    });
  }

  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json`, {
      params: {
        query: q,
        key: API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error with Google Places API:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

app.post('/api/chrome/screenshot', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // SSRF Protection: Validate URL
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: 'Invalid protocol. Only http and https are allowed.' });
    }

    // Prevent access to localhost and private IPs
    const hostname = parsedUrl.hostname.toLowerCase();
    const privateIpPatterns = [
      /^localhost$/,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/
    ];

    if (privateIpPatterns.some(pattern => pattern.test(hostname))) {
      // In a real app, you might also want to resolve the hostname to IP to check
      return res.status(403).json({ error: 'Access to internal/private networks is restricted.' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format.' });
  }

  let page = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Set a strict timeout to prevent resource exhaustion
    await page.setDefaultNavigationTimeout(30000); // 30 seconds

    await page.setViewport({ width: 1280, height: 800 });

    // Navigate with a timeout and networkidle2 for stability
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const screenshot = await page.screenshot({
      encoding: 'base64',
      type: 'jpeg', // JPEG is usually smaller than PNG
      quality: 80
    });

    res.json({ screenshot: `data:image/jpeg;base64,${screenshot}` });
  } catch (error) {
    console.error('Error taking screenshot with Puppeteer:', error);
    res.status(500).json({ error: 'Failed to take screenshot', details: error.message });
  } finally {
    if (page) {
      await page.close().catch(console.error);
    }
  }
});

app.post('/api/facebook/post', async (req, res) => {
  if (!req.isAuthenticated() || !req.user.accessToken) {
    return res.status(401).json({ error: 'Not authenticated with Facebook' });
  }

  const { message, link } = req.body;

  try {
    const response = await axios.post(`https://graph.facebook.com/me/feed`, {
      message,
      link,
      access_token: req.user.accessToken
    });
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error posting to Facebook:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to post to Facebook', details: error.response?.data });
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
