# Auth Module - Quick Reference Card

Quick reference for team members integrating with the auth system.

---

## 🔐 Authentication Check

### Client Component
```typescript
'use client';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function MyComponent() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <a href="/api/auth/login">Please login</a>;

  return <div>Hello {user.name}!</div>;
}
```

### Server Component / API Route
```typescript
import { requireAuth } from '@/lib/auth';

export default async function Page() {
  const session = await requireAuth(); // Throws if not logged in
  return <div>Hello {session.user.name}!</div>;
}
```

---

## 👤 Get User Data

### Get User from Database
```typescript
import { getUserByAuth0Id } from '@/lib/db';
import { getUserId } from '@/lib/auth';

const userId = await getUserId();
const user = await getUserByAuth0Id(userId!);

// Access user data
console.log(user.email);
console.log(user.personality_completed);
console.log(user.diary_entry_count);
```

### User Object Structure
```typescript
{
  id: string;                          // UUID
  auth0_id: string;                    // Auth0 user ID
  email: string;
  name?: string;
  picture?: string;
  backboard_assistant_id?: string;     // Set by AI module
  personality_completed?: boolean;     // Set by frontend
  diary_entry_count?: number;          // Incremented by AI module
  elevenlabs_voice_id?: string;        // Set by voice module
  voice_sample_uploaded?: boolean;     // Set by voice module
  wallet_address?: string;             // Set by solana module
  solana_tx_hash?: string;             // Set by solana module
  blockchain_committed_at?: string;    // Set by solana module
  created_at: string;
  updated_at: string;
  last_login_at: string;
}
```

---

## ✏️ Update User Data

### Update Backboard Assistant (AI Module)
```typescript
import { updateBackboardAssistant } from '@/lib/db';
import { getUserId } from '@/lib/auth';

const userId = await getUserId();
await updateBackboardAssistant(userId!, 'assistant-id-from-backboard');
```

### Update Voice ID (Voice Module)
```typescript
import { updateVoiceId } from '@/lib/db';
import { getUserId } from '@/lib/auth';

const userId = await getUserId();
await updateVoiceId(userId!, 'voice-id-from-elevenlabs');
```

### Update Blockchain Commitment (Solana Module)
```typescript
import { updateBlockchainCommitment } from '@/lib/db';
import { getUserId } from '@/lib/auth';

const userId = await getUserId();
await updateBlockchainCommitment(
  userId!,
  'wallet-address',
  'transaction-hash'
);
```

### Increment Diary Count (AI Module)
```typescript
import { incrementDiaryCount } from '@/lib/db';
import { getUserId } from '@/lib/auth';

const userId = await getUserId();
await incrementDiaryCount(userId!);
```

### Mark Personality Complete (Frontend)
```typescript
import { markPersonalityCompleted } from '@/lib/db';
import { getUserId } from '@/lib/auth';

const userId = await getUserId();
await markPersonalityCompleted(userId!);
```

### Generic Update
```typescript
import { updateUser } from '@/lib/db';
import { getUserId } from '@/lib/auth';

const userId = await getUserId();
await updateUser(userId!, {
  name: 'New Name',
  // ... any user fields
});
```

---

## 🔗 Login/Logout Links

### Login
```typescript
<a href="/api/auth/login">Login</a>
```

### Logout
```typescript
<a href="/api/auth/logout">Logout</a>
```

### Conditional Display
```typescript
'use client';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function NavBar() {
  const { user } = useUser();

  return (
    <nav>
      {user ? (
        <>
          <span>Hello {user.name}</span>
          <a href="/api/auth/logout">Logout</a>
        </>
      ) : (
        <a href="/api/auth/login">Login</a>
      )}
    </nav>
  );
}
```

---

## 🛡️ Protected API Routes

### Basic Protection
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // This throws if user is not logged in
    const session = await requireAuth();

    // Your logic here
    return NextResponse.json({ success: true });

  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Please log in' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
```

---

## 🧪 Testing

### Check if User Exists in Database
```typescript
import { getUserByAuth0Id } from '@/lib/db';

const user = await getUserByAuth0Id('auth0|123456');
console.log(user); // null if not found
```

### Verify Environment Variables
```typescript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Auth0 Domain:', process.env.AUTH0_ISSUER_BASE_URL);
// Don't log secrets in production!
```

---

## ⚠️ Common Errors

### "Unauthorized - Please log in"
→ User is not logged in. Redirect to `/api/auth/login`

### "User not found in database"
→ User logged in but not in Supabase. Call `/api/user/create` or check callback handler

### "Invalid token"
→ Auth0 session expired. Have user log in again

### "CORS error"
→ Check `AUTH0_BASE_URL` matches your current domain

---

## 📋 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | GET | Login redirect |
| `/api/auth/logout` | GET | Logout redirect |
| `/api/auth/callback` | GET | OAuth callback |
| `/api/auth/me` | GET | Current session |
| `/api/user/create` | POST | Create user in DB |
| `/api/user/profile` | GET | Get user profile |

---

## 🎯 Module Integration Checklist

### AI Module Developer
- [ ] Call `updateBackboardAssistant()` when assistant is created
- [ ] Call `incrementDiaryCount()` when diary entry is saved
- [ ] Call `markPersonalityCompleted()` when quiz is done

### Voice Module Developer
- [ ] Call `updateVoiceId()` when voice is cloned

### Solana Module Developer
- [ ] Call `updateBlockchainCommitment()` when transaction is confirmed

### Frontend Developer
- [ ] Use `useUser()` hook for client components
- [ ] Add login/logout links in navbar
- [ ] Protect routes that require auth
- [ ] Show loading states while checking auth

---

## 💡 Pro Tips

1. **Always check `isLoading`** before checking `user` in client components
2. **Use `requireAuth()`** in API routes - it's cleaner than manual checks
3. **Update user fields** as features are completed (tracks progress)
4. **Don't expose** `SUPABASE_SERVICE_KEY` to client - only use in API routes
5. **Test logout flow** - make sure users can log out and back in

---

## 🚀 Ready to Build!

You now have:
- ✅ Auth0 login/logout working
- ✅ User creation in Supabase on first login
- ✅ Helper functions for all modules
- ✅ Protected API routes
- ✅ Client-side auth hooks

**Next Steps**: Build your module and integrate using these functions!

---

**Questions?** Check `SETUP_GUIDE.md` or `README.md` for detailed info.
