# AI Chatbot

A full-stack AI chatbot built with React, Vite, Express, and Gemini. The app supports multiple assistant personas, markdown responses, syntax-highlighted code blocks, image attachments, and persistent chat threads in local storage.

## Features

- Multi-persona chat experience (general, coding, writing, language, ideation, coaching)
- Markdown-enabled AI responses with code rendering
- Image attachment support for multimodal prompts
- Multi-thread conversations with automatic local persistence
- Responsive UI for desktop and mobile
- Server-side Gemini integration through an Express API

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS
- Backend: Express, TypeScript, tsx
- AI SDK: @google/genai
- Build: Vite + esbuild

## Prerequisites

- Node.js 18+
- npm
- A valid Gemini API key

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env.local
```

3. Set your key in .env.local:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

4. Start the development server:

```bash
npm run dev
```

5. Open the app:

```text
http://localhost:3000
```

## Environment Variables

The server loads environment values from `.env.local` (with override enabled), then `.env`.

- `GEMINI_API_KEY` (recommended)
- `GOOGLE_API_KEY` (fallback)
- `GOOGLE_GENERATIVE_AI_API_KEY` (fallback)

If no key is provided, the chat endpoint returns a clear runtime error.

## Available Scripts

- `npm run dev` - Run the full-stack app in development mode (Express + Vite middleware)
- `npm run build` - Build frontend assets and bundle server into `dist/server.cjs`
- `npm run start` - Run the production server from `dist/server.cjs`
- `npm run lint` - Type-check with TypeScript (`tsc --noEmit`)
- `npm run clean` - Remove generated build artifacts

## API Endpoints

- `GET /api/health` - Server health check
- `POST /api/chat` - Gemini chat completion endpoint

Example request:

```json
{
   "contents": [
      {
         "role": "user",
         "parts": [{ "text": "Hello" }]
      }
   ],
   "systemInstruction": "You are a helpful assistant."
}
```

Example response:

```json
{
   "text": "Hello! How can I help you today?"
}
```

## Project Structure

```text
.
|-- server.ts               # Express server + Gemini API integration
|-- src/
|   |-- App.tsx             # Main application UI and chat flow
|   |-- personas.ts         # Persona catalog and system prompts
|   |-- components/
|   |   |-- MessageItem.tsx # Message rendering
|   |   |-- CodeBlock.tsx   # Code formatting/highlighting
|-- .env.example            # Environment template
|-- package.json            # Scripts and dependencies
```

## Troubleshooting

### GEMINI_API_KEY is missing

- Ensure `.env.local` exists in the project root
- Ensure `GEMINI_API_KEY` is set and non-empty
- Restart the dev server after editing env files

### Port 3000 already in use

- Stop the existing process using port 3000, then run `npm run dev` again

## Security Notes

- Do not commit `.env.local`
- Keep API keys in local env files or secure secret stores only

## License

Apache-2.0
