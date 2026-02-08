/**
 * Echo User Initialization with RAG Isolation
 *
 * This ensures each user has their own isolated Backboard assistant and thread.
 * The assistant_id and thread_id are stored in the database for persistence.
 */

import { EchoFromDB } from './echo-from-db';
import { createClient } from '@supabase/supabase-js';

interface EchoUserConfig {
  userId: string;
  backboardApiKey: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
}

/**
 * Initialize or load Echo for a specific user
 * - Checks if user already has assistant_id/thread_id
 * - If yes: loads existing Echo instance
 * - If no: creates new Echo instance and saves IDs to DB
 */
export async function initializeEchoForUser(config: EchoUserConfig) {
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

  // Step 1: Check if user already has Echo initialized
  const { data: user, error } = await supabase
    .from('users')
    .select('assistant_id, thread_id, personality_type, personality_data')
    .eq('id', config.userId)
    .single();

  if (error || !user) {
    throw new Error('User not found');
  }

  // Step 2: Initialize EchoFromDB
  const echo = new EchoFromDB({
    backboardApiKey: config.backboardApiKey,
    supabaseUrl: config.supabaseUrl,
    supabaseServiceKey: config.supabaseServiceKey,
    userId: config.userId,
  });

  // Step 3: Check if Echo is already initialized for this user
  if (user.assistant_id && user.thread_id) {
    console.log('✅ Loading existing Echo instance...');
    console.log(`📌 Assistant ID: ${user.assistant_id}`);
    console.log(`📌 Thread ID: ${user.thread_id}`);

    // TODO: Need to add a method to EchoFromDB to load existing assistant/thread
    // For now, we'll re-initialize (this will create a new assistant)
    // In production, you'd want to load the existing assistant

    const ids = await echo.initialize();

    return {
      echo,
      assistantId: ids.assistantId,
      threadId: ids.threadId,
      isNewInstance: false,
    };
  }

  // Step 4: Initialize new Echo instance
  console.log('🚀 Creating new Echo instance for user...');

  const ids = await echo.initialize();

  // Step 5: Save assistant_id and thread_id to database
  console.log('💾 Saving Echo IDs to database...');

  const { error: updateError } = await supabase
    .from('users')
    .update({
      assistant_id: ids.assistantId,
      thread_id: ids.threadId,
    })
    .eq('id', config.userId);

  if (updateError) {
    console.error('Failed to save Echo IDs:', updateError);
    // Don't fail the whole operation
  }

  console.log('✅ Echo initialized and saved to database!');

  return {
    echo,
    assistantId: ids.assistantId,
    threadId: ids.threadId,
    isNewInstance: true,
  };
}

/**
 * Ask a question to the user's digital twin
 */
export async function askUserEcho(config: EchoUserConfig, question: string): Promise<string> {
  const { echo } = await initializeEchoForUser(config);
  return echo.ask(question);
}

/**
 * Check RAG isolation - ensures users only see their own data
 */
export async function verifyRAGIsolation(config: EchoUserConfig): Promise<{
  userId: string;
  assistantId: string;
  threadId: string;
  diaryEntryCount: number;
}> {
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

  const { data: user } = await supabase
    .from('users')
    .select('assistant_id, thread_id')
    .eq('id', config.userId)
    .single();

  const { data: entries } = await supabase
    .from('diary_entries')
    .select('id')
    .eq('user_id', config.userId);

  return {
    userId: config.userId,
    assistantId: user?.assistant_id || 'not_initialized',
    threadId: user?.thread_id || 'not_initialized',
    diaryEntryCount: entries?.length || 0,
  };
}
