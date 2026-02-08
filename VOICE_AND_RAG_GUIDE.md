# Voice Cloning + Transcription + RAG Isolation Guide

## Overview

This guide explains how voice cloning, transcription, and RAG (Retrieval Augmented Generation) work together with proper data isolation.

---

## 🎤 Voice Upload Workflow

### Step-by-Step Process:

1. **User uploads MP3 file** → UI sends to `/api/voice/upload-diary`
2. **Transcription** → ElevenLabs Scribe v2 API converts speech to text
3. **Voice Cloning** (optional) → ElevenLabs clones the voice
4. **Save to Database** → Transcription saved to `diary_entries` table
5. **Update User** → `voice_id` saved to `users` table

### API Endpoint

```typescript
POST /api/voice/upload-diary

FormData:
  - audio: File (MP3/WAV/WEBM)
  - userId: string (user UUID)
  - voiceName: string (optional, default: "Echo Voice")
  - cloneVoice: boolean (optional, default: false)

Response:
{
  success: true,
  transcription: "The transcribed text from the audio...",
  voiceId: "elevenlabs-voice-id",
  diaryEntryId: "uuid",
  message: "Audio transcribed and saved to diary successfully!"
}
```

### Frontend Example

```typescript
const formData = new FormData();
formData.append('audio', audioBlob, 'voice-diary.mp3');
formData.append('userId', currentUser.id);
formData.append('voiceName', 'My Echo Voice');
formData.append('cloneVoice', 'true');

const response = await fetch('/api/voice/upload-diary', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log('Transcription:', result.transcription);
```

---

## 🔒 RAG Isolation (How Data Privacy Works)

### The Problem
Multiple users shouldn't see each other's diary entries when chatting with their digital twin.

### The Solution
Each user gets their own **isolated Backboard assistant and thread**.

### Database Structure

```sql
users table:
  - id (UUID)
  - assistant_id (TEXT) -- Backboard assistant ID (unique per user)
  - thread_id (TEXT)    -- Backboard thread ID (unique per user)
  - voice_id (TEXT)     -- ElevenLabs voice ID (unique per user)

diary_entries table:
  - id (UUID)
  - user_id (UUID)      -- Foreign key to users.id
  - content (TEXT)      -- Diary entry text
```

### How Isolation Works

1. **User logs in** → Get `userId` from Auth0
2. **Check database** → Does this user have `assistant_id` and `thread_id`?
   - **YES** → Load existing Echo instance with their data
   - **NO** → Create new Echo instance, save IDs to database

3. **Load diary entries** → Only load entries where `user_id = current_user.id`
4. **Upload to Backboard** → Data goes into user's specific thread
5. **Ask questions** → AI only sees data in that user's thread

### Key Point: Threads Don't Share Data

```
User A:
  assistant_id: "abc123"
  thread_id: "thread_abc"
  → Sees ONLY their diary entries

User B:
  assistant_id: "xyz789"
  thread_id: "thread_xyz"
  → Sees ONLY their diary entries

These threads are completely isolated! ✅
```

---

## 🚫 What About Logout?

### Question: Do we need to delete RAG data on logout?

**Answer: NO!** Here's why:

- Threads are **persistent** and **isolated** by design
- When user logs out, we simply **don't load their thread**
- When they log back in, we **reload their thread** with all their data intact
- This is actually BETTER for UX - their data persists across sessions

### What Actually Happens

```typescript
// On Login
const userEcho = await initializeEchoForUser({
  userId: user.id,
  backboardApiKey: process.env.BACKBOARD_API_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
});
// Loads their assistant_id and thread_id from database
// Only their data is accessible

// On Logout
// Simply stop using the Echo instance
// No need to delete anything!

// On Re-login
// Load the same assistant_id and thread_id
// All their previous data is still there ✅
```

---

## 📋 Migration & Setup

### 1. Run the database migration

```bash
# Run this SQL in your Supabase SQL editor
psql -h your-supabase-host -U postgres -d postgres -f auth_module/migration-add-ai-fields.sql
```

This adds:
- `assistant_id` - Backboard assistant ID
- `thread_id` - Backboard thread ID
- `voice_id` - ElevenLabs voice ID
- `voice_name` - Voice clone name

### 2. Verify ElevenLabs API Key

Your ElevenLabs API key is already configured in `.env.local`:
```bash
ELEVENLABS_API_KEY='sk_3776c3a8f239c932a3e6333199529827cc258eb2686c4017'
```

This key handles **both** voice cloning AND transcription (Scribe v2).

### 3. Test the workflow

```bash
# Test voice upload + transcription
npm run dev

# Then use your UI to upload an MP3
# Or test with curl:
curl -X POST http://localhost:3000/api/voice/upload-diary \
  -F "audio=@test.mp3" \
  -F "userId=your-user-uuid" \
  -F "cloneVoice=true"
```

---

## 🔐 Security Best Practices

1. **Validate userId** - Always verify the user making the request owns the userId
2. **Use Auth0** - Ensure requests are authenticated
3. **Row Level Security (RLS)** - Enable RLS on Supabase tables
4. **Rate Limiting** - Add rate limits to prevent abuse
5. **File Size Limits** - Limit audio uploads to reasonable sizes (e.g., 10MB)

---

## 🧪 Testing RAG Isolation

Use the verification function:

```typescript
import { verifyRAGIsolation } from './AI/echo-user-init';

const isolation = await verifyRAGIsolation({
  userId: 'user-uuid',
  backboardApiKey: process.env.BACKBOARD_API_KEY!,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseServiceKey: process.env.SUPABASE_SECRET_KEY!,
});

console.log('User:', isolation.userId);
console.log('Assistant ID:', isolation.assistantId);
console.log('Thread ID:', isolation.threadId);
console.log('Diary Entries:', isolation.diaryEntryCount);
```

---

## 📚 Key Files

- **Migration**: `auth_module/migration-add-ai-fields.sql`
- **Voice Upload API**: `app/api/voice/upload-diary/route.ts`
- **Echo User Init**: `AI/echo-user-init.ts`
- **Echo DB Integration**: `AI/echo-from-db.ts`

---

## ❓ FAQ

**Q: Can users see each other's diary entries?**
A: No. Each user has their own thread_id, which completely isolates their data.

**Q: What if I delete a user?**
A: Use `ON DELETE CASCADE` on the foreign key to automatically delete their diary entries.

**Q: Can I use a different transcription service?**
A: Yes! We use ElevenLabs Scribe v2, but you can replace it with OpenAI Whisper, Google, AssemblyAI, etc.

**Q: How much does ElevenLabs transcription cost?**
A: Pricing varies by tier. Check https://elevenlabs.io/pricing for current rates.

**Q: Should I delete RAG data on logout?**
A: No! Keep it persistent so users can resume their conversations later.

---

## 🎯 Summary

✅ **Voice Upload** → Transcribe with Whisper → Save to diary
✅ **Voice Cloning** → ElevenLabs → Save voice_id
✅ **RAG Isolation** → Each user gets their own thread → Data never mixes
✅ **Logout** → No deletion needed → Data persists for next login

**You're all set!** 🚀
