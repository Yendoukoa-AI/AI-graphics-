import React, { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [aiInsight, setAiInsight] = useState('');
  const [mode, setMode] = useState('web');
  const [shoplineProducts, setShoplineProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [langflowResponse, setLangflowResponse] = useState('');

  const fetchShoplineProducts = async () => {
    setIsFetchingProducts(true);
    const API_URL = import.meta.env.VITE_API_URL || '';
    try {
      const response = await fetch(`${API_URL}/api/shopline/products`);
      const data = await response.json();
      setShoplineProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching Shopline products:', error);
    } finally {
      setIsFetchingProducts(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'DesignAI Studio Generation',
      text: `Check out this ${mode} I generated with DesignAI Studio: ${prompt}`,
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

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setPreviewImage(null);
    setPreviewVideo(null);
    setLangflowResponse('');
    const API_URL = import.meta.env.VITE_API_URL || '';

    if (mode === 'langflow') {
      try {
        const response = await fetch(`${API_URL}/api/langflow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });
        const data = await response.json();
        setLangflowResponse(data.result);
      } catch (error) {
        console.error('Error with LangFlow:', error);
        setLangflowResponse('Failed to get response from LangFlow.');
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          mode,
          product: mode === 'shopline' ? selectedProduct : null
        }),
      });
      const data = await response.json();
      if (data.imageUrl) {
        setPreviewImage(data.imageUrl);
      }
      if (data.videoUrl) {
        setPreviewVideo(data.videoUrl);
      }
      if (data.insight) {
        setAiInsight(data.insight);
      }
    } catch (error) {
      console.error('Error generating design:', error);
      // Fallback for demo if backend is not running
      const keywords = `${mode},${prompt}`.replace(/\s+/g, ',');
      if (mode === 'video') {
        setPreviewVideo('https://www.w3schools.com/html/mov_bbb.mp4');
      } else {
        setPreviewImage(`https://loremflickr.com/800/600/${encodeURIComponent(keywords)}`);
      }
    } finally {
      setIsGenerating(false);
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
        <div className="hero-badge">Now with AI Video Generation 🎬</div>
        <h1>AI-Powered Design <br />for the Modern Creator</h1>
        <p>Revolutionize your workflow with AI dedicated to web design, graphics, Photoshop enhancements, and public posters.</p>
        <div className="hero-actions">
          <button className="cta-button">Try for Free</button>
          <button className="secondary-button">Watch Demo</button>
        </div>
      </header>

      <section className="how-it-works">
        <h2>How it Works</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Choose Mode</h4>
            <p>Select between Web, Photo, Poster or Video generation modes.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Describe</h4>
            <p>Enter a simple text prompt describing your vision.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Refine</h4>
            <p>Use AI insights to perfect your creation instantly.</p>
          </div>
        </div>
      </section>

      <section className="trust-section">
        <div className="trust-logos">
          <span className="logo-item">SHOPLINE</span>
          <span className="logo-item">ADOBE</span>
          <span className="logo-item">FIGMA</span>
          <span className="logo-item">CANVA</span>
        </div>
      </section>

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
        <div className="card">
          <span className="card-icon">🎬</span>
          <h3>AI Video Generation</h3>
          <p>Bring your designs to life with AI-powered video generation. Create dynamic content for social media and marketing.</p>
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

      <section className="testimonials">
        <h2>Trusted by Creators</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>"DesignAI has completely changed how I approach web projects. It's like having a senior designer on speed dial."</p>
            <div className="author">
              <div className="author-avatar">SC</div>
              <div className="author-info">
                <strong>Sarah Chen</strong>
                <span>Freelance Web Designer</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p>"The Photoshop AI tools are mind-blowing. Background removal that used to take minutes now takes seconds."</p>
            <div className="author">
              <div className="author-avatar">MJ</div>
              <div className="author-info">
                <strong>Marcus Johnson</strong>
                <span>Art Director</span>
              </div>
            </div>
          </div>
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
          <div className="showcase-item">
            <video className="showcase-video" autoPlay muted loop>
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
            </video>
            <div className="showcase-info">AI Video</div>
          </div>
        </div>
      </section>

      <section id="editor" className="demo-section">
        <div className="section-header">
          <h2>Experience the Power</h2>
          <p>Describe what you want to create and let our AI do the heavy lifting.</p>
        </div>

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
              AI Video
            </button>
            <button
              className={`mode-btn ${mode === 'shopline' ? 'active' : ''}`}
              onClick={() => {
                setMode('shopline');
                if (shoplineProducts.length === 0) {
                  fetchShoplineProducts();
                }
              }}
            >
              Shopline
            </button>
            <button
              className={`mode-btn ${mode === 'langflow' ? 'active' : ''}`}
              onClick={() => setMode('langflow')}
            >
              LangFlow
            </button>
          </div>

          {mode === 'shopline' && (
            <div className="shopline-selector">
              <h4>Select a Product to Design For</h4>
              {isFetchingProducts ? (
                <p>Loading products...</p>
              ) : (
                <div className="product-list">
                  {shoplineProducts.map(product => (
                    <div
                      key={product.id}
                      className={`product-item ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedProduct(product);
                        setPrompt(`Design a promotional banner for ${product.title}`);
                      }}
                    >
                      <img src={product.image || (product.images && product.images[0]?.src)} alt={product.title} />
                      <span>{product.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="editor-controls">
            <input
              type="text"
              className="input-field"
              placeholder={
                mode === 'web' ? "e.g., Landing page for tech startup" :
                mode === 'photo' ? "e.g., Cyberpunk portrait effect" :
                mode === 'poster' ? "e.g., Event poster for jazz concert" :
                mode === 'langflow' ? "e.g., Ask anything to LangFlow..." :
                "e.g., Dynamic product showcase video"
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
            {previewImage || previewVideo || langflowResponse ? (
              <div className="preview-container">
                {langflowResponse && (
                  <div className="langflow-response-box">
                    <h4>LangFlow Output</h4>
                    <div className="langflow-content">
                      {langflowResponse}
                    </div>
                  </div>
                )}
                {previewImage && <img src={previewImage} alt="Generated Design" className="placeholder-img" />}
                {previewVideo && (
                  <video controls className="placeholder-video" autoPlay muted loop>
                    <source src={previewVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                {aiInsight && (
                  <div className="ai-insight-box">
                    <div className="insight-header">
                      <h4>AI Insight</h4>
                      <button className="share-btn" onClick={handleShare}>
                        <span className="share-icon">📤</span> Share
                      </button>
                    </div>
                    <p>{aiInsight}</p>
                  </div>
                )}
              </div>
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
