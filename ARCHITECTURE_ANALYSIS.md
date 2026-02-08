# Architecture Analysis - Current State

## 📊 Current System Overview

### Authentication Flow
```
User → Auth0 Login → /api/auth/callback → Home Page
                                          ↓
                                   useUser() hook
                                          ↓
                            {user.sub, user.email, user.name}
```

**Auth0 Integration:**
- ✅ Fully integrated with `@auth0/nextjs-auth0`
- ✅ UserProvider wraps entire app ([app/layout.tsx](app/layout.tsx))
- ✅ `useUser()` hook available in client components
- ✅ `requireAuth()` helper for API routes ([lib/auth.ts](lib/auth.ts))

---

### Database Structure

**Supabase Tables:**

```sql
users
├── id (UUID) PRIMARY KEY
├── auth0_id (TEXT) UNIQUE ← Links to Auth0
├── email, name, picture
├── assistant_id (TEXT) ← NEW (from migration)
├── thread_id (TEXT) ← NEW (from migration)
├── voice_id (TEXT) ← NEW (from migration)
├── voice_name (TEXT) ← NEW (from migration)
├── backboard_assistant_id (TEXT) ← OLD, needs cleanup
├── elevenlabs_voice_id (TEXT) ← OLD, needs cleanup
└── ... other fields

diary_entries
├── id (UUID) PRIMARY KEY
├── user_id (UUID) → users.id
├── content (TEXT)
└── entry_date (DATE)
```

---

## ⚠️ Issues Found

### 1. **Column Name Mismatch**

**Problem:** Database has both OLD and NEW column names

**OLD columns (lib/db.ts User interface):**
- `backboard_assistant_id`
- `elevenlabs_voice_id`

**NEW columns (migration):**
- `assistant_id`
- `thread_id`
- `voice_id`
- `voice_name`

**Impact:**
- lib/db.ts User interface is outdated
- Functions like `updateBackboardAssistant()` and `updateVoiceId()` reference old columns
- Will cause SQL errors when used

**Solution:** Update lib/db.ts to use new column names

---

### 2. **Demo User System (Temporary)**

**Current Behavior:**
- PersonalityQuizPopup uses `getSessionId()` from localStorage
- Creates demo users: `demo-1770505071914@echo.ai`
- Uses `sessionId` as identifier instead of real Auth0 user

**Why This Exists:**
- Allows testing without Auth0 login
- Simpler for development

**Problem:**
- When Auth0 user logs in, their data goes to demo user, not their real user
- Data not linked to actual Auth0 identity

**Solution:**
- Update popups to use Auth0 user ID when logged in
- Keep demo mode as fallback for testing

---

### 3. **VoiceClonePopup Not Integrated**

**Current State:**
- VoiceClonePopup calls `/api/save-voice` (just saves MP3 to disk)
- Doesn't transcribe audio
- Doesn't save to diary_entries
- Doesn't use userId

**What We Built:**
- NEW endpoint: `/api/voice/upload-diary`
- Transcribes with ElevenLabs Scribe v2
- Clones voice
- Saves transcription to diary
- Requires userId parameter

**Gap:**
- UI doesn't know about new endpoint
- UI doesn't pass userId
- Not connected to Auth0 user

---

## 🏗️ Current Architecture

### Home Page Structure

```typescript
HomePage (app/home/page.tsx)
├── useUser() ← Auth0 session
├── DittoCharacter ← 3D character
├── PersonalityQuizPopup
│   └── → /api/personality/save (uses demo sessionId)
├── DiaryPopup
│   └── → /api/save-diary (uses demo sessionId)
└── VoiceClonePopup
    └── → /api/save-voice (just saves file)
```

### API Routes

**Current:**
- `/api/save-voice` - Old, just saves MP3 file
- `/api/save-diary` - Uses demo sessionId
- `/api/personality/save` - Uses demo sessionId

**New (Created by me):**
- `/api/voice/upload-diary` - Transcription + diary save (needs userId)

---

## 🔍 Data Flow Analysis

### Scenario 1: User Not Logged In (Demo Mode)

```
User → Home Page (no auth)
         ↓
   sessionId from localStorage
         ↓
   Create demo user: demo-{sessionId}@echo.ai
         ↓
   All data saved to this demo user
```

**Works:** ✅ Good for testing
**Problem:** ❌ Data not persistent, not linked to real identity

### Scenario 2: User Logged In via Auth0

```
User → Auth0 Login
         ↓
   user.sub = "auth0|12345..."
         ↓
   Home Page with useUser()
         ↓
   BUT: Popups still use sessionId (demo mode)
         ↓
   Data goes to demo user, NOT Auth0 user!
```

**Problem:** ❌ Auth0 user's data saved to wrong user

---

## 📋 What Needs to be Done

### Priority 1: Fix Column Names

**File:** [lib/db.ts](lib/db.ts)

**Change:**
```typescript
// OLD
export interface User {
  backboard_assistant_id?: string;
  elevenlabs_voice_id?: string;
  ...
}

// NEW
export interface User {
  assistant_id?: string;
  thread_id?: string;
  voice_id?: string;
  voice_name?: string;
  ...
}
```

**Also update:**
- `updateBackboardAssistant()` → use `assistant_id`
- `updateVoiceId()` → use `voice_id` and `voice_name`

### Priority 2: Bridge Auth0 User to Supabase User

**Challenge:**
- Frontend has: `user.sub` (Auth0 ID)
- Backend needs: `user.id` (Supabase UUID)

**Solution:**
Create helper API route:

```typescript
// GET /api/user/current
// Returns current user's Supabase ID

export async function GET() {
  const session = await requireAuth();
  const user = await getUserByAuth0Id(session.user.sub);

  return NextResponse.json({
    id: user.id,        // Supabase UUID
    auth0_id: user.auth0_id,
    ...
  });
}
```

### Priority 3: Update VoiceClonePopup

**Changes needed:**
1. Add `userId` prop to VoiceClonePopup
2. Get userId from parent (Home page)
3. Change endpoint from `/api/save-voice` to `/api/voice/upload-diary`
4. Add `cloneVoice` and `voiceName` parameters

**Updated flow:**
```typescript
// In HomePage
const { user } = useUser();
const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  if (user) {
    fetch('/api/user/current').then(r => r.json()).then(data => {
      setUserId(data.id);
    });
  }
}, [user]);

// Pass to popup
<VoiceClonePopup userId={userId} ... />
```

### Priority 4: Update PersonalityQuizPopup & DiaryPopup (Optional)

**Current:** Uses demo sessionId
**Better:** Use Auth0 user when logged in, fallback to sessionId

---

## 🎯 Recommended Next Steps

### Step 1: Update lib/db.ts (5 min)
- Fix User interface to match new column names
- Update helper functions

### Step 2: Create /api/user/current (10 min)
- API route to get current user's Supabase ID
- Returns { id, auth0_id, email }

### Step 3: Update VoiceClonePopup (20 min)
- Accept userId prop
- Call new endpoint `/api/voice/upload-diary`
- Pass all required parameters

### Step 4: Update HomePage (10 min)
- Fetch userId on mount
- Pass to VoiceClonePopup

### Step 5: Test End-to-End (15 min)
- Login via Auth0
- Record voice
- Verify transcription in database
- Verify voice_id saved to user

---

## 📊 System After Fixes

```
User → Auth0 Login
         ↓
   user.sub = "auth0|12345..."
         ↓
   GET /api/user/current
         ↓
   userId = "uuid-abc-123"
         ↓
   VoiceClonePopup(userId)
         ↓
   POST /api/voice/upload-diary
         ↓
   1. Transcribe with ElevenLabs
   2. Clone voice
   3. Save to diary_entries (user_id = userId)
   4. Update users.voice_id
         ↓
   RAG uses user's thread_id
   (data isolated per user)
```

---

## ✅ What's Already Good

1. **Auth0 Integration** - Fully working
2. **Supabase Setup** - Database ready
3. **ElevenLabs API** - Key configured
4. **Voice Upload API** - Backend complete
5. **Database Migration** - Columns added
6. **RAG Isolation** - Thread-based (good design)

## ⚠️ What Needs Attention

1. **Column Names** - Mismatch between old/new
2. **User ID Bridge** - Auth0 → Supabase
3. **UI Integration** - VoiceClonePopup not connected
4. **Demo Mode** - Should only be fallback

---

## 🔗 Key Files Reference

**Database:**
- [lib/db.ts](lib/db.ts) - User management functions
- [lib/supabase.ts](lib/supabase.ts) - Supabase clients
- [auth_module/migration-add-ai-fields.sql](auth_module/migration-add-ai-fields.sql) - New columns

**Authentication:**
- [lib/auth.ts](lib/auth.ts) - Auth helpers
- [app/layout.tsx](app/layout.tsx) - UserProvider wrapper

**UI Components:**
- [app/home/page.tsx](app/home/page.tsx) - Main page
- [app/home/components/VoiceClonePopup.tsx](app/home/components/VoiceClonePopup.tsx) - Voice recording
- [app/home/components/PersonalityQuizPopup.tsx](app/home/components/PersonalityQuizPopup.tsx) - Personality quiz
- [app/home/components/DiaryPopup.tsx](app/home/components/DiaryPopup.tsx) - Diary entries

**API Routes:**
- [app/api/voice/upload-diary/route.ts](app/api/voice/upload-diary/route.ts) - NEW voice upload
- [app/api/save-voice/route.ts](app/api/save-voice/route.ts) - OLD (to be replaced)
- [app/api/user/profile/route.ts](app/api/user/profile/route.ts) - User profile
- [app/api/user/create/route.ts](app/api/user/create/route.ts) - User creation

**AI Integration:**
- [AI/echo-from-db.ts](AI/echo-from-db.ts) - Backboard integration
- [AI/echo-user-init.ts](AI/echo-user-init.ts) - User-specific Echo init

---

**Last Updated:** After reviewing recent git changes (Ditto, profile UI, sidebar)
**Status:** Ready for integration fixes
