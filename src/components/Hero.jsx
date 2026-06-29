import React from 'react';

const Hero = ({ t, user, API_URL }) => {
  return (
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
  );
};

export default Hero;
