const axios = require('axios');
const { WHATSAPP_API_KEY } = process.env;

const sendWhatsAppMessage = async (to, message) => {
  try {
    const response = await axios.post(
      'https://api.whatsapp.com/v1/messages',
      {
        to,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('WhatsApp API error:', error.response?.data || error.message);
    throw new Error('Failed to send WhatsApp message');
  }
};

const handleIncomingWhatsAppMessage = async (from, message) => {
  // Process message and generate response
  // This would integrate with Dialogflow and your business logic
  
  let response;
  if (message.toLowerCase().includes('weather')) {
    response = "The current weather in your area is sunny with a high of 28°C.";
  } else if (message.toLowerCase().includes('report')) {
    response = "To report crop loss, please visit our app or reply with:\n1. Crop type\n2. Damage description\n3. Photo if available";
  } else {
    response = "Thank you for your message. For farming advice, type 'advice'. To report crop loss, type 'report'.";
  }
  
  await sendWhatsAppMessage(from, response);
  return response;
};

module.exports = { sendWhatsAppMessage, handleIncomingWhatsAppMessage };