import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Fix for Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [aiInsight, setAiInsight] = useState('');
  const [mode, setMode] = useState('smart');
  const [shoplineProducts, setShoplineProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [langflowResponse, setLangflowResponse] = useState('');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [niche, setNiche] = useState('');
  const [dropshipperSuggestions, setDropshipperSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [listSuccess, setListSuccess] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [copilotSuggestion, setCopilotSuggestion] = useState('');
  const [history, setHistory] = useState([]);
  const [copySuccess, setCopySuccess] = useState('');
  const [isPostingToFacebook, setIsPostingToFacebook] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapResults, setMapResults] = useState([]);
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // Default to SF
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
  const [screenshotResult, setScreenshotResult] = useState(null);
  const [provider, setProvider] = useState('google');
  const [useRAG, setUseRAG] = useState(false);
  const [mlTask, setMlTask] = useState('summarization');
  const [mlResult, setMlResult] = useState('');
  const [isProcessingMl, setIsProcessingMl] = useState(false);
  const [fineTuningJobs, setFineTuningJobs] = useState([]);
  const [fineTunedModelsList, setFineTunedModelsList] = useState([]);
  const [selectedFineTunedModel, setSelectedFineTunedModel] = useState(null);
  const [isFinetuningLoading, setIsFinetuningLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetchUser();

    // Check for reset token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetToken(token);
      const emailParam = urlParams.get('email');
      if (emailParam) setEmail(emailParam);
      setAuthMode('reset-password');
      setShowAuthModal(true);
    }

    // Initialize Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId      : import.meta.env.VITE_FACEBOOK_APP_ID || 'dummy-id',
        cookie     : true,
        xfbml      : true,
        version    : 'v18.0'
      });
    };

    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "https://connect.facebook.net/en_US/sdk.js";
       if (fjs && fjs.parentNode) {
         fjs.parentNode.insertBefore(js, fjs);
       } else {
         d.head.appendChild(js);
       }
     }(document, 'script', 'facebook-jssdk'));
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/user`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data && data.id) {
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');

    if (authMode === 'reset-password') {
      try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: resetToken, email, newPassword }),
          credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
          setAuthMessage('Password reset successful! You can now login.');
          setAuthMode('login');
          setNewPassword('');
          // Clear URL params
          window.history.replaceState({}, document.title, "/");
        } else {
          setAuthError(data.error || 'Failed to reset password');
        }
      } catch (error) {
        setAuthError('An error occurred. Please try again.');
      }
      return;
    }

    if (authMode === 'forgot-password') {
      try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
          credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
          setAuthMessage(data.message || 'Check your email for reset instructions.');
        } else {
          setAuthError(data.error || 'Failed to send reset email. Please try again.');
        }
      } catch (error) {
        setAuthError('Failed to send reset email. Please try again.');
      }
      return;
    }

    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
    const payload = authMode === 'login'
      ? { email, password }
      : { email, password, displayName };

    try {
      console.log(`Attempting ${authMode} at ${API_URL}${endpoint}`);
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response received:', text);
        throw new Error('Server returned a non-JSON response');
      }

      if (response.ok) {
        setUser(data);
        setShowAuthModal(false);
        setEmail('');
        setPassword('');
        setDisplayName('');
      } else {
        setAuthError(data.error || data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError('An error occurred during authentication. Please check your connection.');
    }
  };

  const fetchShoplineProducts = async () => {
    setIsFetchingProducts(true);
    const API_URL = import.meta.env.VITE_API_URL || '';
    try {
      const response = await fetch(`${API_URL}/api/shopline/products`, {
        credentials: 'include'
      });
      const data = await response.json();
      setShoplineProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching Shopline products:', error);
    } finally {
      setIsFetchingProducts(false);
    }
  };

  const fetchDropshipperSuggestions = async () => {
    if (!niche) return;
    setIsFetchingSuggestions(true);
    const API_URL = import.meta.env.VITE_API_URL || '';
    try {
      const response = await fetch(`${API_URL}/api/dropshipper/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ niche, provider }),
      });
      const data = await response.json();
      setDropshipperSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching dropshipper suggestions:', error);
    } finally {
      setIsFetchingSuggestions(false);
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

  const handleFacebookShare = () => {
    if (window.FB) {
      window.FB.ui({
        method: 'share',
        href: previewVideo || previewImage || window.location.href,
        quote: `Check out this ${mode} I generated with DesignAI Studio: ${prompt}`,
      }, function(response){});
    } else {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(previewVideo || previewImage || window.location.href)}`;
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const handleGoogleSearch = async () => {
    if (!prompt) return;
    setIsSearching(true);
    try {
      const response = await fetch(`${API_URL}/api/google/search?q=${encodeURIComponent(prompt)}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.error) {
        alert('Search error: ' + data.error);
        setSearchResults([]);
      } else {
        setSearchResults(data.items || []);
      }
    } catch (error) {
      console.error('Error with Google search:', error);
      alert('Failed to connect to search service.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleGooglePlaces = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_URL}/api/google/places?q=${encodeURIComponent(prompt)}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.error) {
        alert('Maps error: ' + data.error);
        setMapResults([]);
      } else {
        setMapResults(data.results || []);
        if (data.results && data.results.length > 0) {
          const first = data.results[0].geometry.location;
          setMapCenter([first.lat, first.lng]);
        } else {
          alert('No results found for this location.');
        }
      }
    } catch (error) {
      console.error('Error with Google places:', error);
      alert('Failed to connect to maps service.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTakeScreenshot = async (urlToCapture) => {
    setIsTakingScreenshot(true);
    setScreenshotResult(null);
    try {
      const response = await fetch(`${API_URL}/api/chrome/screenshot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ url: urlToCapture }),
      });
      const data = await response.json();
      if (data.screenshot) {
        setScreenshotResult(data.screenshot);
      } else {
        alert('Failed to take screenshot: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error taking screenshot:', error);
      alert('Error taking screenshot.');
    } finally {
      setIsTakingScreenshot(false);
    }
  };

  const handlePostToFacebookAPI = async () => {
    setIsPostingToFacebook(true);
    try {
      const response = await fetch(`${API_URL}/api/facebook/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: `Check out my new design: ${prompt}`,
          link: previewVideo || previewImage || window.location.href,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Successfully posted to your Facebook feed!');
      } else {
        alert('Failed to post: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error posting to Facebook:', error);
      alert('Error posting to Facebook. Make sure you are logged in with Facebook.');
    } finally {
      setIsPostingToFacebook(false);
    }
  };

  const handleMlTask = async () => {
    if (!prompt) return;
    setIsProcessingMl(true);
    setMlResult('');
    try {
      const response = await fetch(`${API_URL}/api/ml/tools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ task: mlTask, inputs: prompt }),
      });
      const data = await response.json();
      setMlResult(data.result);
    } catch (error) {
      console.error('Error with ML task:', error);
      setMlResult('Failed to perform ML task.');
    } finally {
      setIsProcessingMl(false);
    }
  };

  const fetchFineTuningData = async () => {
    setIsFinetuningLoading(true);
    try {
      const [jobsRes, modelsRes] = await Promise.all([
        fetch(`${API_URL}/api/finetuning/jobs`, { credentials: 'include' }),
        fetch(`${API_URL}/api/finetuning/models`, { credentials: 'include' })
      ]);
      const jobsData = await jobsRes.json();
      const modelsData = await modelsRes.json();
      setFineTuningJobs(jobsData.data || []);
      setFineTunedModelsList(modelsData.data || []);
    } catch (error) {
      console.error('Error fetching fine-tuning data:', error);
    } finally {
      setIsFinetuningLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsFinetuningLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/finetuning/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await response.json();
      if (data.id) {
        alert(`File uploaded successfully: ${data.id}`);
        // Automatically start a job for demo
        startFineTuningJob(data.id);
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setIsFinetuningLoading(false);
    }
  };

  const startFineTuningJob = async (fileId) => {
    setIsFinetuningLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/finetuning/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ training_file: fileId }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.id) {
        alert(`Fine-tuning job started: ${data.id}`);
        fetchFineTuningData();
      }
    } catch (error) {
      console.error('Error starting job:', error);
    } finally {
      setIsFinetuningLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;

    if (mode === 'ml-tools') {
      handleMlTask();
      return;
    }

    setIsGenerating(true);
    setPreviewImage(null);
    setPreviewVideo(null);
    setLangflowResponse('');
    setAiInsight('');
    const API_URL = import.meta.env.VITE_API_URL || '';

    let result = {
      prompt,
      mode,
      timestamp: new Date().toLocaleTimeString(),
    };

    try {
      if (mode === 'maps') {
        await handleGooglePlaces();
        return;
      }

      if (mode === 'langflow') {
        try {
          const response = await fetch(`${API_URL}/api/langflow`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ prompt }),
          });
          const data = await response.json();
          setLangflowResponse(data.result);
          result.langflowResponse = data.result;
          setHistory([result, ...history]);
        } catch (error) {
          console.error('Error with LangFlow:', error);
          setLangflowResponse('Failed to get response from LangFlow.');
        }
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            prompt,
            mode,
            provider,
            useRAG,
              fineTunedModel: selectedFineTunedModel,
            product: mode === 'shopline' ? selectedProduct : null
          }),
        });

        if (mode === 'github') {
          await fetchCopilotSuggestion();
        }

        const data = await response.json();
        if (data.imageUrl) {
          setPreviewImage(data.imageUrl);
          result.imageUrl = data.imageUrl;
        }
        if (data.videoUrl) {
          setPreviewVideo(data.videoUrl);
          result.videoUrl = data.videoUrl;
        }
        if (data.insight) {
          setAiInsight(data.insight);
          result.insight = data.insight;
        }
        setHistory([result, ...history]);
      } catch (error) {
        console.error('Error generating design:', error);
        // Fallback for demo if backend is not running
        const keywords = `${mode},${prompt}`.replace(/\s+/g, ',');
        let fallbackImg = null;
        let fallbackVid = null;
        if (mode === 'video' || mode === 'cinema') {
          fallbackVid = 'https://www.w3schools.com/html/mov_bbb.mp4';
          setPreviewVideo(fallbackVid);
          result.videoUrl = fallbackVid;
        } else {
          fallbackImg = `https://loremflickr.com/800/600/${encodeURIComponent(keywords)}`;
          setPreviewImage(fallbackImg);
          result.imageUrl = fallbackImg;
        }
        result.insight = "Design insight: Focus on balance and typography for your project.";
        setAiInsight(result.insight);
        setHistory([result, ...history]);
      }
    } catch (err) {
      console.error('Critical error in handleGenerate:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGitHubDeploy = async () => {
    setIsDeploying(true);
    setDeployUrl('');
    setRepoUrl('');
    const API_URL = import.meta.env.VITE_API_URL || '';
    try {
      const response = await fetch(`${API_URL}/api/github/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ prompt, mode, provider }),
      });
      const data = await response.json();
      if (data.success) {
        setDeployUrl(data.url);
        if (data.repoUrl) {
          setRepoUrl(data.repoUrl);
        } else if (data.isMock) {
          setRepoUrl(data.url.replace('.github.io/', '/').replace('https://', 'https://github.com/'));
        }
        if (data.isMock) {
          alert(data.message);
        }
      }
    } catch (error) {
      console.error('Error deploying to GitHub:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const fetchCopilotSuggestion = async () => {
    const API_URL = import.meta.env.VITE_API_URL || '';
    try {
      const response = await fetch(`${API_URL}/api/github/copilot-suggestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ prompt, mode, provider }),
      });
      const data = await response.json();
      setCopilotSuggestion(data.suggestion);
    } catch (error) {
      console.error('Error fetching Copilot suggestion:', error);
    }
  };

  const downloadMedia = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback if fetch fails (e.g. CORS)
      window.open(url, '_blank');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  return (
    <div className="App">
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="auth-modal">
            <button className="close-modal" onClick={() => setShowAuthModal(false)}>✕</button>
            <h3>
              {authMode === 'login' ? 'Login to DesignAI' :
               authMode === 'register' ? 'Create Account' :
               authMode === 'forgot-password' ? 'Forgot Password' : 'Reset Password'}
            </h3>
            {authError && <p className="auth-error-msg">{authError}</p>}
            {authMessage && <p className="auth-success-msg" style={{ color: '#10b981', marginBottom: '1rem', textAlign: 'center' }}>{authMessage}</p>}
            <form onSubmit={handleAuth}>
              {authMode === 'register' && (
                <div className="input-field-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}
              {(authMode === 'login' || authMode === 'register' || authMode === 'forgot-password' || authMode === 'reset-password') && (
                <div className="input-field-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    readOnly={authMode === 'reset-password'}
                  />
                </div>
              )}
              {(authMode === 'login' || authMode === 'register') && (
                <div className="input-field-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}
              {(authMode === 'login' || authMode === 'register') && (
                <button type="submit" className="cta-button auth-submit">
                  {authMode === 'login' ? 'Login' : 'Register'}
                </button>
              )}
              {authMode === 'forgot-password' && (
                <button type="submit" className="cta-button auth-submit">
                  Send Reset Link
                </button>
              )}
              {authMode === 'reset-password' && (
                <>
                  <div className="input-field-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <button type="submit" className="cta-button auth-submit">
                    Reset Password
                  </button>
                </>
              )}
            </form>
            <div className="auth-switch">
              {authMode === 'login' ? (
                <>
                  <p>Don't have an account? <button onClick={() => setAuthMode('register')}>Register</button></p>
                  <p><button onClick={() => setAuthMode('forgot-password')}>Forgot password?</button></p>
                </>
              ) : authMode === 'register' ? (
                <p>Already have an account? <button onClick={() => setAuthMode('login')}>Login</button></p>
              ) : (
                <p><button onClick={() => setAuthMode('login')}>Back to Login</button></p>
              )}
            </div>
            <div className="auth-divider">
              <span>OR</span>
            </div>
            <div className="social-auth-options">
              <a href={`${API_URL}/auth/google`} className="social-auth-btn google">Continue with Google</a>
              <a href={`${API_URL}/auth/facebook`} className="social-auth-btn facebook">Continue with Facebook</a>
            </div>
          </div>
        </div>
      )}
      <nav className="navbar">
        <div className="logo">DesignAI Studio</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#editor">Editor</a>
          <a href="#pricing">Pricing</a>
          <a href="#showcase">Showcase</a>
          <a href="https://github.com/GYFX35/AI-graphics-/releases" target="_blank" rel="noopener noreferrer">View on GitHub Session</a>
        </div>
        <div className="nav-actions">
          <button className="sponsor-button">Sponsor</button>
          {user ? (
            <div className="user-profile">
              <img src={user.photos?.[0]?.value || `https://ui-avatars.com/api/?name=${user.displayName}`} alt={user.displayName} className="user-avatar" />
              <div className="user-dropdown">
                <span>{user.displayName}</span>
                <a href={`${API_URL}/auth/logout`} className="logout-link">Logout</a>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                className="cta-button login-btn email"
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              >
                Login / Register
              </button>
              <a href={`${API_URL}/auth/google`} className="cta-button login-btn google">Google</a>
              <a href={`${API_URL}/auth/facebook`} className="cta-button login-btn facebook">Facebook</a>
            </div>
          )}
        </div>
      </nav>

      <header className="hero">
        {!user && (
          <div className="auth-nudge">
            <span className="nudge-icon">🔒</span>
            <span>Connect with Google to unlock persistent design storage and history.</span>
            <a href={`${API_URL}/auth/google`} className="nudge-link">Connect Now</a>
          </div>
        )}
        <div className="hero-badge">The Ultimate AI Creative Suite 🌐 🎨 🖼️</div>
        <h1>Professional AI Design <br />for Modern Creators</h1>
        <p>Generate responsive web layouts, professional graphics, and stunning posters instantly. Now featuring enhanced Cinematography and Music AI capabilities.</p>
        <div className="hero-actions">
          <button className="cta-button">Try for Free</button>
          <a href="#editor" className="secondary-button" style={{ textDecoration: 'none', display: 'inline-block' }}>Watch Demo</a>
        </div>
      </header>

      <section className="how-it-works">
        <h2>How it Works</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Choose Mode</h4>
            <p>Select between Web Design, Graphics, Posters, or advanced AI Enhancement modes.</p>
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
          <span className="logo-item">NETFLIX</span>
          <span className="logo-item">SPOTIFY</span>
          <span className="logo-item">SHOPIFY</span>
          <span className="logo-item">UNIVERSAL</span>
        </div>
      </section>

      <section id="features" className="features">
        <div className="card">
          <span className="card-icon">🌐</span>
          <h3>Web Design AI</h3>
          <p>Generate responsive layouts, UI components, and complete landing pages from simple text descriptions.</p>
        </div>
        <div className="card">
          <span className="card-icon">📱</span>
          <h3>Mobile Design AI</h3>
          <p>Create stunning mobile app interfaces, touch-optimized components, and adaptive mobile web layouts.</p>
        </div>
        <div className="card">
          <span className="card-icon">💻</span>
          <h3>Desktop App AI</h3>
          <p>Design professional desktop application interfaces, complex dashboards, and multi-window software layouts.</p>
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
          <span className="card-icon">⚡</span>
          <h3>Real-time Generation</h3>
          <p>Experience the power of AI with our integrated editor and see your ideas come to life instantly.</p>
        </div>
      </section>

      <section className="enhancements-section">
        <div className="section-header">
          <h2>AI Enhancements</h2>
          <p>Specialized tools to expand your creative horizons</p>
        </div>
        <div className="features enhancements-grid">
          <div className="card enhancement-card">
            <span className="card-icon">🎥</span>
            <h3>Cinematography AI</h3>
            <p>Generate storyboards, shot compositions, and cinematic lighting schemes for global productions.</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🎵</span>
            <h3>Music & Audio AI</h3>
            <p>Compose original scores, generate soundscapes, and master audio tracks for any project.</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🌎</span>
            <h3>Global Entertainment</h3>
            <p>End-to-end AI tools for film, music, and digital media production tailored for a global audience.</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">📢</span>
            <h3>Ad Creative AI</h3>
            <p>Generate high-converting ad visuals and copy for social media, search, and display campaigns.</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🎮</span>
            <h3>Games Design & Dev</h3>
            <p>Design game characters, environments, and core mechanics with specialized AI assistance.</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🏎️</span>
            <h3>Automotive & Aero</h3>
            <p>Conceptualize next-generation cars, vehicles, and aircraft with advanced aerodynamic AI modeling.</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">📦</span>
            <h3>AI Dropshipper</h3>
            <p>Discover trending products, generate marketing strategies, and boost e-commerce visibility with AI.</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">📡</span>
            <h3>Telecoms AI</h3>
            <p>Optimize network layouts, visualize signal coverage, and design telecommunication infrastructure.</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">📺</span>
            <h3>Medias AI</h3>
            <p>Generate broadcast graphics, news layouts, and multimedia content for digital broadcasting.</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">📱</span>
            <h3>Social Networks AI</h3>
            <p>Create viral content, profile aesthetics, and engaging social media campaign assets.</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🏆</span>
            <h3>Sports AI</h3>
            <p>Design sports branding, performance analytics dashboards, and global fan engagement assets.</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🏥</span>
            <h3>Health AI</h3>
            <p>Design medical interfaces, wellness apps, and health monitoring dashboards with AI-driven precision.</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">💰</span>
            <h3>Finance AI</h3>
            <p>Generate marketing campaigns and product interfaces for banks, insurance, VC, fintechs, and mobile operators.</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🖌️</span>
            <h3>Art AI Painter</h3>
            <p>Create digital masterpieces, oil paintings, and abstract art with advanced AI brushstroke simulation.</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🎓</span>
            <h3>Global Education AI</h3>
            <p>Design interactive learning platforms, educational content, and global classroom experiences with AI.</p>
          </div>
        <div className="card enhancement-card">
          <span className="card-icon">🗺️</span>
          <h3>Maps AI</h3>
          <p>Integrate interactive maps, geolocation features, and geographic data visualization into your designs.</p>
        </div>
          <div className="card enhancement-card">
            <span className="card-icon">🤖</span>
            <h3>AI Projects</h3>
            <p>Conceptualize and design complex AI systems, neural network architectures, and data pipelines.</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🔗</span>
            <h3>Web3 AI</h3>
            <p>Design decentralized applications, smart contracts, and NFT ecosystems with blockchain-focused AI.</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">📊</span>
            <h3>ML Tools AI</h3>
            <p>Access global ML tools for text analysis, summarization, and translation directly in your workflow.</p>
          </div>
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

      <section id="ecommerce" className="ecommerce-partnership">
        <div className="partnership-content">
          <h2>E-commerce & Dropshipping Partnership</h2>
          <p>We've partnered with leading global platforms to provide seamless product sourcing and automated dropshipping workflows directly within your creative projects.</p>
          <div className="partnership-grid">
            <div className="partner-card">
              <h4>Global Sourcing</h4>
              <p>Access millions of products from verified suppliers worldwide.</p>
            </div>
            <div className="partner-card">
              <h4>Auto-Fulfillment</h4>
              <p>Orders are automatically synced and shipped to your customers.</p>
            </div>
            <div className="partner-card">
              <h4>AI-Driven Sales</h4>
              <p>Our AI optimizes your product descriptions and visuals for maximum conversion.</p>
            </div>
          </div>
          <button className="cta-button">Join Partnership Program</button>
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
            <img src="https://loremflickr.com/400/300/mobile,app,interface" alt="Mobile Design" />
            <div className="showcase-info">Mobile Design</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/desktop,software,dashboard" alt="Desktop App" />
            <div className="showcase-info">Desktop App</div>
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
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/supercar,concept" alt="Automotive Design" />
            <div className="showcase-info">Automotive</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/sports,stadium" alt="Sports Design" />
            <div className="showcase-info">Sports AI</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/medical,health" alt="Health Design" />
            <div className="showcase-info">Health AI</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/finance,banking" alt="Finance Design" />
            <div className="showcase-info">Finance AI</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/painting,art" alt="Art AI Painter" />
            <div className="showcase-info">Art AI Painter</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/education,learning" alt="Global Education" />
            <div className="showcase-info">Global Education</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/map,geography" alt="Maps AI" />
            <div className="showcase-info">Maps AI</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/artificial,intelligence,circuit" alt="AI Projects" />
            <div className="showcase-info">AI Projects</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/blockchain,crypto" alt="Web3" />
            <div className="showcase-info">Web3 AI</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/data,analysis,chart" alt="ML Tools" />
            <div className="showcase-info">ML Tools</div>
          </div>
        </div>
      </section>

      <section id="editor" className="demo-section">
        <div className="section-header">
          <h2>Experience the Power</h2>
          <p>Describe what you want to create and let our AI do the heavy lifting.</p>
        </div>

        <div className="ai-editor">
          <div className="mode-selector-container">
            <div className="main-smart-controls">
              <button
                className={`smart-toggle-btn ${mode === 'smart' ? 'active' : ''}`}
                onClick={() => setMode('smart')}
              >
                <span className="sparkle">✨</span> Smart Unified AI
              </button>
              <div className="advanced-dropdown">
                <button className="secondary-button dropdown-trigger">
                  Advanced Options ▾
                </button>
                <div className="dropdown-content">
                  <div className="dropdown-section">
                    <span className="section-label">Specialized Expertise</span>
                    <select
                      value={mode === 'smart' ? 'web' : mode}
                      onChange={(e) => {
                        setMode(e.target.value);
                        if (e.target.value === 'shopline') fetchShoplineProducts();
                        if (e.target.value === 'finetuning') fetchFineTuningData();
                      }}
                      className="mode-select-input"
                    >
                      <optgroup label="Core Design">
                        <option value="web">Web Design</option>
                        <option value="mobile">Mobile Design</option>
                        <option value="desktop">Desktop App</option>
                        <option value="graphics">Graphics</option>
                        <option value="posters">Posters</option>
                      </optgroup>
                      <optgroup label="Creative AI">
                        <option value="cinema">Cinema</option>
                        <option value="music">Music</option>
                        <option value="art-ai">Art AI Painter</option>
                      </optgroup>
                      <optgroup label="Business & Tech">
                        <option value="ad-creative">Ads</option>
                        <option value="shopline">Shopline</option>
                        <option value="dropshipper">Dropshipper</option>
                        <option value="finance">Finance</option>
                        <option value="telecoms">Telecoms</option>
                      </optgroup>
                      <optgroup label="Advanced Tools">
                        <option value="github">GitHub Session</option>
                        <option value="langflow">LangFlow</option>
                        <option value="ml-tools">ML Tools</option>
                        <option value="ai-projects">AI Projects</option>
                        <option value="aws">AWS Cloud AI</option>
                        <option value="web3">Web3</option>
                        <option value="finetuning">Fine Tuning</option>
                        <option value="maps">Maps AI</option>
                      </optgroup>
                    </select>
                  </div>
                  <div className="dropdown-section">
                    <span className="section-label">AI Provider</span>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="mode-select-input"
                    >
                      <option value="google">Google Gemini</option>
                      <option value="claude">Anthropic Claude</option>
                      <option value="aws">AWS Bedrock</option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="openai">OpenAI (DALL-E)</option>
                      <option value="huggingface">Hugging Face</option>
                    </select>
                  </div>
                  <div className="dropdown-section">
                    <label className="rag-toggle-inline">
                      <input
                        type="checkbox"
                        checked={useRAG}
                        onChange={(e) => setUseRAG(e.target.checked)}
                      />
                      Use RAG AI Knowledge Base
                    </label>
                  </div>
                </div>
              </div>
            </div>
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

          {mode === 'finetuning' && (
            <div className="finetuning-manager" style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>AI Fine-Tuning Manager</h3>
                <button className="secondary-button" onClick={fetchFineTuningData} disabled={isFinetuningLoading}>
                  {isFinetuningLoading ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 style={{ color: '#60a5fa', marginBottom: '1rem' }}>Upload Training Data (.jsonl)</h4>
                  <input
                    type="file"
                    accept=".jsonl"
                    onChange={handleFileUpload}
                    style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', width: '100%', border: '1px dashed rgba(255,255,255,0.2)' }}
                  />
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Upload a JSONL file with messages following OpenAI's chat format to train your custom model.
                  </p>

                  <h4 style={{ color: '#60a5fa', marginTop: '2rem', marginBottom: '1rem' }}>Active Jobs</h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', padding: '0.5rem' }}>
                    {fineTuningJobs.length > 0 ? (
                      fineTuningJobs.map(job => (
                        <div key={job.id} style={{ padding: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 'bold' }}>{job.id}</span>
                            <span style={{
                              color: job.status === 'succeeded' ? '#10b981' : job.status === 'failed' ? '#ef4444' : '#f59e0b',
                              textTransform: 'capitalize'
                            }}>{job.status}</span>
                          </div>
                          <div style={{ color: '#94a3b8', marginTop: '0.2rem' }}>Model: {job.model}</div>
                          {job.fine_tuned_model && (
                            <div style={{ color: '#60a5fa', fontSize: '0.75rem', marginTop: '0.2rem', wordBreak: 'break-all' }}>Result: {job.fine_tuned_model}</div>
                          )}
                        </div>
                      ))
                    ) : <p style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>No jobs found</p>}
                  </div>
                </div>

                <div>
                  <h4 style={{ color: '#60a5fa', marginBottom: '1rem' }}>Select Custom Model</h4>
                  <div style={{ maxHeight: '400px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
                    <div
                      className={`model-item ${!selectedFineTunedModel ? 'selected' : ''}`}
                      style={{
                        padding: '1rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: !selectedFineTunedModel ? 'rgba(96, 165, 250, 0.1)' : 'transparent'
                      }}
                      onClick={() => setSelectedFineTunedModel(null)}
                    >
                      <div style={{ fontWeight: 'bold' }}>Default (GPT-3.5 Turbo)</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Standard OpenAI model</div>
                    </div>
                    {fineTunedModelsList.map(model => (
                      <div
                        key={model.id}
                        className={`model-item ${selectedFineTunedModel === model.id ? 'selected' : ''}`}
                        style={{
                          padding: '1rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: selectedFineTunedModel === model.id ? 'rgba(96, 165, 250, 0.1)' : 'transparent'
                        }}
                        onClick={() => setSelectedFineTunedModel(model.id)}
                      >
                        <div style={{ fontWeight: 'bold', wordBreak: 'break-all' }}>{model.id}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Custom Fine-tuned Model</div>
                      </div>
                    ))}
                  </div>
                  {selectedFineTunedModel && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <p style={{ margin: 0, color: '#10b981', fontSize: '0.9rem' }}>
                        <strong>Active:</strong> Using your custom model for generation.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {mode === 'ml-tools' && (
            <div className="ml-tools-selector" style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 style={{ marginBottom: '1rem' }}>Select AI/ML Task</h4>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className={`mode-btn ${mlTask === 'summarization' ? 'active' : ''}`}
                  onClick={() => setMlTask('summarization')}
                >
                  Summarization
                </button>
                <button
                  className={`mode-btn ${mlTask === 'sentiment-analysis' ? 'active' : ''}`}
                  onClick={() => setMlTask('sentiment-analysis')}
                >
                  Sentiment Analysis
                </button>
                <button
                  className={`mode-btn ${mlTask === 'translation' ? 'active' : ''}`}
                  onClick={() => setMlTask('translation')}
                >
                  Translation
                </button>
              </div>
            </div>
          )}

          {mode === 'dropshipper' && (
            <div className="dropshipper-container">
              <div className="niche-input-group">
                <input
                  type="text"
                  className="input-field niche-input"
                  placeholder="Enter your niche (e.g., Pet Supplies, Yoga Gear)"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                />
                <button
                  className="cta-button"
                  onClick={fetchDropshipperSuggestions}
                  disabled={isFetchingSuggestions || !niche}
                >
                  {isFetchingSuggestions ? 'Finding Trends...' : 'Find Trending Products'}
                </button>
              </div>

              {dropshipperSuggestions.length > 0 && (
                <div className="suggestions-list">
                  <h4>AI Recommended Products for "{niche}"</h4>
                  <div className="suggestions-grid">
                    {dropshipperSuggestions.map((item, index) => (
                      <div key={index} className="suggestion-card">
                        <h5>{item.title}</h5>
                        <p><strong>Trend Reason:</strong> {item.reason}</p>
                        <p><strong>Strategy:</strong> {item.strategy}</p>
                        <button
                          className="secondary-button list-btn"
                          onClick={() => {
                            setPrompt(`Create high-converting ad visuals for ${item.title} in the ${niche} niche`);
                            alert(`${item.title} selected for design! Prompt updated.`);
                          }}
                        >
                          Design for this Product
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="editor-controls">
            <div className="input-group-wrapper">
              <input
                type="text"
                className="input-field"
                placeholder={
                mode === 'web' ? "e.g., Landing page for tech startup" :
                mode === 'mobile' ? "e.g., E-commerce mobile app UI or fitness tracker interface" :
                mode === 'desktop' ? "e.g., Project management dashboard or professional video editor layout" :
                mode === 'graphics' ? "e.g., Minimalist logo for a travel brand" :
                mode === 'posters' ? "e.g., Minimalist film noir movie poster" :
                mode === 'cinema' ? "e.g., Cinematic shot of a rainy street" :
                mode === 'music' ? "e.g., Lo-fi hip hop beat for studying" :
                mode === 'ad-creative' ? "e.g., High-converting Facebook ad for sneakers" :
                mode === 'langflow' ? "e.g., Ask anything to LangFlow..." :
                mode === 'games' ? "e.g., Cyberpunk character design or RPG map layout" :
                mode === 'automotive' ? "e.g., Futuristic electric supercar concept or sleek private jet design" :
                mode === 'telecoms' ? "e.g., 5G network coverage map or satellite ground station design" :
                mode === 'medias' ? "e.g., News broadcast studio layout or digital magazine cover" :
                mode === 'social-networks' ? "e.g., Viral Instagram story template or YouTube channel branding" :
                mode === 'sports' ? "e.g., Professional football club branding or athlete performance dashboard" :
                mode === 'health' ? "e.g., Medical dashboard interface or fitness tracking app" :
                mode === 'finance' ? "e.g., Mobile banking app UI or fintech marketing campaign" :
                mode === 'art-ai' ? "e.g., Oil painting of a sunset over mountains or abstract digital art" :
                mode === 'education' ? "e.g., Interactive math lesson for kids or global history curriculum layout" :
                mode === 'github' ? "e.g., Personal portfolio for GitHub Pages or documentation site" :
                mode === 'ai-projects' ? "e.g., Architecture for a real-time recommendation engine" :
                mode === 'aws' ? "e.g., AWS architecture diagram for a scalable web app" :
                mode === 'web3' ? "e.g., Smart contract for a decentralized voting system" :
                mode === 'ml-tools' ? `e.g., Enter text to ${mlTask === 'summarization' ? 'summarize' : mlTask === 'sentiment-analysis' ? 'analyze sentiment' : 'translate'}` :
                "e.g., Describe your creative vision..."
              }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button
                className="search-insp-btn"
                onClick={handleGoogleSearch}
                disabled={isSearching}
                title="Search Design Inspiration"
              >
                {isSearching ? '🔍' : '💡'}
              </button>
            </div>
            <button
              className="cta-button"
              onClick={handleGenerate}
              disabled={isGenerating || isProcessingMl}
            >
              {mode === 'ml-tools' ? (isProcessingMl ? 'Processing...' : 'Process Task') : (isGenerating ? 'Generating...' : 'Generate Design')}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="search-results-overlay">
              <div className="search-results-header">
                <h4>Design Inspiration for "{prompt}"</h4>
                <button onClick={() => setSearchResults([])}>✕</button>
              </div>
              <div className="search-results-list">
                {searchResults.map((item, index) => (
                  <div key={index} className="search-result-item">
                    <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
                    <p>{item.snippet}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="preview-area">
            {(isGenerating || isProcessingMl) && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>{isProcessingMl ? 'ML analysis in progress...' : 'AI is thinking...'}</p>
              </div>
            )}
            {previewImage || previewVideo || langflowResponse || mlResult ? (
              <div className="preview-container">
                {mlResult && (
                  <div className="ml-response-box" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                    <h4 style={{ color: '#60a5fa', marginBottom: '1rem' }}>AI/ML Tool Output - {mlTask.replace('-', ' ').toUpperCase()}</h4>
                    <div className="ml-content" style={{ color: '#e2e8f0', lineHeight: '1.6', fontSize: '1.1rem' }}>
                      {mlResult}
                    </div>
                  </div>
                )}
                {langflowResponse && (
                  <div className="langflow-response-box">
                    <h4>LangFlow Output</h4>
                    <div className="langflow-content">
                      {langflowResponse}
                    </div>
                  </div>
                )}
                {mode === 'maps' && mapResults.length > 0 && (
                  <div className="map-preview-container">
                    <MapContainer center={mapCenter} zoom={13} style={{ height: '400px', width: '100%', borderRadius: '1rem' }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <MapUpdater center={mapCenter} />
                      {mapResults.map((place, idx) => (
                        <Marker key={idx} position={[place.geometry.location.lat, place.geometry.location.lng]}>
                          <Popup>
                            <strong>{place.name}</strong><br />
                            {place.formatted_address}
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
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
                      <div className="insight-actions">
                        <button className="icon-btn" onClick={() => copyToClipboard(aiInsight)} title="Copy Insight">
                          {copySuccess || '📋'}
                        </button>
                        <button className="share-btn" onClick={handleShare}>
                          <span className="share-icon">📤</span> Share
                        </button>
                        <button className="share-btn facebook-share" onClick={handleFacebookShare}>
                          <span className="share-icon">f</span> Facebook Share
                        </button>
                      </div>
                    </div>
                    <p>{aiInsight}</p>
                    <div className="media-actions">
                      <button
                        className="secondary-button screenshot-btn"
                        onClick={() => handleTakeScreenshot(window.location.href)}
                        disabled={isTakingScreenshot}
                      >
                        {isTakingScreenshot ? '📸 Capturing...' : '📸 Take App Screenshot'}
                      </button>
                      {previewImage && (
                        <button className="secondary-button download-btn" onClick={() => downloadMedia(previewImage, `design-${Date.now()}.jpg`)}>
                          📥 Download Image
                        </button>
                      )}
                      {previewVideo && (
                        <button className="secondary-button download-btn" onClick={() => downloadMedia(previewVideo, `video-${Date.now()}.mp4`)}>
                          📥 Download Video
                        </button>
                      )}
                      {user && (
                        <button
                          className="secondary-button facebook-post-btn"
                          onClick={handlePostToFacebookAPI}
                          disabled={isPostingToFacebook}
                        >
                          {isPostingToFacebook ? 'Posting...' : '📱 Post to Facebook Feed'}
                        </button>
                      )}
                    </div>
                    {mode === 'dropshipper' && (
                      <div className="list-for-sale-container">
                        <button
                          className={`cta-button list-for-sale-btn ${listSuccess ? 'success' : ''}`}
                          onClick={() => {
                            setIsListing(true);
                            setTimeout(() => {
                              setIsListing(false);
                              setListSuccess(true);
                              setTimeout(() => setListSuccess(false), 3000);
                            }, 1500);
                          }}
                          disabled={isListing || listSuccess}
                          style={{ marginTop: '1rem', width: '100%' }}
                        >
                          {isListing ? 'Listing...' : listSuccess ? '✅ Listed on Marketplace!' : '🚀 List for Sale & Boost Visibility'}
                        </button>
                        {listSuccess && <p className="success-msg">Your design is now live on DesignAI Marketplace!</p>}
                      </div>
                    )}
                    {screenshotResult && (
                      <div className="screenshot-result-box" style={{ marginTop: '1rem' }}>
                        <h4>App Screenshot Capture</h4>
                        <img src={screenshotResult} alt="App Screenshot" style={{ width: '100%', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <button className="secondary-button" onClick={() => downloadMedia(screenshotResult, `screenshot-${Date.now()}.png`)} style={{ marginTop: '0.5rem', width: '100%' }}>
                          📥 Download Screenshot
                        </button>
                      </div>
                    )}
                    {mode === 'github' && (
                      <div className="github-actions-container">
                        <button
                          className={`cta-button github-deploy-btn ${deployUrl ? 'success' : ''}`}
                          onClick={handleGitHubDeploy}
                          disabled={isDeploying}
                          style={{ marginTop: '1rem', width: '100%' }}
                        >
                          {isDeploying ? 'Deploying to GitHub...' : deployUrl ? '✅ Deployed to GitHub Pages!' : '🚀 Deploy to GitHub Pages'}
                        </button>
                        {deployUrl && (
                          <div className="deploy-success-box">
                            <p className="success-msg" style={{ color: '#10b981', marginTop: '0.5rem' }}>Your site is live!</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <a href={deployUrl} target="_blank" rel="noopener noreferrer" className="deploy-link" style={{ color: '#60a5fa', textDecoration: 'underline' }}>{deployUrl}</a>
                              {repoUrl && (
                                <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="repo-link" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 'bold' }}>View on GitHub Session</a>
                              )}
                            </div>
                          </div>
                        )}
                        {copilotSuggestion && (
                          <div className="copilot-suggestion-box" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <div className="copilot-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span className="copilot-icon">🤖</span>
                              <h4 style={{ margin: 0 }}>GitHub Copilot Suggestion</h4>
                            </div>
                            <pre className="copilot-code" style={{ whiteSpace: 'pre-wrap', background: '#1e293b', padding: '1rem', borderRadius: '0.3rem', fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '1rem' }}>
                              <code>{copilotSuggestion}</code>
                            </pre>
                            <button className="secondary-button apply-btn" onClick={() => alert('Suggestion applied to your project!')} style={{ width: '100%' }}>
                              Apply Suggestion
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <p>Your AI generation will appear here</p>
              </div>
            )}
          </div>
          {history.length > 0 && (
            <div className="history-section">
              <h3>Generation History</h3>
              <div className="history-grid">
                {history.map((item, index) => (
                  <div key={index} className="history-item" onClick={() => {
                    setPrompt(item.prompt);
                    setMode(item.mode);
                    setPreviewImage(item.imageUrl);
                    setPreviewVideo(item.videoUrl);
                    setAiInsight(item.insight);
                    setLangflowResponse(item.langflowResponse);
                  }}>
                    <div className="history-thumb">
                      {item.imageUrl ? <img src={item.imageUrl} alt="History Thumb" /> :
                       item.videoUrl ? <div className="video-thumb">🎥</div> :
                       <div className="text-thumb">TXT</div>}
                    </div>
                    <div className="history-info">
                      <div className="history-prompt">{item.prompt}</div>
                      <div className="history-meta">{item.mode} • {item.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <footer>
        <p>&copy; 2024 DesignAI Studio. Empowering creators through artificial intelligence.</p>
      </footer>
    </div>
  );
}

export default App;
