# Echo AI - Digital Twin System

An AI-powered digital twin that learns personality through diary entries and personality quiz results, powered by Backboard.io and Google Gemini 2.0 Flash.

## 🏗️ Architecture

```
Frontend (Next.js) → Echo Service → Backboard.io → Gemini 2.0 Flash → ElevenLabs
```

**Key Components:**
- **Personality Quiz**: Defines the base personality traits
- **Diary Entries**: Stored in Backboard's RAG memory system
- **Backboard.io**: Persistent AI memory layer with vector search
- **Gemini 2.0 Flash**: LLM for generating responses
- **Echo Service**: Main orchestration layer

## 📦 Installation

```bash
# Install dependencies
npm install

# Or with pnpm
pnpm install
```

## 🔑 Setup

1. Get your Backboard.io API key from https://app.backboard.io
2. Add it to `.env.local`:

```env
BACKBOARD_API_KEY=espr_your_api_key_here
```

## 🚀 Usage

### Test the System

```bash
npm run ai:test
```

### Using in Your Code

```typescript
import { EchoService } from "./AI/echo-service";
import * as fs from "fs/promises";

// Initialize
const echo = new EchoService({
  apiKey: process.env.BACKBOARD_API_KEY!,
});

// Load personality
const personalityText = await fs.readFile("personality-quiz.txt", "utf-8");
await echo.initialize(personalityText);

// Upload diary entries
await echo.uploadDiaryEntriesFromFile("diary-entries.txt");

// Ask questions
const response = await echo.ask("What do you like to do on weekends?");
console.log(response);
```

### Resuming an Existing Session

```typescript
// Instead of initialize(), load existing assistant/thread
await echo.loadExisting(assistantId, threadId);

// Continue asking questions
await echo.ask("Tell me more about your hobbies");
```

## 📁 File Structure

```
AI/
├── backboard-client.ts    # Low-level Backboard API client
├── echo-service.ts        # Main Echo service (personality + diary)
├── types.ts               # TypeScript type definitions
├── index.ts               # Public API exports
├── test.ts                # Test script
├── examples/
│   ├── personality-quiz.txt
│   └── diary-entries.txt
└── README.md
```

## 🔄 How It Works

1. **Initialization**
   - Load personality quiz results
   - Create a Backboard assistant with Gemini 2.0 Flash
   - Inject personality as system prompt

2. **Memory Building**
   - Upload diary entries to Backboard
   - Each entry is stored with metadata
   - Backboard builds vector embeddings for RAG

3. **Query Processing**
   - User asks a question
   - Backboard retrieves relevant diary entries (RAG)
   - Gemini generates response using personality + context
   - Response reflects the person's style and experiences

## 🎯 Key Features

- ✅ **Persistent Memory**: Diary entries stored permanently in Backboard
- ✅ **RAG-powered**: Automatically retrieves relevant context
- ✅ **Personality-driven**: System prompt shapes response style
- ✅ **Resumable Sessions**: Save assistant/thread IDs to continue later
- ✅ **TypeScript**: Full type safety

## 🛠️ API Reference

### EchoService

```typescript
class EchoService {
  // Initialize with personality quiz
  async initialize(personalityText: string): Promise<void>

  // Upload diary entries (array)
  async uploadDiaryEntries(entries: string[]): Promise<void>

  // Upload diary entries from file
  async uploadDiaryEntriesFromFile(filePath: string): Promise<void>

  // Ask a question
  async ask(question: string): Promise<string>

  // Get IDs for persistence
  getIds(): { assistantId: string | null; threadId: string | null }

  // Load existing session
  async loadExisting(assistantId: string, threadId: string): Promise<void>
}
```

## 🔮 Next Steps

- [ ] Integrate with Next.js frontend
- [ ] Add ElevenLabs voice synthesis
- [ ] Implement Auth0 authentication
- [ ] Store assistant/thread IDs in Supabase
- [ ] Add streaming responses for better UX
- [ ] Create personality quiz UI

## 📝 Notes

- **Rate Limiting**: Small delays between diary entry uploads (100ms)
- **Memory**: All diary entries persist in Backboard (Option B ✅)
- **Costs**: Backboard API calls + Gemini usage (monitor usage on dashboard)
- **Privacy**: API keys should never be committed to git

## 🐛 Troubleshooting

**Error: "BACKBOARD_API_KEY not found"**
- Make sure `.env.local` exists and has your API key

**API Error 401 (Unauthorized)**
- Check that your Backboard API key is valid
- Try regenerating the key in the dashboard

**TypeScript errors**
- Run `npm install` to ensure all dependencies are installed
- Check that `tsconfig.json` exists

## 📚 Resources

- [Backboard.io Dashboard](https://app.backboard.io)
- [Backboard.io Documentation](https://backboard.io/docs)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
