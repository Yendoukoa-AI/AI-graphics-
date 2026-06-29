import React from 'react';

const Features = ({ t }) => {
  return (
    <>
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
          {[
            { id: 'cinema_ai', icon: '🎥' },
            { id: 'music_ai', icon: '🎵' },
            { id: 'global_ent', icon: '🌎' },
            { id: 'ad_creative', icon: '📢' },
            { id: 'games_design', icon: '🎮' },
            { id: 'automotive', icon: '🏎️' },
            { id: 'dropshipper', icon: '📦' },
            { id: 'telecoms', icon: '📡' },
            { id: 'medias', icon: '📺' },
            { id: 'social_networks', icon: '📱' },
            { id: 'sports_ai', icon: '🏆' },
            { id: 'health_ai', icon: '🏥' },
            { id: 'finance_ai', icon: '💰' },
            { id: 'art_ai', icon: '🖌️' },
            { id: 'education_ai', icon: '🎓' },
            { id: 'maps_ai', icon: '🗺️' },
            { id: 'ai_projects', icon: '🤖' },
            { id: 'web3_ai', icon: '🔗' },
            { id: 'ml_tools', icon: '📊' }
          ].map(feat => (
            <div key={feat.id} className="card enhancement-card">
              <span className="card-icon">{feat.icon}</span>
              <h3>{t(`${feat.id}_title`)}</h3>
              <p>{t(`${feat.id}_desc`)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Features;
