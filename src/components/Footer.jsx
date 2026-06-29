import React from 'react';

const Footer = ({ t }) => {
  return (
    <footer>
      <p>&copy; 2026 DesignAI Studio. {t('footer_text')}</p>
    </footer>
  );
};

export default Footer;
