import React from 'react';

const Pricing = ({ t, handlePayment }) => {
  return (
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
            <li>{t('price_hd_export')}</li>
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
  );
};

export default Pricing;
