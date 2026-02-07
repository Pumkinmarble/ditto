# Echo AI - Database Integration Guide

This guide explains how to use the Echo AI system with data from your Supabase database.

## 🎯 Overview

The system now supports two ways to initialize Echo:

1. **From Text Files** (original) - `EchoService`
2. **From Database** (new) - `EchoFromDB`

The database integration automatically fetches personality quiz results and diary entries from Supabase and formats them for Backboard.io's RAG system.

## 🔧 Setup

### Environment Variables

Make sure you have these in your `.env.local`:

```env
# Backboard.io
BACKBOARD_API_KEY=espr_your_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your_service_role_key_here
```

## 📊 Database Requirements

Your Supabase database should have:

1. **users table** with:
   - `id` (UUID)
   - `personality_type` (TEXT)
   - `personality_data` (JSONB) - contains personality quiz results
   - `name` (TEXT)
   - `email` (TEXT)

2. **diary_entries table** with:
   - `id` (UUID)
   - `user_id` (UUID, references users.id)
   - `content` (TEXT)
   - `entry_date` (DATE)

## 🚀 Usage

### Option 1: Using the API Endpoints

**Export Personality:**
```typescript
// GET /api/export/personality?userId={userId}
const response = await fetch(`/api/export/personality?userId=${userId}`);
const data = await response.json();
console.log(data.personalityText); // Formatted personality text
```

**Export Diary Entries:**
```typescript
// GET /api/export/diary?userId={userId}
const response = await fetch(`/api/export/diary?userId=${userId}`);
const data = await response.json();
console.log(data.diaryText); // Formatted diary entries text
```

### Option 2: Using EchoFromDB Class (Recommended)

```typescript
import { EchoFromDB } from './AI/echo-from-db';

// Initialize
const echoFromDB = new EchoFromDB({
  backboardApiKey: process.env.BACKBOARD_API_KEY!,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseServiceKey: process.env.SUPABASE_SECRET_KEY!,
  userId: 'user-uuid-here',
  outputDir: './AI/output', // Optional: save files locally
});

// Initialize Echo with database data
const { assistantId, threadId } = await echoFromDB.initialize();

// Ask questions
const response = await echoFromDB.ask('Tell me about yourself');
console.log(response);
```

### Option 3: Save to Files First (for debugging)

```typescript
// Save personality and diary data to text files
const { personalityPath, diaryPath } = await echoFromDB.saveToFiles();

// Files are saved to AI/output/ directory
console.log(`Personality: ${personalityPath}`);
console.log(`Diary: ${diaryPath}`);
```

## 🧪 Testing

### Test with Database Data

1. Get a user ID from your Supabase users table
2. Update `AI/test-from-db.ts` with the user ID:
   ```typescript
   const userId = 'your-user-uuid-here';
   ```
3. Run the test:
   ```bash
   npm run ai:test-db
   ```

This will:
- Fetch personality and diary data from database
- Save formatted files to `AI/output/`
- Initialize Echo service
- Ask test questions
- Display responses

## 📝 Data Format

### Personality Text Format

```
PERSONALITY QUIZ RESULTS - User Name

Email: user@example.com
Personality Type: INTJ

PERSONALITY DIMENSIONS:
- Extraversion (45%) - Introverted
- Thinking (78%) - Logical decision-making
...

CORE TRAITS:
- Analytical and strategic
- Independent thinker
...
```

### Diary Entries Format

```
February 3, 2026
Today was amazing! I learned so much about...

February 5, 2026
Spent time reflecting on my goals...
```

(Entries are separated by double newlines)

## 🔄 How It Works

1. **Fetch from Database**
   - `EchoFromDB` queries Supabase for user's personality and diary entries
   - Data is formatted into text that matches the expected format

2. **Initialize Backboard Assistant**
   - Personality text becomes the system prompt
   - Defines the AI's personality traits and communication style

3. **Upload to RAG Memory**
   - Diary entries are uploaded to Backboard's vector database
   - Each entry is searchable via semantic similarity

4. **Query with Context**
   - When you ask a question, Backboard retrieves relevant diary entries
   - Gemini generates a response using personality + diary context

## 🎨 Customization

### Custom Personality Format

Modify `fetchPersonalityText()` in `echo-from-db.ts` to change how personality data is formatted:

```typescript
async fetchPersonalityText(): Promise<string> {
  // Custom formatting logic here
  return yourFormattedText;
}
```

### Custom Diary Format

Modify `fetchDiaryEntriesText()` to change diary entry formatting:

```typescript
async fetchDiaryEntriesText(): Promise<string[]> {
  // Custom formatting logic here
  return formattedEntries;
}
```

## 📊 Example Output Files

The system saves formatted files to `AI/output/`:
- `personality-{userId}.txt` - Formatted personality profile
- `diary-{userId}.txt` - All diary entries formatted for RAG

These files can be inspected to verify the data format before sending to Backboard.

## 🔒 Security Notes

- Never expose `SUPABASE_SECRET_KEY` to the client
- API endpoints should validate user permissions
- Consider adding Row Level Security (RLS) policies
- The `EchoFromDB` class should only be used server-side

## ❓ Troubleshooting

**Error: "User not found or no personality data"**
- Verify the user exists in Supabase
- Check that personality_data is not null
- Ensure personality quiz has been completed

**Error: "No diary entries found"**
- User may not have written any diary entries yet
- Check that user_id matches correctly

**Backboard API errors**
- Verify your BACKBOARD_API_KEY is valid
- Check Backboard dashboard for usage limits
