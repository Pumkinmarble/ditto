# Auth Module - Echo AI Digital Twin

Authentication and database setup for the Echo project using Auth0 and Supabase.

## Setup Steps

### 1. Auth0 Setup
1. Go to [auth0.com](https://auth0.com) and create an account
2. Create a new application → **Regular Web Application**
3. Go to Settings and note down:
   - Domain (e.g., `dev-xxxxx.us.auth0.com`)
   - Client ID
   - Client Secret
4. Configure URLs in Auth0 Settings:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
5. Enable **Google Social Connection** (optional but recommended):
   - Go to Authentication → Social
   - Enable Google
   - Use Auth0 dev keys or add your own

### 2. Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a project
2. Get credentials from Project Settings → API:
   - Project URL
   - `anon/public` key
   - `service_role` key (keep secret!)
3. Run the database schema (see `schema.sql` in this folder)

### 3. Environment Variables
Copy `.env.example` to `.env.local` and fill in your credentials.

## File Structure

```
auth_module/
├── lib/
│   ├── auth.ts       # Auth0 helper functions
│   └── db.ts         # Supabase client
├── app/
│   └── api/
│       ├── auth/
│       │   └── [...auth0]/
│       │       └── route.ts    # Auth0 routes (login, logout, callback)
│       └── user/
│           └── create/
│               └── route.ts    # Create user on first login
└── middleware.ts     # Protect routes (optional)
```

## Dependencies

```bash
npm install @auth0/nextjs-auth0 @supabase/supabase-js
```

## Usage

### In Server Components
```typescript
import { getSession } from '@auth0/nextjs-auth0';

export default async function Page() {
  const session = await getSession();
  const user = session?.user;
  // ...
}
```

### In Client Components
```typescript
'use client';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Component() {
  const { user, isLoading } = useUser();
  // ...
}
```

### Login/Logout
```typescript
// Login
<a href="/api/auth/login">Login</a>

// Logout
<a href="/api/auth/logout">Logout</a>
```

## Integration with Other Modules

This module provides user authentication that other modules can use:
- **AI Module**: Links user to Backboard assistant
- **Voice Module**: Links user to ElevenLabs voice ID
- **Solana Module**: Links user to wallet address
