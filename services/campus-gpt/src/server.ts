// CampusGPT Server - Azure OpenAI with Function Calling (Stable SDK)
import express, { Request, Response } from 'express';
import cors from 'cors';
import { AzureOpenAI } from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionToolMessageParam,
} from 'openai/resources/chat/completions';
import { config } from './config.js';
import { tools } from './tools.js';
import { handleToolCall } from './tool-handlers.js';

const app = express();

// Middleware
app.use(cors({ origin: config.server.corsOrigins }));
app.use(express.json());

// Initialize Azure OpenAI client
let openaiClient: AzureOpenAI | null = null;

if (config.azureOpenAI.apiKey && config.azureOpenAI.endpoint) {
  openaiClient = new AzureOpenAI({
    apiKey: config.azureOpenAI.apiKey,
    endpoint: config.azureOpenAI.endpoint,
    deployment: config.azureOpenAI.deploymentName,
    apiVersion: config.azureOpenAI.apiVersion,
  });
}

// System prompt for CampusGPT
const SYSTEM_PROMPT = `You are CampusGPT, a helpful AI assistant for CampusOS - a campus management platform.

Your capabilities include:
- Finding and recommending campus events (workshops, seminars, cultural events, sports)
- Showing canteen menu items and helping order food
- Providing information about campus clubs and organizations
- Helping with event registrations
- Explaining academic concepts and helping with studies

Personality:
- Friendly and approachable, like a helpful senior student
- Enthusiastic about campus activities
- Concise but informative responses
- Use emojis occasionally to be friendly 😊

When responding:
1. If the user asks about events, use the getEvents tool
2. If they ask about food/menu/canteen, use the getMenuItems tool
3. If they want to order food, use createCanteenOrder tool
4. If they ask about clubs, use the getClubs tool
5. If they want to register for an event, use registerForEvent tool
6. For study help, use explainConcept tool then provide a detailed explanation

Always be helpful and guide users to discover campus activities!`;

// Types for incoming requests (from frontend)
interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: IncomingMessage[];
  userId?: string;
}

interface StreamChunk {
  type: 'text' | 'tool_call' | 'tool_result' | 'ui_component' | 'done' | 'error';
  content?: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: unknown;
  uiComponent?: string;
  uiData?: unknown;
}

// Streaming chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages } = req.body as ChatRequest;

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendChunk = (chunk: StreamChunk) => {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  };

  try {
    // Build messages with system prompt - using proper OpenAI types
    const fullMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(
        (m): ChatCompletionMessageParam => ({
          role: m.role,
          content: m.content,
        })
      ),
    ];

    // Check if Azure OpenAI is configured
    if (!openaiClient) {
      // Mock response for demo if Azure not configured
      await handleMockResponse(messages, sendChunk);
      sendChunk({ type: 'done' });
      res.end();
      return;
    }

    // Call Azure OpenAI using stable SDK
    const response = await openaiClient.chat.completions.create({
      model: '', // Model is set via deployment in Azure
      messages: fullMessages,
      tools,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;

    // Handle tool calls if present
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolMessages: ChatCompletionToolMessageParam[] = [];

      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        sendChunk({
          type: 'tool_call',
          toolName,
          toolArgs,
        });

        // Execute the tool
        const { result, uiComponent } = await handleToolCall(toolName as any, toolArgs);

        sendChunk({
          type: 'tool_result',
          toolName,
          toolResult: result,
        });

        // Send UI component data for generative UI
        sendChunk({
          type: 'ui_component',
          uiComponent,
          uiData: result,
        });

        toolMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      // Get final response with tool results
      const messagesWithTools: ChatCompletionMessageParam[] = [
        ...fullMessages,
        assistantMessage,
        ...toolMessages,
      ];

      const finalResponse = await openaiClient.chat.completions.create({
        model: '', // Model is set via deployment in Azure
        messages: messagesWithTools,
        temperature: 0.7,
        max_tokens: 500,
      });

      const finalText = finalResponse.choices[0].message.content;
      if (finalText) {
        sendChunk({ type: 'text', content: finalText });
      }
    } else {
      // No tool calls, just text response
      sendChunk({ type: 'text', content: assistantMessage.content || '' });
    }

    sendChunk({ type: 'done' });
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    // Fallback to mock response on error
    await handleMockResponse(messages, sendChunk);
    sendChunk({ type: 'done' });
    res.end();
  }
});

// Mock response handler for demo without Azure
async function handleMockResponse(
  messages: IncomingMessage[],
  sendChunk: (chunk: StreamChunk) => void
) {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

  // Simulate typing delay
  await new Promise((r) => setTimeout(r, 500));

  if (
    lastMessage.includes('event') ||
    lastMessage.includes('happening') ||
    lastMessage.includes('workshop')
  ) {
    sendChunk({ type: 'tool_call', toolName: 'getEvents', toolArgs: {} });
    await new Promise((r) => setTimeout(r, 300));

    const { result, uiComponent } = await handleToolCall('getEvents', {});
    sendChunk({ type: 'ui_component', uiComponent, uiData: result });
    await new Promise((r) => setTimeout(r, 200));

    sendChunk({
      type: 'text',
      content:
        'Here are the upcoming events on campus! 🎉 Check them out and register for the ones that interest you.',
    });
  } else if (
    lastMessage.includes('food') ||
    lastMessage.includes('menu') ||
    lastMessage.includes('eat') ||
    lastMessage.includes('hungry') ||
    lastMessage.includes('canteen')
  ) {
    sendChunk({ type: 'tool_call', toolName: 'getMenuItems', toolArgs: {} });
    await new Promise((r) => setTimeout(r, 300));

    const { result, uiComponent } = await handleToolCall('getMenuItems', {});
    sendChunk({ type: 'ui_component', uiComponent, uiData: result });
    await new Promise((r) => setTimeout(r, 200));

    sendChunk({
      type: 'text',
      content:
        "Here's what's available in the canteen today! 🍽️ Everything looks delicious. Would you like to order something?",
    });
  } else if (
    lastMessage.includes('club') ||
    lastMessage.includes('join') ||
    lastMessage.includes('society')
  ) {
    sendChunk({ type: 'tool_call', toolName: 'getClubs', toolArgs: {} });
    await new Promise((r) => setTimeout(r, 300));

    const { result, uiComponent } = await handleToolCall('getClubs', {});
    sendChunk({ type: 'ui_component', uiComponent, uiData: result });
    await new Promise((r) => setTimeout(r, 200));

    sendChunk({
      type: 'text',
      content:
        'Here are some amazing clubs you can join! 🎯 Each one offers a great opportunity to learn and make friends.',
    });
  } else if (
    lastMessage.includes('order') &&
    (lastMessage.includes('samosa') ||
      lastMessage.includes('coffee') ||
      lastMessage.includes('dosa'))
  ) {
    // Simulate order
    const items = [];
    if (lastMessage.includes('samosa')) items.push({ menuItemId: 'menu-004', quantity: 2 });
    if (lastMessage.includes('coffee')) items.push({ menuItemId: 'menu-003', quantity: 1 });
    if (lastMessage.includes('dosa')) items.push({ menuItemId: 'menu-001', quantity: 1 });

    if (items.length === 0) items.push({ menuItemId: 'menu-004', quantity: 2 });

    sendChunk({ type: 'tool_call', toolName: 'createCanteenOrder', toolArgs: { items } });
    await new Promise((r) => setTimeout(r, 500));

    const { result, uiComponent } = await handleToolCall('createCanteenOrder', { items });
    sendChunk({ type: 'ui_component', uiComponent, uiData: result });
    await new Promise((r) => setTimeout(r, 200));

    sendChunk({
      type: 'text',
      content:
        'Your order has been placed! 🎉 Show the OTP at the counter to collect your food. Enjoy your meal!',
    });
  } else {
    // Default greeting/help response
    sendChunk({
      type: 'text',
      content: `Hey there! 👋 I'm CampusGPT, your AI campus assistant powered by Azure OpenAI.

I can help you with:
• 📅 **Events** - Find workshops, seminars, cultural events
• 🍽️ **Canteen** - Browse menu and order food
• 🎯 **Clubs** - Discover clubs and societies
• 📚 **Studies** - Get help with academic concepts

Just ask me anything! For example:
- "What events are happening this week?"
- "Show me the canteen menu"
- "Order 2 samosas and a cold coffee"
- "Tell me about tech clubs"`,
    });
  }
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'campus-gpt' });
});

// Speech-to-text endpoint (returns token for client-side Azure Speech SDK)
app.get('/api/speech-token', (req: Request, res: Response) => {
  if (!config.azureSpeech.key || !config.azureSpeech.region) {
    return res.status(400).json({
      error: 'Azure Speech not configured',
      message: 'Please set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION',
    });
  }

  res.json({
    token: config.azureSpeech.key,
    region: config.azureSpeech.region,
  });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`🚀 CampusGPT service running on http://localhost:${PORT}`);
  console.log(`📡 Chat endpoint: POST http://localhost:${PORT}/api/chat`);
  console.log(`🎤 Speech token: GET http://localhost:${PORT}/api/speech-token`);

  if (!openaiClient) {
    console.log('⚠️  Azure OpenAI not configured - running in demo mode with mock responses');
  } else {
    console.log('✅ Azure OpenAI connected');
  }
});

export default app;
