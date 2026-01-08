# CampusGPT - AI Campus Assistant 🎓

**Hackathon Project for Microsoft Imagine**

An AI-powered campus assistant using Generative UI, built with:

- **Azure OpenAI (GPT-4o)** - Chat with function calling for dynamic UI
- **Azure AI Speech** - Voice input for hands-free interaction

## Features

- 📅 **Events** - Discover and register for campus events
- 🍽️ **Canteen** - Browse menu and order food via chat
- 🎯 **Clubs** - Find and join campus clubs
- 📚 **Studies** - Get help with academic concepts
- 🎤 **Voice Input** - Ask questions using speech

## Quick Start

1. **Set up environment variables:**

   ```bash
   # In .env
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
   AZURE_OPENAI_API_KEY=your-key
   AZURE_OPENAI_DEPLOYMENT=gpt-4o
   AZURE_SPEECH_KEY=your-speech-key
   AZURE_SPEECH_REGION=eastus
   ```

2. **Install dependencies:**

   ```bash
   cd services/campus-gpt
   pnpm install
   ```

3. **Run the service:**

   ```bash
   pnpm dev
   ```

4. **Access the chat:**
   - Navigate to `http://localhost:3000/campus-gpt`

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────┐
│   Next.js Web   │────▶│  CampusGPT API   │────▶│ Azure OpenAI   │
│  (Chat UI + UI  │     │  (Express + SSE) │     │ (Function Call)│
│   Components)   │     └────────┬─────────┘     └────────────────┘
└─────────────────┘              │
                                 ▼
                    ┌────────────────────────┐
                    │   Tool Handlers        │
                    │  - getEvents()         │
                    │  - getMenuItems()      │
                    │  - createOrder()       │
                    │  - getClubs()          │
                    └────────────────────────┘
```

## Microsoft AI Services Used

1. **Azure OpenAI**
   - Model: GPT-4o
   - Features: Function calling for dynamic UI generation
   - Purpose: Natural language understanding, tool execution

2. **Azure AI Speech**
   - Feature: Speech-to-Text
   - Purpose: Voice input for accessibility

## Demo Mode

If Azure credentials are not configured, the service runs in demo mode with mock responses - perfect for presentations!
