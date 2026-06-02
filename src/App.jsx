import React, { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [mode, setMode] = useState('web');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = React.useRef(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setPreviewImage(null);
    setPreviewVideo(null);
    const API_URL = import.meta.env.VITE_API_URL || '';
    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, mode }),
      });
      const data = await response.json();
      if (data.imageUrl) {
        setPreviewImage(data.imageUrl);
      } else if (data.videoUrl) {
        setPreviewVideo(data.videoUrl);
      }
    } catch (error) {
      console.error('Error generating design:', error);
      // Fallback for demo if backend is not running
      const keywords = `${mode},${prompt}`.replace(/\s+/g, ',');
      setPreviewImage(`https://loremflickr.com/800/600/${encodeURIComponent(keywords)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleCamera = async () => {
    if (isCameraOpen) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOpen(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      } catch (err) {
        console.error("Error accessing camera: ", err);
        alert("Could not access camera. Please ensure you have given permission.");
      }
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'DesignAI Studio Generation',
      text: `Check out this ${mode} generation from DesignAI Studio: ${prompt}`,
      url: previewVideo || previewImage || window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="logo">DesignAI Studio</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#editor">Editor</a>
          <a href="#pricing">Pricing</a>
          <a href="#showcase">Showcase</a>
        </div>
        <div className="nav-actions">
          <button className="sponsor-button">Sponsor</button>
          <button className="cta-button">Get Started</button>
        </div>
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

      <section id="pricing" className="pricing">
        <h2>Simple, Transparent Pricing</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Free</h3>
            <div className="price">$0<span>/month</span></div>
            <ul>
              <li>5 Generations per month</li>
              <li>Basic Web Design templates</li>
              <li>Standard Image Quality</li>
            </ul>
            <button className="pricing-btn">Start for Free</button>
          </div>
          <div className="pricing-card popular">
            <div className="badge">Most Popular</div>
            <h3>Pro</h3>
            <div className="price">$29<span>/month</span></div>
            <ul>
              <li>Unlimited Generations</li>
              <li>Advanced Photoshop tools</li>
              <li>HD Export Options</li>
              <li>Priority Support</li>
            </ul>
            <button className="pricing-btn primary">Upgrade to Pro</button>
          </div>
          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="price">Custom</div>
            <ul>
              <li>Custom AI training</li>
              <li>API Access</li>
              <li>Team Collaboration</li>
              <li>Dedicated Manager</li>
            </ul>
            <button className="pricing-btn">Contact Sales</button>
          </div>
        </div>
      </section>

      <section id="sponsorship" className="sponsorship">
        <div className="sponsorship-content">
          <h2>Support Our Mission</h2>
          <p>Help us keep DesignAI Studio free and open for everyone. Your sponsorship fuels the development of better AI models and more features.</p>
          <div className="sponsorship-stats">
            <div className="stat">
              <span className="stat-value">500+</span>
              <span className="stat-label">Contributors</span>
            </div>
            <div className="stat">
              <span className="stat-value">$10k+</span>
              <span className="stat-label">Raised</span>
            </div>
          </div>
          <button className="sponsor-cta">Become a Sponsor</button>
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
            <button
              className={`mode-btn ${mode === 'video' ? 'active' : ''}`}
              onClick={() => setMode('video')}
            >
              Video
            </button>
          </div>
          <div className="editor-controls">
            <button
              className={`camera-toggle ${isCameraOpen ? 'active' : ''}`}
              onClick={toggleCamera}
              title={isCameraOpen ? "Close Camera" : "Open Camera"}
            >
              📷
            </button>
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

            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`camera-feed ${isCameraOpen ? 'visible' : ''}`}
            />

            {previewVideo ? (
              <video src={previewVideo} controls className="placeholder-img" autoPlay loop muted />
            ) : previewImage ? (
              <img src={previewImage} alt="Generated Design" className="placeholder-img" />
            ) : !isCameraOpen && (
              <div className="empty-state">
                <p>Your AI generation will appear here</p>
              </div>
            )}

            {(previewImage || previewVideo) && (
              <button className="share-btn" onClick={handleShare}>
                <span>🔗</span> Share
              </button>
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
