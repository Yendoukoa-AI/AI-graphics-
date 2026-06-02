import React, { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [mode, setMode] = useState('web');

  const handleGenerate = () => {
    if (!prompt) return;
    setIsGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => {
      setIsGenerating(false);
      const keywords = `${mode},${prompt}`.replace(/\s+/g, ',');
      setPreviewImage(`https://loremflickr.com/800/600/${encodeURIComponent(keywords)}`);
    }, 2000);
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="logo">DesignAI Studio</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#editor">Editor</a>
          <a href="#showcase">Showcase</a>
        </div>
        <button className="cta-button">Get Started</button>
      </nav>

      <header className="hero">
        <h1>AI-Powered Design <br />for the Modern Creator</h1>
        <p>Revolutionize your workflow with AI dedicated to web design, graphics, Photoshop enhancements, and public posters.</p>
        <button className="cta-button">Try for Free</button>
      </header>

      <section id="features" className="features">
        <div className="card">
          <span className="card-icon">🌐</span>
          <h3>Web Design AI</h3>
          <p>Generate responsive layouts, UI components, and complete landing pages from simple text descriptions.</p>
        </div>
        <div className="card">
          <span className="card-icon">🎨</span>
          <h3>Graphic & Photoshop</h3>
          <p>Advanced AI tools for image manipulation, background removal, and professional photo retouching.</p>
        </div>
        <div className="card">
          <span className="card-icon">🖼️</span>
          <h3>Affiches & Posters</h3>
          <p>Create stunning public posters and advertisements with automated typography and layout balancing.</p>
        </div>
      </section>

      <section id="showcase" className="showcase">
        <h2>Created with DesignAI</h2>
        <div className="showcase-grid">
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/website,landingpage" alt="Web Design" />
            <div className="showcase-info">Web Design</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/photography,retouch" alt="Photoshop" />
            <div className="showcase-info">Photoshop</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/poster,advertisement" alt="Poster" />
            <div className="showcase-info">Poster</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/logo,branding" alt="Graphic Design" />
            <div className="showcase-info">Branding</div>
          </div>
        </div>
      </section>

      <section id="editor" className="demo-section">
        <h2>Experience the Power</h2>
        <p>Describe what you want to create and let our AI do the heavy lifting.</p>

        <div className="ai-editor">
          <div className="mode-selector">
            <button
              className={`mode-btn ${mode === 'web' ? 'active' : ''}`}
              onClick={() => setMode('web')}
            >
              Web Design
            </button>
            <button
              className={`mode-btn ${mode === 'photo' ? 'active' : ''}`}
              onClick={() => setMode('photo')}
            >
              Photoshop
            </button>
            <button
              className={`mode-btn ${mode === 'poster' ? 'active' : ''}`}
              onClick={() => setMode('poster')}
            >
              Poster
            </button>
          </div>
          <div className="editor-controls">
            <input
              type="text"
              className="input-field"
              placeholder={
                mode === 'web' ? "e.g., Landing page for tech startup" :
                mode === 'photo' ? "e.g., Cyberpunk portrait effect" :
                "e.g., Event poster for jazz concert"
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              className="cta-button"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Design'}
            </button>
          </div>

          <div className="preview-area">
            {isGenerating && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>AI is thinking...</p>
              </div>
            )}
            {previewImage ? (
              <img src={previewImage} alt="Generated Design" className="placeholder-img" />
            ) : (
              <div className="empty-state">
                <p>Your AI generation will appear here</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer>
        <p>&copy; 2024 DesignAI Studio. Empowering creators through artificial intelligence.</p>
      </footer>
    </div>
  );
}

export default App;
