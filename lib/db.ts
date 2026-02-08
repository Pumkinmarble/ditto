/**
 * Supabase Database Client
 * Provides database utilities for the Echo AI Digital Twin project
 */

import { createClient } from '@supabase/supabase-js';

// Client for browser/client-side operations (using publishable key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// Admin client for server-side operations (using secret key)
// Has full access, bypasses RLS - use carefully!
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Database Types
 */
export interface User {
  id: string;
  auth0_id: string;
  email: string;
  name?: string;
  picture?: string;
  assistant_id?: string;  // Backboard.io assistant ID (RAG isolation)
  thread_id?: string;     // Backboard.io thread ID (RAG isolation)
  voice_id?: string;      // ElevenLabs cloned voice ID
  voice_name?: string;    // Name of the cloned voice
  personality_completed?: boolean;
  personality_type?: string;
  personality_data?: any;
  diary_entry_count?: number;
  voice_sample_uploaded?: boolean;
  wallet_address?: string;
  solana_tx_hash?: string;
  blockchain_committed_at?: string;
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

/**
 * Get user by Auth0 ID
 */
export async function getUserByAuth0Id(auth0Id: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('auth0_id', auth0Id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Create a new user
 */
export async function createUser(userData: {
  auth0_id: string;
  email: string;
  name?: string;
  picture?: string;
}): Promise<User> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert([userData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(auth0Id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('auth0_id', auth0Id);

  if (error) throw error;
}

/**
 * Update user data
 */
export async function updateUser(
  auth0Id: string,
  updates: Partial<User>
): Promise<User> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('auth0_id', auth0Id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get or create user (used after Auth0 login)
 */
export async function getOrCreateUser(auth0User: {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}): Promise<User> {
  // Try to get existing user
  let user = await getUserByAuth0Id(auth0User.sub);

  // Create if doesn't exist
  if (!user) {
    user = await createUser({
      auth0_id: auth0User.sub,
      email: auth0User.email,
      name: auth0User.name,
      picture: auth0User.picture,
    });
  } else {
    // Update last login
    await updateLastLogin(auth0User.sub);
  }

  return user;
}

/**
 * Update Backboard assistant and thread IDs
 */
export async function updateBackboardAssistant(
  auth0Id: string,
  assistantId: string,
  threadId?: string
): Promise<void> {
  const updates: Partial<User> = { assistant_id: assistantId };
  if (threadId) {
    updates.thread_id = threadId;
  }
  await updateUser(auth0Id, updates);
}

/**
 * Update ElevenLabs voice ID and name
 */
export async function updateVoiceId(
  auth0Id: string,
  voiceId: string,
  voiceName?: string
): Promise<void> {
  const updates: Partial<User> = {
    voice_id: voiceId,
    voice_sample_uploaded: true,
  };
  if (voiceName) {
    updates.voice_name = voiceName;
  }
  await updateUser(auth0Id, updates);
}

/**
 * Update Solana commitment
 */
export async function updateBlockchainCommitment(
  auth0Id: string,
  walletAddress: string,
  txHash: string
): Promise<void> {
  await updateUser(auth0Id, {
    wallet_address: walletAddress,
    solana_tx_hash: txHash,
    blockchain_committed_at: new Date().toISOString(),
  });
}

/**
 * Increment diary entry count
 */
export async function incrementDiaryCount(auth0Id: string): Promise<void> {
  const user = await getUserByAuth0Id(auth0Id);
  if (user) {
    await updateUser(auth0Id, {
      diary_entry_count: (user.diary_entry_count || 0) + 1,
    });
  }
}

/**
 * Mark personality quiz as completed
 */
export async function markPersonalityCompleted(auth0Id: string): Promise<void> {
  await updateUser(auth0Id, { personality_completed: true });
}
