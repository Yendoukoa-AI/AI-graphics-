import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { translations } from './translations';
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
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
  const [isUploadingToCloudinary, setIsUploadingToCloudinary] = useState(false);
  const [provider, setProvider] = useState('google');
  const [useRAG, setUseRAG] = useState(false);
  const [mlTask, setMlTask] = useState('summarization');
  const [mlResult, setMlResult] = useState('');
  const [isProcessingMl, setIsProcessingMl] = useState(false);
  const [isProcessingPhotoshop, setIsProcessingPhotoshop] = useState(false);
  const [fineTuningJobs, setFineTuningJobs] = useState([]);
  const [fineTunedModelsList, setFineTunedModelsList] = useState([]);
  const [selectedFineTunedModel, setSelectedFineTunedModel] = useState(null);
  const [isFinetuningLoading, setIsFinetuningLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [language, setLanguage] = useState('en');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const t = (key) => translations[language][key] || translations['en'][key];

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

  const handleGooglePlaces = async (internalCall = false) => {
    if (!prompt) return;
    if (!internalCall) setIsGenerating(true);
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
      if (!internalCall) setIsGenerating(false);
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

  const handleCloudinaryUpload = async () => {
    if (!previewImage) return;
    setIsUploadingToCloudinary(true);
    try {
      const response = await fetch(`${API_URL}/api/cloudinary/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: previewImage }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.secure_url) {
        setCloudinaryUrl(data.secure_url);
        alert('Successfully uploaded to Cloudinary!');
      } else {
        alert('Failed to upload to Cloudinary: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      alert('Error uploading to Cloudinary.');
    } finally {
      setIsUploadingToCloudinary(false);
    }
  };

  const handlePayment = async (gateway, amount) => {
    try {
      const payload = {
        gateway,
        amount,
        email: user?.email,
        planName: 'DesignAI Studio Pro'
      };

      const response = await fetch(`${API_URL}/api/payments/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error(`Error initializing ${gateway} payment:`, error);
      alert(`Failed to initialize ${gateway} payment.`);
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

  const handlePhotoshopTask = async (task, imageUrl) => {
    if (!imageUrl) return;
    setIsProcessingPhotoshop(true);
    const API_URL = import.meta.env.VITE_API_URL || '';
    try {
      const response = await fetch(`${API_URL}/api/photoshop/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ task, imageUrl }),
      });
      const data = await response.json();
      if (data.imageUrl) {
        setPreviewImage(data.imageUrl);
        alert(t(data.messageKey || 'retouch_complete'));
      } else {
        alert('Photoshop tool failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error with Photoshop task:', error);
      alert('Failed to connect to Photoshop service.');
    } finally {
      setIsProcessingPhotoshop(false);
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
        await handleGooglePlaces(true);
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
          setHistory(prev => [result, ...prev]);
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
        setHistory(prev => [result, ...prev]);
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
        setHistory(prev => [result, ...prev]);
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
    <div className="App" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="auth-modal">
            <button className="close-modal" onClick={() => setShowAuthModal(false)}>✕</button>
            <h3>
              {authMode === 'login' ? t('login_register') :
               authMode === 'register' ? t('register_btn') :
               authMode === 'forgot-password' ? t('forgot_password') : t('reset_password')}
            </h3>
            {authError && <p className="auth-error-msg">{authError}</p>}
            {authMessage && <p className="auth-success-msg" style={{ color: '#10b981', marginBottom: '1rem', textAlign: 'center' }}>{authMessage}</p>}
            <form onSubmit={handleAuth}>
              {authMode === 'register' && (
                <div className="input-field-group">
                  <label>{t('display_name')}</label>
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
                  <label>{t('email_address')}</label>
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
                  <label>{t('password')}</label>
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
                  {authMode === 'login' ? t('login_btn') : t('register_btn')}
                </button>
              )}
              {authMode === 'forgot-password' && (
                <button type="submit" className="cta-button auth-submit">
                  {t('send_reset')}
                </button>
              )}
              {authMode === 'reset-password' && (
                <>
                  <div className="input-field-group">
                    <label>{t('new_password')}</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <button type="submit" className="cta-button auth-submit">
                    {t('reset_password')}
                  </button>
                </>
              )}
            </form>
            <div className="auth-switch">
              {authMode === 'login' ? (
                <>
                  <p>{t('no_account')} <button onClick={() => setAuthMode('register')}>{t('register_btn')}</button></p>
                  <p><button onClick={() => setAuthMode('forgot-password')}>{t('forgot_password')}</button></p>
                </>
              ) : authMode === 'register' ? (
                <p>{t('already_account')} <button onClick={() => setAuthMode('login')}>{t('login_btn')}</button></p>
              ) : (
                <p><button onClick={() => setAuthMode('login')}>{t('back_login')}</button></p>
              )}
            </div>
            <div className="auth-divider">
              <span>{t('or')}</span>
            </div>
            <div className="social-auth-options">
              <a href={`${API_URL}/auth/google`} className="social-auth-btn google">{t('continue_google')}</a>
              <a href={`${API_URL}/auth/facebook`} className="social-auth-btn facebook">{t('continue_facebook')}</a>
            </div>
          </div>
        </div>
      )}
      <nav className="navbar">
        <div className="logo">{t('logo_text')}</div>
        <div className="nav-links">
          <a href="#features">{t('features')}</a>
          <a href="#editor">{t('editor')}</a>
          <a href="#pricing">{t('pricing')}</a>
          <a href="#showcase">{t('showcase')}</a>
          <a href="https://github.com/GYFX35/AI-graphics-/releases" target="_blank" rel="noopener noreferrer">{t('github_session')}</a>
        </div>
        <div className="nav-actions">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-selector"
          >
            <option value="en">{t('lang_en')}</option>
            <option value="fr">{t('lang_fr')}</option>
            <option value="es">{t('lang_es')}</option>
            <option value="zh">{t('lang_zh')}</option>
            <option value="ja">{t('lang_ja')}</option>
            <option value="ar">{t('lang_ar')}</option>
          </select>
          <button className="sponsor-button" onClick={() => document.getElementById('sponsorship')?.scrollIntoView({ behavior: 'smooth' })}>{t('sponsor')}</button>
          {user ? (
            <div className="user-profile">
              <img src={user.photos?.[0]?.value || `https://ui-avatars.com/api/?name=${user.displayName}`} alt={user.displayName} className="user-avatar" />
              <div className="user-dropdown">
                <span>{user.displayName}</span>
                <a href={`${API_URL}/auth/logout`} className="logout-link">{t('logout')}</a>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                className="cta-button login-btn email"
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              >
                {t('login_register')}
              </button>
              <a href={`${API_URL}/auth/google`} className="cta-button login-btn google">{t('continue_google')}</a>
              <a href={`${API_URL}/auth/facebook`} className="cta-button login-btn facebook">{t('continue_facebook')}</a>
            </div>
          )}
        </div>
      </nav>

      <header className="hero">
        {!user && (
          <div className="auth-nudge">
            <span className="nudge-icon">🔒</span>
            <span>{t('connect_google_nudge')}</span>
            <a href={`${API_URL}/auth/google`} className="nudge-link">{t('connect_now')}</a>
          </div>
        )}
        <div className="hero-badge">{t('hero_badge')}</div>
        <h1>{t('hero_title_1')} <br /> {t('hero_title_2')}</h1>
        <p>{t('hero_subtitle')}</p>
        <div className="hero-actions">
          <button className="cta-button" onClick={() => document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' })}>{t('try_free')}</button>
          <a href="#editor" className="secondary-button" style={{ textDecoration: 'none', display: 'inline-block' }}>{t('watch_demo')}</a>
        </div>
      </header>

      <section className="how-it-works">
        <h2>{t('how_it_works')}</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">1</div>
            <h4>{t('step_1_title')}</h4>
            <p>{t('step_1_desc')}</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>{t('step_2_title')}</h4>
            <p>{t('step_2_desc')}</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>{t('step_3_title')}</h4>
            <p>{t('step_3_desc')}</p>
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
          <span className="card-icon">🖼️</span>
          <h3>{t('posters_feature_title')}</h3>
          <p>{t('posters_feature_desc')}</p>
        </div>
        <div className="card">
          <span className="card-icon">🌐</span>
          <h3>{t('web_design_title')}</h3>
          <p>{t('web_design_desc')}</p>
        </div>
        <div className="card">
          <span className="card-icon">📱</span>
          <h3>{t('mobile_design_title')}</h3>
          <p>{t('mobile_design_desc')}</p>
        </div>
        <div className="card">
          <span className="card-icon">💻</span>
          <h3>{t('desktop_design_title')}</h3>
          <p>{t('desktop_design_desc')}</p>
        </div>
        <div className="card">
          <span className="card-icon">🎨</span>
          <h3>{t('graphics_design_title')}</h3>
          <p>{t('graphics_design_desc')}</p>
        </div>
        <div className="card">
          <span className="card-icon">⚡</span>
          <h3>{t('realtime_gen_title')}</h3>
          <p>{t('realtime_gen_desc')}</p>
        </div>
      </section>

      <section className="enhancements-section">
        <div className="section-header">
          <h2>{t('ai_enhancements')}</h2>
          <p>{t('ai_enhancements_subtitle')}</p>
        </div>
        <div className="features enhancements-grid">
          <div className="card enhancement-card">
            <span className="card-icon">🎥</span>
            <h3>{t('cinema_ai_title')}</h3>
            <p>{t('cinema_ai_desc')}</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🎵</span>
            <h3>{t('music_ai_title')}</h3>
            <p>{t('music_ai_desc')}</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🌎</span>
            <h3>{t('global_ent_title')}</h3>
            <p>{t('global_ent_desc')}</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">📢</span>
            <h3>{t('ad_creative_title')}</h3>
            <p>{t('ad_creative_desc')}</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🎮</span>
            <h3>{t('games_design_title')}</h3>
            <p>{t('games_design_desc')}</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🏎️</span>
            <h3>{t('automotive_title')}</h3>
            <p>{t('automotive_desc')}</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">📦</span>
            <h3>{t('dropshipper_title')}</h3>
            <p>{t('dropshipper_desc')}</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">📡</span>
            <h3>{t('telecoms_title')}</h3>
            <p>{t('telecoms_desc')}</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">📺</span>
            <h3>{t('medias_title')}</h3>
            <p>{t('medias_desc')}</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">📱</span>
            <h3>{t('social_networks_title')}</h3>
            <p>{t('social_networks_desc')}</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🏆</span>
            <h3>{t('sports_ai_title')}</h3>
            <p>{t('sports_ai_desc')}</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🏥</span>
            <h3>{t('health_ai_title')}</h3>
            <p>{t('health_ai_desc')}</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">💰</span>
            <h3>{t('finance_ai_title')}</h3>
            <p>{t('finance_ai_desc')}</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🖌️</span>
            <h3>{t('art_ai_title')}</h3>
            <p>{t('art_ai_desc')}</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🎓</span>
            <h3>{t('education_ai_title')}</h3>
            <p>{t('education_ai_desc')}</p>
          </div>
        <div className="card enhancement-card">
          <span className="card-icon">🗺️</span>
          <h3>{t('maps_ai_title')}</h3>
          <p>{t('maps_ai_desc')}</p>
        </div>
          <div className="card enhancement-card">
            <span className="card-icon">🤖</span>
            <h3>{t('ai_projects_title')}</h3>
            <p>{t('ai_projects_desc')}</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">🔗</span>
            <h3>{t('web3_ai_title')}</h3>
            <p>{t('web3_ai_desc')}</p>
          </div>
          <div className="card enhancement-card">
            <span className="card-icon">📊</span>
            <h3>{t('ml_tools_title')}</h3>
            <p>{t('ml_tools_desc')}</p>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing">
        <h2>{t('pricing_title')}</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>{t('price_free')}</h3>
            <div className="price">$0<span>{t('price_month')}</span></div>
            <ul>
              <li>5 Generations per month</li>
              <li>{t('price_basic_templates')}</li>
              <li>{t('price_standard_quality')}</li>
            </ul>
            <button className="pricing-btn" onClick={() => document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' })}>{t('start_free')}</button>
          </div>
          <div className="pricing-card popular">
            <div className="badge">{t('most_popular')}</div>
            <h3>{t('price_pro')}</h3>
            <div className="price">$29<span>{t('price_month')}</span></div>
            <ul>
              <li>{t('price_unlimited_gen')}</li>
              <li>{t('price_photoshop_tools')}</li>
              <li>HD Export Options</li>
              <li>{t('price_priority_support')}</li>
            </ul>
            <div className="payment-options" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="pricing-btn primary" onClick={() => handlePayment('stripe', 29)}>Pay with Stripe</button>
            </div>
          </div>
          <div className="pricing-card">
            <h3>{t('price_enterprise')}</h3>
            <div className="price">{t('price_custom')}</div>
            <ul>
              <li>{t('price_custom_training')}</li>
              <li>API Access</li>
              <li>{t('price_team_collab')}</li>
              <li>{t('price_dedicated_manager')}</li>
            </ul>
            <button className="pricing-btn" onClick={() => alert('Our sales team will be in touch with you shortly!')}>{t('contact_sales')}</button>
          </div>
        </div>
      </section>

      <section id="ecommerce" className="ecommerce-partnership">
        <div className="partnership-content">
          <h2>{t('partnership_title')}</h2>
          <p>{t('partnership_desc')}</p>
          <div className="partnership-grid">
            <div className="partner-card">
              <h4>{t('partnership_sourcing')}</h4>
              <p>{t('partnership_sourcing_desc')}</p>
            </div>
            <div className="partner-card">
              <h4>{t('partnership_fulfillment')}</h4>
              <p>{t('partnership_fulfillment_desc')}</p>
            </div>
            <div className="partner-card">
              <h4>{t('partnership_sales')}</h4>
              <p>{t('partnership_sales_desc')}</p>
            </div>
          </div>
          <button className="cta-button" onClick={() => alert('Thank you for your interest in our Partnership Program! We will contact you soon.')}>{t('partnership_btn')}</button>
        </div>
      </section>

      <section id="sponsorship" className="sponsorship">
        <div className="sponsorship-content">
          <h2>{t('sponsorship_title')}</h2>
          <p>{t('sponsorship_desc')}</p>
          <div className="sponsorship-stats">
            <div className="stat">
              <span className="stat-value">500+</span>
              <span className="stat-label">{t('sponsorship_stat_contributors')}</span>
            </div>
            <div className="stat">
              <span className="stat-value">$10k+</span>
              <span className="stat-label">{t('sponsorship_stat_raised')}</span>
            </div>
          </div>
          <button className="sponsor-cta" onClick={() => handlePayment('stripe', 50)}>{t('sponsorship_btn')}</button>
        </div>
      </section>

      <section className="testimonials">
        <h2>{t('testimonials_title')}</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>"DesignAI has completely changed how I approach web projects. It's like having a senior designer on speed dial."</p>
            <div className="author">
              <div className="author-avatar">SC</div>
              <div className="author-info">
                <strong>{t('testimonial_1_name')}</strong>
                <span>{t('testimonial_1_role')}</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p>"The Photoshop AI tools are mind-blowing. Background removal that used to take minutes now takes seconds."</p>
            <div className="author">
              <div className="author-avatar">MJ</div>
              <div className="author-info">
                <strong>{t('testimonial_2_name')}</strong>
                <span>{t('testimonial_2_role')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="showcase" className="showcase">
        <h2>{t('showcase_title')}</h2>
        <div className="showcase-grid">
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/poster,advertisement" alt="Poster" />
            <div className="showcase-info">{t('showcase_poster')}</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/website,landingpage" alt="Web Design" />
            <div className="showcase-info">{t('showcase_web')}</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/mobile,app,interface" alt="Mobile Design" />
            <div className="showcase-info">{t('showcase_mobile')}</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/desktop,software,dashboard" alt="Desktop App" />
            <div className="showcase-info">{t('showcase_desktop')}</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/photography,retouch" alt="Photoshop" />
            <div className="showcase-info">{t('showcase_photo')}</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/logo,branding" alt="Graphic Design" />
            <div className="showcase-info">{t('showcase_branding')}</div>
          </div>
          <div className="showcase-item">
            <video className="showcase-video" autoPlay muted loop>
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
            </video>
            <div className="showcase-info">{t('showcase_video')}</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/supercar,concept" alt="Automotive Design" />
            <div className="showcase-info">{t('showcase_auto')}</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/sports,stadium" alt="Sports Design" />
            <div className="showcase-info">{t('showcase_sports')}</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/medical,health" alt="Health Design" />
            <div className="showcase-info">{t('showcase_health')}</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/finance,banking" alt="Finance Design" />
            <div className="showcase-info">{t('showcase_finance')}</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/painting,art" alt="Art AI Painter" />
            <div className="showcase-info">{t('showcase_art')}</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/education,learning" alt="Global Education" />
            <div className="showcase-info">{t('showcase_edu')}</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/map,geography" alt="Maps AI" />
            <div className="showcase-info">{t('showcase_maps')}</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/artificial,intelligence,circuit" alt="AI Projects" />
            <div className="showcase-info">{t('showcase_projects')}</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/blockchain,crypto" alt="Web3" />
            <div className="showcase-info">{t('showcase_web3')}</div>
          </div>
          <div className="showcase-item">
            <img src="https://loremflickr.com/400/300/data,analysis,chart" alt="ML Tools" />
            <div className="showcase-info">{t('showcase_ml')}</div>
          </div>
        </div>
      </section>

      <section id="editor" className="demo-section">
        <div className="section-header">
          <h2>{t('experience_power')}</h2>
          <p>{t('experience_subtitle')}</p>
        </div>

        <div className="ai-editor">
          <div className="mode-selector-container">
            <div className="main-smart-controls">
              <button
                className={`smart-toggle-btn ${mode === 'smart' ? 'active' : ''}`}
                onClick={() => setMode('smart')}
              >
                <span className="sparkle">✨</span> {t('smart_ai')}
              </button>
              <button
                className={`smart-toggle-btn poster-primary-btn ${mode === 'posters' ? 'active' : ''}`}
                onClick={() => setMode('posters')}
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', marginInlineStart: '1rem' }}
              >
                <span className="sparkle">🖼️</span> {t('posters_ai')}
              </button>
              <div className="advanced-dropdown">
                <button
                  className="secondary-button dropdown-trigger"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {t('advanced_options')} ▾
                </button>
                <div className={`dropdown-content ${showAdvanced ? 'show' : ''}`}>
                  <div className="dropdown-section">
                    <span className="section-label">{t('specialized_expertise')}</span>
                    <select
                      value={mode === 'smart' ? 'web' : mode}
                      onChange={(e) => {
                        setMode(e.target.value);
                        if (e.target.value === 'shopline') fetchShoplineProducts();
                        if (e.target.value === 'finetuning') fetchFineTuningData();
                      }}
                      className="mode-select-input"
                    >
                      <optgroup label={t('opt_core_design')}>
                        <option value="web">{t('mode_web')}</option>
                        <option value="mobile">{t('mode_mobile')}</option>
                        <option value="desktop">{t('mode_desktop')}</option>
                        <option value="graphics">{t('mode_graphics')}</option>
                        <option value="posters">{t('mode_posters')}</option>
                        <option value="photoshop">{t('mode_photoshop')}</option>
                        <option value="image-gen">{t('mode_image_gen')}</option>
                      </optgroup>
                      <optgroup label={t('opt_creative_ai')}>
                        <option value="cinema">{t('mode_cinema')}</option>
                        <option value="music">{t('mode_music')}</option>
                        <option value="art-ai">{t('mode_art_ai')}</option>
                      </optgroup>
                      <optgroup label={t('opt_business_tech')}>
                        <option value="ad-creative">{t('mode_ads')}</option>
                        <option value="shopline">{t('mode_shopline')}</option>
                        <option value="dropshipper">{t('mode_dropshipper')}</option>
                        <option value="finance">{t('mode_finance')}</option>
                        <option value="telecoms">{t('mode_telecoms')}</option>
                      </optgroup>
                      <optgroup label={t('opt_advanced_tools')}>
                        <option value="github">{t('mode_github')}</option>
                        <option value="langflow">{t('mode_langflow')}</option>
                        <option value="ml-tools">{t('mode_ml_tools')}</option>
                        <option value="ai-projects">{t('mode_ai_projects')}</option>
                        <option value="aws">{t('mode_aws')}</option>
                        <option value="web3">{t('mode_web3')}</option>
                        <option value="finetuning">{t('mode_finetuning')}</option>
                        <option value="maps">{t('mode_maps')}</option>
                      </optgroup>
                    </select>
                  </div>
                  <div className="dropdown-section">
                    <span className="section-label">{t('ai_provider')}</span>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="mode-select-input"
                    >
                      <option value="google">{t('provider_google')}</option>
                      <option value="vertex">{t('provider_vertex')}</option>
                      <option value="claude">{t('provider_claude')}</option>
                      <option value="aws">AWS Bedrock</option>
                      <option value="openrouter">{t('provider_openrouter')}</option>
                      <option value="openai">{t('provider_openai')}</option>
                      <option value="huggingface">{t('provider_huggingface')}</option>
                    </select>
                  </div>
                  <div className="dropdown-section">
                    <label className="rag-toggle-inline">
                      <input
                        type="checkbox"
                        checked={useRAG}
                        onChange={(e) => setUseRAG(e.target.checked)}
                      />
                      {t('use_rag')}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {mode === 'shopline' && (
            <div className="shopline-selector">
              <h4>{t('dropshipper_select_product')}</h4>
              {isFetchingProducts ? (
                <p>{t('loading_products')}</p>
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
                  {isFinetuningLoading ? t('refreshing') : t('refresh_data')}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 style={{ color: '#60a5fa', marginBottom: '1rem' }}>{t('finetune_upload_data')}</h4>
                  <input
                    type="file"
                    accept=".jsonl"
                    onChange={handleFileUpload}
                    style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', width: '100%', border: '1px dashed rgba(255,255,255,0.2)' }}
                  />
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>{t('finetune_upload_desc')}</p>

                  <h4 style={{ color: '#60a5fa', marginTop: '2rem', marginBottom: '1rem' }}>{t('finetune_active_jobs')}</h4>
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
                          <div style={{ color: '#94a3b8', marginTop: '0.2rem' }}>{t('finetune_model_label')}: {job.model}</div>
                          {job.fine_tuned_model && (
                            <div style={{ color: '#60a5fa', fontSize: '0.75rem', marginTop: '0.2rem', wordBreak: 'break-all' }}>{t('finetune_result_label')}: {job.fine_tuned_model}</div>
                          )}
                        </div>
                      ))
                    ) : <p style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>{t('finetune_no_jobs')}</p>}
                  </div>
                </div>

                <div>
                  <h4 style={{ color: '#60a5fa', marginBottom: '1rem' }}>{t('finetune_select_custom')}</h4>
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
                      <div style={{ fontWeight: 'bold' }}>{t('finetune_default_model')}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t('finetune_standard_openai')}</div>
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
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t('finetune_custom_model_label')}</div>
                      </div>
                    ))}
                  </div>
                  {selectedFineTunedModel && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <p style={{ margin: 0, color: '#10b981', fontSize: '0.9rem' }}>
                        <strong>{t('finetune_active_desc')}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {mode === 'ml-tools' && (
            <div className="ml-tools-selector" style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 style={{ marginBottom: '1rem' }}>{t('ml_select_task')}</h4>
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
                  placeholder={t('placeholder_dropshipper')}
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                />
                <button
                  className="cta-button"
                  onClick={fetchDropshipperSuggestions}
                  disabled={isFetchingSuggestions || !niche}
                >
                  {isFetchingSuggestions ? t('finding_trends') : t('find_trending')}
                </button>
              </div>

              {dropshipperSuggestions.length > 0 && (
                <div className="suggestions-list">
                  <h4>{t('ai_recommended_for')} "{niche}"</h4>
                  <div className="suggestions-grid">
                    {dropshipperSuggestions.map((item, index) => (
                      <div key={index} className="suggestion-card">
                        <h5>{item.title}</h5>
                        <p><strong>{t('dropshipper_trend_reason')}:</strong> {item.reason}</p>
                        <p><strong>{t('dropshipper_strategy')}:</strong> {item.strategy}</p>
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
                mode === 'web' ? t('placeholder_web') :
                mode === 'mobile' ? t('placeholder_mobile') :
                mode === 'desktop' ? t('placeholder_desktop') :
                mode === 'graphics' ? t('placeholder_graphics') :
                mode === 'posters' ? t('placeholder_posters') :
                mode === 'cinema' ? t('placeholder_cinema') :
                mode === 'music' ? t('placeholder_music') :
                mode === 'ad-creative' ? t('placeholder_ads') :
                mode === 'langflow' ? t('placeholder_langflow') :
                mode === 'games' ? t('placeholder_games') :
                mode === 'automotive' ? t('placeholder_auto') :
                mode === 'telecoms' ? t('placeholder_telecoms') :
                mode === 'medias' ? t('placeholder_medias') :
                mode === 'social-networks' ? t('placeholder_social') :
                mode === 'sports' ? t('placeholder_sports') :
                mode === 'health' ? t('placeholder_health') :
                mode === 'finance' ? t('placeholder_finance') :
                mode === 'art-ai' ? t('placeholder_art') :
                mode === 'education' ? t('placeholder_edu') :
                mode === 'github' ? t('placeholder_github') :
                mode === 'ai-projects' ? t('placeholder_ai_projects') :
                mode === 'aws' ? t('placeholder_aws') :
                mode === 'web3' ? t('placeholder_web3') :
                mode === 'ml-tools' ? t('placeholder_ml_tools') :
                mode === 'photoshop' ? t('placeholder_photoshop') :
                mode === 'image-gen' ? t('placeholder_image_gen') :
                mode === 'maps' ? t('placeholder_maps') :
                t('placeholder_default')
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
              {mode === 'ml-tools' ? (isProcessingMl ? t('processing') : t('process_task')) : (isGenerating ? t('generating') : t('generate'))}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="search-results-overlay">
              <div className="search-results-header">
                <h4>{t('design_inspiration_for')} "{prompt}"</h4>
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
            {(isGenerating || isProcessingMl || isProcessingPhotoshop) && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>
                  {isProcessingMl ? t('ml_analysis') :
                   isProcessingPhotoshop ? t('processing_photoshop') :
                   t('ai_thinking')}
                </p>
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
                    <h4>{t('langflow_output')}</h4>
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
                      <h4>{t('ai_insight')}</h4>
                      <div className="insight-actions">
                        <button className="icon-btn" onClick={() => copyToClipboard(aiInsight)} title={t('copy')}>
                          {copySuccess || '📋'}
                        </button>
                        <button className="share-btn" onClick={handleShare}>
                          <span className="share-icon">📤</span> {t('share')}
                        </button>
                        <button className="share-btn facebook-share" onClick={handleFacebookShare}>
                          <span className="share-icon">f</span> Facebook {t('share')}
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
                        {isTakingScreenshot ? `📸 ${t('capturing')}` : `📸 ${t('take_screenshot')}`}
                      </button>
                      {previewImage && (
                        <>
                          <button className="secondary-button download-btn" onClick={() => downloadMedia(previewImage, `design-${Date.now()}.jpg`)}>
                            📥 {t('download_image')}
                          </button>
                          <button
                            className="secondary-button cloudinary-btn"
                            onClick={handleCloudinaryUpload}
                            disabled={isUploadingToCloudinary}
                          >
                            {isUploadingToCloudinary ? '☁️ Uploading...' : '☁️ Save to Cloudinary'}
                          </button>
                          <div className="photoshop-quick-tools" style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}>
                            <button className="secondary-button ps-tool-btn" onClick={() => handlePhotoshopTask('remove-bg', previewImage)} disabled={isProcessingPhotoshop}>
                              ✂️ {t('remove_bg')}
                            </button>
                            <button className="secondary-button ps-tool-btn" onClick={() => handlePhotoshopTask('upscale', previewImage)} disabled={isProcessingPhotoshop}>
                              🔍 {t('upscale_image')}
                            </button>
                            <button className="secondary-button ps-tool-btn" onClick={() => handlePhotoshopTask('enhance', previewImage)} disabled={isProcessingPhotoshop}>
                              ✨ {t('enhance_photo')}
                            </button>
                          </div>
                        </>
                      )}
                      {previewVideo && (
                        <button className="secondary-button download-btn" onClick={() => downloadMedia(previewVideo, `video-${Date.now()}.mp4`)}>
                          📥 {t('download_video')}
                        </button>
                      )}
                      {user && (
                        <button
                          className="secondary-button facebook-post-btn"
                          onClick={handlePostToFacebookAPI}
                          disabled={isPostingToFacebook}
                        >
                          {isPostingToFacebook ? t('posting') : '📱 ' + t('post_facebook_feed')}
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
                          {isListing ? t('listing_marketplace') : listSuccess ? '✅ ' + t('listed_marketplace') : '🚀 ' + t('list_for_sale')}
                        </button>
                        {listSuccess && <p className="success-msg">{t('design_live')}</p>}
                      </div>
                    )}
                    {cloudinaryUrl && (
                      <div className="cloudinary-result-box" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(96, 165, 250, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Cloudinary URL:</strong></p>
                        <a href={cloudinaryUrl} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all', fontSize: '0.8rem', color: '#60a5fa' }}>{cloudinaryUrl}</a>
                      </div>
                    )}
                    {screenshotResult && (
                      <div className="screenshot-result-box" style={{ marginTop: '1rem' }}>
                        <h4>{t('screenshot_capture')}</h4>
                        <img src={screenshotResult} alt="App Screenshot" style={{ width: '100%', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <button className="secondary-button" onClick={() => downloadMedia(screenshotResult, `screenshot-${Date.now()}.png`)} style={{ marginTop: '0.5rem', width: '100%' }}>
                          📥 {t('download_screenshot')}
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
                          {isDeploying ? t('deploying_github') : deployUrl ? '✅ ' + t('deployed_github') : '🚀 ' + t('deploy_github')}
                        </button>
                        {deployUrl && (
                          <div className="deploy-success-box">
                            <p className="success-msg" style={{ color: '#10b981', marginTop: '0.5rem' }}>{t('site_live')}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <a href={deployUrl} target="_blank" rel="noopener noreferrer" className="deploy-link" style={{ color: '#60a5fa', textDecoration: 'underline' }}>{deployUrl}</a>
                              {repoUrl && (
                                <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="repo-link" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 'bold' }}>{t('github_session')}</a>
                              )}
                            </div>
                          </div>
                        )}
                        {copilotSuggestion && (
                          <div className="copilot-suggestion-box" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <div className="copilot-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span className="copilot-icon">🤖</span>
                              <h4 style={{ margin: 0 }}>{t('copilot_suggestion_title')}</h4>
                            </div>
                            <pre className="copilot-code" style={{ whiteSpace: 'pre-wrap', background: '#1e293b', padding: '1rem', borderRadius: '0.3rem', fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '1rem' }}>
                              <code>{copilotSuggestion}</code>
                            </pre>
                            <button className="secondary-button apply-btn" onClick={() => alert(t('applied_suggestion'))} style={{ width: '100%' }}>
                              {t('apply_suggestion')}
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
                <p>{t('empty_state')}</p>
              </div>
            )}
          </div>
          {history.length > 0 && (
            <div className="history-section">
              <h3>{t('history')}</h3>
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
        <p>&copy; 2026 DesignAI Studio. {t('footer_text')}</p>
      </footer>
    </div>
  );
}

export default App;
