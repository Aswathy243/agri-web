const dialogflow = require('@google-cloud/dialogflow');
const { DIALOGFLOW_PROJECT_ID } = process.env;

const sessionsClient = new dialogflow.SessionsClient();

const detectIntent = async (sessionId, query, languageCode = 'en') => {
  const sessionPath = sessionsClient.projectAgentSessionPath(
    DIALOGFLOW_PROJECT_ID,
    sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode,
      },
    },
  };

  try {
    const responses = await sessionsClient.detectIntent(request);
    const result = responses[0].queryResult;
    return {
      intent: result.intent.displayName,
      fulfillmentText: result.fulfillmentText,
      parameters: result.parameters.fields
    };
  } catch (error) {
    console.error('Dialogflow error:', error);
    throw new Error('Failed to detect intent');
  }
};

module.exports = { detectIntent };