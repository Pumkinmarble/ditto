/**
 * Supabase Client for Web App
 * Provides both client-side and server-side Supabase clients
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Client-side Supabase client (browser-safe)
 * Use this in React components
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side Supabase client (admin access)
 * Use this in API routes only
 * WARNING: Never expose this to the client!
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Database types
 */
export interface User {
  id: string;
  auth0_id: string;
  email: string;
  name: string | null;
  picture: string | null;
  backboard_assistant_id: string | null;
  personality_completed: boolean;
  personality_type?: string | null;
  personality_data?: any | null;
  diary_entry_count: number;
  elevenlabs_voice_id: string | null;
  voice_sample_uploaded: boolean;
  wallet_address: string | null;
  solana_tx_hash: string | null;
  blockchain_committed_at: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

export interface DiaryEntry {
  id: string;
  user_id: string;
  content: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
}
