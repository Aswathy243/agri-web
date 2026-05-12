import React, { useEffect } from "react";

const LanguageSwitcher = () => {
  useEffect(() => {
    // Initialize Google Translate
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = function() {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,ml,ta',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      };
    }

    // Load Google Translate script
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    }

    // Hide Google branding after the widget loads
    const hideGoogleBranding = () => {
      const iframe = document.querySelector('iframe.goog-te-banner-frame');
      if (iframe) {
        iframe.style.display = 'none';
      }
      
      const banner = document.querySelector('.goog-te-banner');
      if (banner) {
        banner.style.display = 'none';
      }
      
      // Hide "Powered by Google Translate" text
      const poweredBy = document.querySelector('.goog-te-gadget .goog-te-gadget-simple .goog-te-menu-value span:last-child');
      if (poweredBy) {
        poweredBy.style.display = 'none';
      }
      
      // Alternative method to hide branding
      const gadget = document.querySelector('.goog-te-gadget');
      if (gadget) {
        const spans = gadget.querySelectorAll('span');
        spans.forEach(span => {
          if (span.textContent && span.textContent.toLowerCase().includes('powered by')) {
            span.style.display = 'none';
          }
        });
      }
    };

    // Try to hide branding immediately and also after delays
    const timer1 = setTimeout(hideGoogleBranding, 100);
    const timer2 = setTimeout(hideGoogleBranding, 500);
    const timer3 = setTimeout(hideGoogleBranding, 1000);

    // Create a mutation observer to hide branding when DOM changes
    const observer = new MutationObserver(() => {
      hideGoogleBranding();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="text-right px-4 py-2">
      <div id="google_translate_element" />
      <style>{`
        /* CSS to hide Google Translate branding */
        .goog-te-banner-frame {
          display: none !important;
        }
        
        .goog-te-banner {
          display: none !important;
        }
        
        .goog-te-gadget .goog-te-gadget-simple .goog-te-menu-value span:last-child {
          display: none !important;
        }
        
        /* Improved dropdown styling */
        .goog-te-gadget-simple {
          border: none !important;
          background-color: transparent !important;
          padding: 0 !important;
        }
        
        /* Hide the Google Translate logo/icon */
        .goog-te-gadget .goog-te-gadget-simple img {
          display: none !important;
        }
        
        /* Style the dropdown to look cleaner */
        .goog-te-gadget-simple .goog-te-menu-value {
          color: #333 !important;
          font-family: inherit !important;
          font-size: 14px !important;
          padding: 6px 12px !important;
          border: 1px solid #ddd !important;
          border-radius: 4px !important;
          background-color: white !important;
          cursor: pointer !important;
          display: inline-block !important;
          min-width: 120px !important;
        }
        
        /* Dropdown arrow styling */
        .goog-te-menu-value:after {
          content: "▼" !important;
          font-size: 10px !important;
          margin-left: 8px !important;
          color: #666 !important;
        }
        
        /* Hide any remaining branding text */
        .goog-te-gadget span[style*="white-space:nowrap"] {
          display: none !important;
        }
        
        /* Dropdown options styling */
        .goog-te-menu2 {
          background: white !important;
          border: 1px solid #ddd !important;
          border-radius: 4px !important;
          box-shadow: 0 2px 4px rgba(36, 215, 20, 0.1) !important;
        }
        
        .goog-te-menu2-item {
          padding: 8px 12px !important;
          color: #333 !important;
        }
        
        .goog-te-menu2-item:hover {
          background-color: #f5f5f5 !important;
        }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher;