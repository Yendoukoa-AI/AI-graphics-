import React from 'react';

const Navbar = ({ t, language, setLanguage, user, API_URL, setShowAuthModal, setAuthMode, setIsMenuOpen, isMenuOpen }) => {
  return (
    <nav className="navbar">
      <div className="logo">{t('logo_text')}</div>

      <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? '✕' : '☰'}
      </button>

      <div className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
        <a href="#features" onClick={() => setIsMenuOpen(false)}>{t('features')}</a>
        <a href="#editor" onClick={() => setIsMenuOpen(false)}>{t('editor')}</a>
        <a href="#pricing" onClick={() => setIsMenuOpen(false)}>{t('pricing')}</a>
        <a href="#showcase" onClick={() => setIsMenuOpen(false)}>{t('showcase')}</a>
        <a href="https://github.com/GYFX35/AI-graphics-/releases" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>{t('github_session')}</a>

        <div className="mobile-only-actions">
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
          <button className="sponsor-button" onClick={() => { document.getElementById('sponsorship')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }}>{t('sponsor')}</button>

          {user ? (
            <div className="user-profile-mobile" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src={user.photos?.[0]?.value || `https://ui-avatars.com/api/?name=${user.displayName}`} alt={user.displayName} className="user-avatar" />
                <span>{user.displayName}</span>
              </div>
              <a href={`${API_URL}/auth/logout`} className="logout-link" style={{ textAlign: 'start' }}>{t('logout')}</a>
            </div>
          ) : (
            <div className="auth-buttons-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="cta-button login-btn email" onClick={() => { setAuthMode('login'); setShowAuthModal(true); setIsMenuOpen(false); }}>{t('login_register')}</button>
              <a href={`${API_URL}/auth/google`} className="cta-button login-btn google" style={{ textAlign: 'center' }}>{t('continue_google')}</a>
              <a href={`${API_URL}/auth/facebook`} className="cta-button login-btn facebook" style={{ textAlign: 'center' }}>{t('continue_facebook')}</a>
            </div>
          )}
        </div>
      </div>

      <div className="nav-actions desktop-only">
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
  );
};

export default Navbar;
