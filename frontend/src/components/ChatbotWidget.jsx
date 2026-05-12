import React, { useEffect, useState } from 'react';

const ChatbotWidget = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=4"]'
    );

    // Check if component is already defined
    const isAlreadyDefined = window.customElements?.get('df-messenger');

    if (!existingScript && !isAlreadyDefined) {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=4';
      script.async = true;
      script.onload = () => setLoaded(true);
      document.body.appendChild(script);
    } else {
      // Script already loaded or component defined
      setLoaded(true);
    }
  }, []);

  return (
    <>
      {loaded && (
        <df-messenger
          intent="WELCOME"
          chat-title="project-agro-idukki"
          agent-id="ee621ebc-a62e-4e18-b1bd-7a43fbe712bf"
          language-code="en"
          chat-icon="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        ></df-messenger>
      )}
    </>
  );
};

export default ChatbotWidget;
