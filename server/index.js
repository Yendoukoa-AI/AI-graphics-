const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatAnthropic } = require('@langchain/anthropic');
const { ChatOpenAI } = require('@langchain/openai');
const OpenAI = require('openai');
const { HfInference } = require('@huggingface/inference');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { createClient } = require('@supabase/supabase-js');
const { Octokit } = require('octokit');
const { google } = require('googleapis');
const puppeteer = require('puppeteer');
const multer = require('multer');
const fs = require('fs');
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

// Mock user database
const users = [];

// Passport Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = users.find(u => u.email === email);
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

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
    email: user.email,
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

// Initialize LangChain ChatOpenAI for OpenRouter
const openRouterModel = new ChatOpenAI({
  modelName: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free",
  openAIApiKey: process.env.OPENROUTER_API_KEY || 'dummy_key',
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.FRONTEND_URL || 'http://localhost:3000',
      "X-Title": "DesignAI Studio",
    }
  }
});

// Initialize Hugging Face Inference
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Initialize OpenAI client for DALL-E and other direct API calls
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

// Configure Multer for file uploads
const UPLOADS_DIR = 'uploads/';
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
const upload = multer({ dest: UPLOADS_DIR });

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

app.post('/api/generate', async (req, res) => {
  const { prompt, mode, product, provider = 'google', useRAG = false, fineTunedModel = null } = req.body;

  if (!prompt || !mode) {
    return res.status(400).json({ error: 'Prompt and mode are required' });
  }

  let imageUrl = null;
  let videoUrl = (mode === 'video' || mode === 'cinema') ? 'https://www.w3schools.com/html/mov_bbb.mp4' : null;

  try {
    // 1. Generate Image if not a video mode
    if (!videoUrl) {
      if (provider === 'openai' && process.env.OPENAI_API_KEY) {
        try {
          const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: `Professional high-quality design for: ${mode}, ${prompt}`,
            n: 1,
            size: "1024x1024",
          });
          imageUrl = response.data[0].url;
        } catch (e) {
          console.error('DALL-E generation failed, falling back to loremflickr:', e.message);
        }
      } else if (provider === 'huggingface' && process.env.HUGGINGFACE_API_KEY) {
        try {
          const response = await hf.textToImage({
            model: 'stabilityai/stable-diffusion-xl-base-1.0',
            inputs: `${mode} design: ${prompt}`,
          });
          // Convert Blob to Base64 for easier transport
          const buffer = Buffer.from(await response.arrayBuffer());
          imageUrl = `data:image/png;base64,${buffer.toString('base64')}`;
        } catch (e) {
          console.error('Hugging Face image generation failed, falling back to loremflickr:', e.message);
        }
      }

      // Fallback to loremflickr if no AI image was generated
      if (!imageUrl) {
        const keywords = product ? `${product.title},${prompt}` : `${mode},${prompt}`;
        const tagString = keywords.replace(/\s+/g, ',').split(',').map(tag => encodeURIComponent(tag)).join(',');
        imageUrl = `https://loremflickr.com/800/600/${tagString}`;
      }
    }

    let insight = '';

    // Attempt to use LangChain for insight if API key is provided
    const hasGoogleKey = process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your_api_key_here';
    const hasClaudeKey = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';
    const hasOpenRouterKey = process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here';
    const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key';

    if ((provider === 'google' && hasGoogleKey) || (provider === 'claude' && hasClaudeKey) || (provider === 'openrouter' && hasOpenRouterKey) || (provider === 'openai' && hasOpenAIKey)) {
      let chatModel;
      if (provider === 'claude') {
        chatModel = claudeModel;
      } else if (provider === 'openrouter') {
        chatModel = openRouterModel;
      } else if (provider === 'openai') {
        chatModel = new ChatOpenAI({
          openAIApiKey: process.env.OPENAI_API_KEY,
          modelName: fineTunedModel || 'gpt-3.5-turbo'
        });
      } else {
        chatModel = googleModel;
      }
      let systemPrompt = "You are a professional design expert.";
      let humanPrompt = `Provide a short, inspiring design insight (2 sentences) for the following ${mode} request: "${prompt}"`;

      if (mode === 'shopline' && product) {
        systemPrompt = "You are an e-commerce and dropshipping expert.";
        humanPrompt = `Provide a short, inspiring insight (2 sentences) for a product promotion. Product: "${product.title}". Request: "${prompt}"`;
      } else if (mode === 'cinema') {
        systemPrompt = "You are a cinematography expert.";
        humanPrompt = `Provide a short, professional insight (2 sentences) for this shot/scene request: "${prompt}"`;
      } else if (mode === 'music') {
        systemPrompt = "You are a professional music producer.";
        humanPrompt = `Provide a short, inspiring insight (2 sentences) for this audio/music request: "${prompt}"`;
      } else if (mode === 'entertainment') {
        systemPrompt = "You are a global entertainment industry expert.";
        humanPrompt = `Provide a short, strategic insight (2 sentences) for this project: "${prompt}"`;
      } else if (mode === 'ad-creative') {
        systemPrompt = "You are an expert ad creative director.";
        humanPrompt = `Provide a short, high-conversion insight (2 sentences) for this advertisement request: "${prompt}"`;
      } else if (mode === 'web') {
        systemPrompt = "You are a professional web designer.";
        humanPrompt = `Provide a short, strategic insight (2 sentences) for this layout request: "${prompt}"`;
      } else if (mode === 'mobile') {
        systemPrompt = "You are a mobile UI/UX design expert.";
        humanPrompt = `Provide a short, professional insight (2 sentences) for this mobile app/interface request: "${prompt}"`;
      } else if (mode === 'desktop') {
        systemPrompt = "You are a desktop software interface design expert.";
        humanPrompt = `Provide a short, strategic insight (2 sentences) for this application layout request: "${prompt}"`;
      } else if (mode === 'graphics') {
        systemPrompt = "You are a graphic design expert.";
        humanPrompt = `Provide a short, professional insight (2 sentences) for this graphic request: "${prompt}"`;
      } else if (mode === 'posters') {
        systemPrompt = "You are a professional poster designer.";
        humanPrompt = `Provide a short, artistic insight (2 sentences) for this poster request: "${prompt}"`;
      } else if (mode === 'games') {
        systemPrompt = "You are a game design and development expert.";
        humanPrompt = `Provide a short, strategic insight (2 sentences) for this game-related request: "${prompt}"`;
      } else if (mode === 'automotive') {
        systemPrompt = "You are an automotive and aerospace design expert.";
        humanPrompt = `Provide a short, technical and inspiring insight (2 sentences) for this vehicle/aircraft concept: "${prompt}"`;
      } else if (mode === 'dropshipper') {
        systemPrompt = "You are a dropshipping and e-commerce expert.";
        humanPrompt = `Provide a short, strategic insight (2 sentences) for this product discovery or marketing request: "${prompt}"`;
      } else if (mode === 'telecoms') {
        systemPrompt = "You are a telecommunications infrastructure and network expert.";
        humanPrompt = `Provide a short, technical and strategic insight (2 sentences) for this request: "${prompt}"`;
      } else if (mode === 'medias') {
        systemPrompt = "You are a media production and broadcasting expert.";
        humanPrompt = `Provide a short, professional insight (2 sentences) for this request: "${prompt}"`;
      } else if (mode === 'social-networks') {
        systemPrompt = "You are a social media strategist and content creator.";
        humanPrompt = `Provide a short, high-engagement insight (2 sentences) for this request: "${prompt}"`;
      } else if (mode === 'github') {
        systemPrompt = "You are a GitHub ecosystem and open source expert.";
        humanPrompt = `Provide a short, professional insight (2 sentences) for this GitHub Pages or repository request: "${prompt}"`;
      } else if (mode === 'sports') {
        systemPrompt = "You are a sports branding and performance analytics expert.";
        humanPrompt = `Provide a short, professional insight (2 sentences) for this sports-related request: "${prompt}"`;
      } else if (mode === 'health') {
        systemPrompt = "You are a medical interface and healthcare design expert.";
        humanPrompt = `Provide a short, professional and precise insight (2 sentences) for this health-related request: "${prompt}"`;
      } else if (mode === 'finance') {
        systemPrompt = "You are a finance AI expert for banks, insurance, VC, fintechs, and mobile operators.";
        humanPrompt = `Provide a short, professional and strategic marketing/product insight (2 sentences) for this request: "${prompt}"`;
      } else if (mode === 'art-ai') {
        systemPrompt = "You are a professional AI artist and digital painter.";
        humanPrompt = `Provide a short, inspiring insight (2 sentences) about the artistic style and technique for this request: "${prompt}"`;
      } else if (mode === 'education') {
        systemPrompt = "You are a global education and ed-tech expert.";
        humanPrompt = `Provide a short, professional and strategic insight (2 sentences) for this educational design or content request: "${prompt}"`;
      } else if (mode === 'maps') {
        systemPrompt = "You are a geographic design and cartography expert.";
        humanPrompt = `Provide a short, professional insight (2 sentences) for this map-related design request: "${prompt}"`;
      } else if (mode === 'ai-projects') {
        systemPrompt = "You are an AI projects and systems development expert.";
        humanPrompt = `Provide a short, strategic technical insight (2 sentences) for this AI project request: "${prompt}"`;
      } else if (mode === 'web3') {
        systemPrompt = "You are a Web3 and blockchain development expert.";
        humanPrompt = `Provide a short, professional insight (2 sentences) for this decentralized application or Web3 request: "${prompt}"`;
      } else if (mode === 'ml-tools') {
        systemPrompt = "You are a machine learning and data science tools expert.";
        humanPrompt = `Provide a short, professional insight (2 sentences) for this ML tool or data task: "${prompt}"`;
      }

      // Simulated RAG Logic
      let context = "";
      if (useRAG && supabase) {
        try {
          // In a real RAG implementation, you would:
          // 1. Generate an embedding for the prompt
          // 2. Query Supabase vector store
          // 3. Append context to the human prompt

          // For this simulation, we'll try to fetch some relevant context if a 'documents' table exists
          const { data, error } = await supabase
            .from('documents')
            .select('content')
            .limit(1);

          if (data && data.length > 0) {
            context = `\n\nContext from knowledge base: ${data[0].content}`;
          }
        } catch (ragError) {
          console.error('RAG Error:', ragError);
          // Continue without RAG context if it fails
        }
      }

      const response = await chatModel.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(humanPrompt + context),
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
app.post('/auth/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      displayName: displayName || email.split('@')[0],
      photos: [{ value: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || email)}` }]
    };
    users.push(newUser);

    req.login(newUser, (err) => {
      if (err) return res.status(500).json({ error: 'Login failed after registration' });
      res.json(newUser);
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message || 'Login failed' });
    req.login(user, (err) => {
      if (err) return next(err);
      return res.json(user);
    });
  })(req, res, next);
});

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
    const hasOpenRouterKey = process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here';

    if ((provider === 'google' && hasGoogleKey) || (provider === 'claude' && hasClaudeKey) || (provider === 'openrouter' && hasOpenRouterKey)) {
      let chatModel;
      if (provider === 'claude') {
        chatModel = claudeModel;
      } else if (provider === 'openrouter') {
        chatModel = openRouterModel;
      } else {
        chatModel = googleModel;
      }
      const systemPrompt = "You are GitHub Copilot, an AI pair programmer.";
      const humanPrompt = `Provide a snippet of high-quality React or CSS code that would enhance a "${mode}" project with the following description: "${prompt}". Also explain why this code helps.`;

      const response = await chatModel.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(humanPrompt),
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
    const hasOpenRouterKey = process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here';

    if ((provider === 'google' && hasGoogleKey) || (provider === 'claude' && hasClaudeKey) || (provider === 'openrouter' && hasOpenRouterKey)) {
      let chatModel;
      if (provider === 'claude') {
        chatModel = claudeModel;
      } else if (provider === 'openrouter') {
        chatModel = openRouterModel;
      } else {
        chatModel = googleModel;
      }
      const systemPrompt = "You are an AI Dropshipping expert.";
      const humanPrompt = `Suggest 3 trending products and a basic marketing strategy for the niche: "${niche}". Return ONLY a JSON array of objects with "title", "reason", and "strategy" fields. Do not include any conversational text.`;

      const response = await chatModel.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(humanPrompt),
      ]);

      // Simple parsing of AI response if it's JSON-like
      try {
        // Find the first '[' and last ']' to extract JSON array
        const content = response.content;
        const start = content.indexOf('[');
        const end = content.lastIndexOf(']');
        if (start !== -1 && end !== -1 && end > start) {
          const jsonStr = content.substring(start, end + 1);
          suggestions = JSON.parse(jsonStr);
        } else {
          throw new Error('No JSON array found in response');
        }
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

app.post('/api/finetuning/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key';

  if (!hasOpenAIKey) {
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    return res.json({
      id: `file-mock-${Date.now()}`,
      filename: req.file.originalname,
      purpose: 'fine-tune',
      isMock: true
    });
  }

  try {
    const file = await openai.files.create({
      file: fs.createReadStream(req.file.path),
      purpose: 'fine-tune',
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json(file);
  } catch (error) {
    console.error('Error uploading file to OpenAI:', error);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Failed to upload file to OpenAI', details: error.message });
  }
});

app.post('/api/finetuning/jobs', async (req, res) => {
  const { training_file, model = 'gpt-3.5-turbo-0125' } = req.body;

  if (!training_file) {
    return res.status(400).json({ error: 'training_file is required' });
  }

  const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key';

  if (!hasOpenAIKey) {
    return res.json({
      id: `ftjob-mock-${Date.now()}`,
      training_file,
      model,
      status: 'validating',
      isMock: true
    });
  }

  try {
    const fineTune = await openai.fineTuning.jobs.create({
      training_file,
      model,
    });
    res.json(fineTune);
  } catch (error) {
    console.error('Error creating fine-tuning job:', error);
    res.status(500).json({ error: 'Failed to create fine-tuning job', details: error.message });
  }
});

app.get('/api/finetuning/jobs', async (req, res) => {
  const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key';

  if (!hasOpenAIKey) {
    return res.json({
      data: [
        { id: 'ftjob-mock-1', model: 'gpt-3.5-turbo-0125', status: 'succeeded', fine_tuned_model: 'ft:gpt-3.5-turbo-0125:personal::mock1' },
        { id: 'ftjob-mock-2', model: 'gpt-3.5-turbo-0125', status: 'running', fine_tuned_model: null }
      ],
      isMock: true
    });
  }

  try {
    const list = await openai.fineTuning.jobs.list({ limit: 10 });
    res.json(list);
  } catch (error) {
    console.error('Error listing fine-tuning jobs:', error);
    res.status(500).json({ error: 'Failed to list fine-tuning jobs', details: error.message });
  }
});

app.get('/api/finetuning/jobs/:id', async (req, res) => {
  const { id } = req.params;
  const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key';

  if (!hasOpenAIKey || id.startsWith('ftjob-mock')) {
    return res.json({
      id,
      model: 'gpt-3.5-turbo-0125',
      status: 'succeeded',
      fine_tuned_model: 'ft:gpt-3.5-turbo-0125:personal::mock1',
      isMock: true
    });
  }

  try {
    const fineTune = await openai.fineTuning.jobs.retrieve(id);
    res.json(fineTune);
  } catch (error) {
    console.error('Error retrieving fine-tuning job:', error);
    res.status(500).json({ error: 'Failed to retrieve fine-tuning job', details: error.message });
  }
});

app.get('/api/finetuning/models', async (req, res) => {
  const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key';

  if (!hasOpenAIKey) {
    return res.json({
      data: [
        { id: 'ft:gpt-3.5-turbo-0125:personal::mock1', created: Date.now() },
        { id: 'ft:gpt-3.5-turbo-0125:personal::mock2', created: Date.now() - 86400000 }
      ],
      isMock: true
    });
  }

  try {
    const list = await openai.models.list();
    const ftModels = list.data.filter(model => model.id.startsWith('ft:'));
    res.json({ data: ftModels });
  } catch (error) {
    console.error('Error listing models:', error);
    res.status(500).json({ error: 'Failed to list models', details: error.message });
  }
});

app.post('/api/ml/tools', async (req, res) => {
  const { task, inputs } = req.body;
  const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

  if (!HUGGINGFACE_API_KEY) {
    return res.json({
      result: `Hugging Face is not configured. (Mock) Task: ${task}, Input: ${inputs}`,
      isMock: true
    });
  }

  try {
    let result;
    if (task === 'summarization') {
      const response = await hf.summarization({
        model: 'facebook/bart-large-cnn',
        inputs: inputs,
      });
      result = response.summary_text;
    } else if (task === 'sentiment-analysis') {
      const response = await hf.textClassification({
        model: 'distilbert-base-uncased-finetuned-sst-2-english',
        inputs: inputs,
      });
      result = `Sentiment: ${response[0].label} (Score: ${response[0].score.toFixed(2)})`;
    } else if (task === 'translation') {
      const response = await hf.translation({
        model: 't5-base',
        inputs: inputs,
      });
      result = response.translation_text;
    } else {
      return res.status(400).json({ error: 'Unsupported task' });
    }

    res.json({ result });
  } catch (error) {
    console.error('Error with Hugging Face ML tools:', error);
    res.status(500).json({ error: 'Failed to perform ML task' });
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
