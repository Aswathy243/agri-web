import React, { useEffect } from 'react';

const GoogleTranslate = () => {
  useEffect(() => {
    try {
      const addScript = document.createElement('script');
      addScript.setAttribute(
        'src',
        '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      );
      document.body.appendChild(addScript);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,ml,hi,ta',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          'google_translate_element'
        );
      };
    } catch (e) {
      console.error('Google Translate error:', e);
    }
  }, []);

  return (
    <div id="google_translate_element" className="fixed bottom-4 right-4 z-50" />
  );
};

export default GoogleTranslate;
