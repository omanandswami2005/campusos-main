// CampusGPT Configuration
export const config = {
  // Azure OpenAI settings
  azureOpenAI: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
    apiVersion: '2024-02-15-preview',
  },

  // Azure Speech settings
  azureSpeech: {
    key: process.env.AZURE_SPEECH_KEY || '',
    region: process.env.AZURE_SPEECH_REGION || 'eastus',
  },

  // Server settings
  server: {
    port: parseInt(process.env.CAMPUS_GPT_PORT || '3010', 10),
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
};
