# Auth Module Setup Guide

Complete step-by-step guide to set up authentication for Echo AI Digital Twin.

## Prerequisites

- Node.js 18+ installed
- Next.js 15 project initialized
- Code editor (VS Code recommended)

---

## Step 1: Install Dependencies

```bash
cd cxc2026
npm install @auth0/nextjs-auth0 @supabase/supabase-js
```

---

## Step 2: Set Up Auth0

### 2.1 Create Auth0 Account

1. Go to [auth0.com](https://auth0.com)
2. Click **Sign Up** (free tier is fine)
3. Complete registration

### 2.2 Create Application

1. In Auth0 dashboard, click **Applications** → **Applications**
2. Click **Create Application**
3. Name it "Echo AI Digital Twin"
4. Choose **Regular Web Applications**
5. Click **Create**

### 2.3 Configure Application

1. Go to **Settings** tab
2. Note down these values (you'll need them soon):
   - **Domain** (e.g., `dev-abc123.us.auth0.com`)
   - **Client ID**
   - **Client Secret**

3. Scroll down to **Application URIs**:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`

4. Click **Save Changes** at the bottom

### 2.4 Enable Google Login (Optional)

1. Go to **Authentication** → **Social**
2. Click on **Google**
3. Toggle to enable
4. Use Auth0 Dev Keys (or add your own)
5. Click **Save**

---

## Step 3: Set Up Supabase

### 3.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project**
3. Sign up/log in with GitHub
4. Click **New Project**
5. Choose organization (or create one)
6. Fill in:
   - **Name**: echo-ai-digital-twin
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free
7. Click **Create new project** (takes ~2 minutes)

### 3.2 Get API Credentials

1. Once project is ready, click **Settings** (gear icon)
2. Go to **API** section
3. Note down:
   - **Project URL** (under Project URL)
   - **anon public** key (under Project API keys)
   - **service_role** key (under Project API keys) - **Keep this secret!**

### 3.3 Create Database Schema

1. In Supabase dashboard, click **SQL Editor**
2. Click **New Query**
3. Copy the contents of `auth_module/schema.sql`
4. Paste into the editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

---

## Step 4: Configure Environment Variables

### 4.1 Create .env.local

In your project root (`cxc2026/`), create a file named `.env.local`:

```bash
# Auth0 Configuration
AUTH0_SECRET='your-secret-here'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR-DOMAIN.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL='https://your-project.supabase.co'
NEXT_PUBLIC_SUPABASE_ANON_KEY='your-anon-key'
SUPABASE_SERVICE_KEY='your-service-role-key'
```

### 4.2 Generate AUTH0_SECRET

**On Mac/Linux:**
```bash
openssl rand -hex 32
```

**On Windows (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Or use any random 64-character hex string**

### 4.3 Fill in Your Values

Replace these placeholders with your actual values:
- `YOUR-DOMAIN` → Your Auth0 domain (from Step 2.3)
- `your-client-id` → Auth0 Client ID (from Step 2.3)
- `your-client-secret` → Auth0 Client Secret (from Step 2.3)
- `your-project` → Your Supabase project ID (from Step 3.2)
- `your-anon-key` → Supabase anon key (from Step 3.2)
- `your-service-role-key` → Supabase service_role key (from Step 3.2)

---

## Step 5: Integrate into Next.js App

### 5.1 Copy Files to Main App

If your Next.js app is in a different folder, copy these files:

**Copy lib files:**
```
auth_module/lib/auth.ts → your-app/lib/auth.ts
auth_module/lib/db.ts → your-app/lib/db.ts
```

**Copy API routes:**
```
auth_module/app/api/auth/[...auth0]/route.ts → your-app/app/api/auth/[...auth0]/route.ts
auth_module/app/api/user/create/route.ts → your-app/app/api/user/create/route.ts
auth_module/app/api/user/profile/route.ts → your-app/app/api/user/profile/route.ts
```

### 5.2 Update Import Paths

If you copy the files, update the import paths in the API routes:
- Change `../../../../lib/auth` to match your folder structure
- Change `../../../../lib/db` to match your folder structure

### 5.3 Wrap App with Auth Provider

Create or update `app/layout.tsx`:

```typescript
import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
```

---

## Step 6: Test Authentication

### 6.1 Start Development Server

```bash
npm run dev
```

### 6.2 Create Test Page

Create `app/test-auth/page.tsx`:

```typescript
'use client';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function TestAuth() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div>
        <h1>Not logged in</h1>
        <a href="/api/auth/login">Login</a>
      </div>
    );
  }

  return (
    <div>
      <h1>Logged in as {user.name}</h1>
      <img src={user.picture} alt={user.name} />
      <p>Email: {user.email}</p>
      <a href="/api/auth/logout">Logout</a>
    </div>
  );
}
```

### 6.3 Test Login Flow

1. Go to `http://localhost:3000/test-auth`
2. Click "Login"
3. You should be redirected to Auth0
4. Log in with Google or email
5. You should be redirected back and see your profile
6. Check Supabase **Table Editor** → **users** table
7. You should see your user created!

---

## Step 7: Verify Database

1. Go to Supabase dashboard
2. Click **Table Editor**
3. Select **users** table
4. You should see your user with:
   - Email
   - Auth0 ID
   - Created timestamp

---

## Troubleshooting

### Error: "Callback URL mismatch"
- Check Auth0 **Allowed Callback URLs** includes `http://localhost:3000/api/auth/callback`
- Make sure there are no typos or extra spaces

### Error: "Invalid state"
- Clear browser cookies and try again
- Make sure `AUTH0_SECRET` is set and at least 32 characters

### Error: "Database connection failed"
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_KEY` is the **service_role** key, not anon key
- Make sure you ran the SQL schema in Supabase

### Users not appearing in Supabase
- Check browser console for errors
- Check Next.js terminal for API errors
- Verify the callback handler is running (add console.logs)

---

## Next Steps

Once authentication is working:

1. **Create AI Module** - Integrate Backboard for personality/memory
2. **Create Voice Module** - Integrate ElevenLabs for voice cloning
3. **Build Frontend** - Create personality quiz, diary, chat UI
4. **Optional: Solana Module** - Add blockchain commitment

---

## Helper Functions Reference

### Server-side (API routes, Server Components)

```typescript
import { requireAuth, getUserId, getUserEmail } from '@/lib/auth';
import { getUserByAuth0Id, updateUser } from '@/lib/db';

// Require auth
const session = await requireAuth();

// Get user ID
const userId = await getUserId();

// Get user from database
const user = await getUserByAuth0Id(session.user.sub);

// Update user
await updateUser(session.user.sub, {
  personality_completed: true
});
```

### Client-side (React components)

```typescript
'use client';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Component() {
  const { user, isLoading, error } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <a href="/api/auth/login">Login</a>;

  return <div>Hello {user.name}</div>;
}
```

---

## Security Notes

- ✅ Never commit `.env.local` to git (add to `.gitignore`)
- ✅ Keep `SUPABASE_SERVICE_KEY` secret (server-side only)
- ✅ Keep `AUTH0_CLIENT_SECRET` secret (server-side only)
- ✅ Use `NEXT_PUBLIC_*` prefix only for safe client-side variables
- ✅ Enable Row Level Security (RLS) in Supabase for production

---

## Production Deployment

When deploying to production (Vercel, etc.):

1. Add environment variables to hosting platform
2. Update `AUTH0_BASE_URL` to production URL
3. Add production URL to Auth0 **Allowed Callback URLs**
4. Use a strong, unique `AUTH0_SECRET` for production
5. Consider enabling 2FA in Auth0 for admin accounts

---

## Support

- **Auth0 Docs**: https://auth0.com/docs/quickstart/webapp/nextjs
- **Supabase Docs**: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- **Next.js Docs**: https://nextjs.org/docs

---

**🎉 You're all set! Authentication is now working.**
