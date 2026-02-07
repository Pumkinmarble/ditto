/**
 * Echo Service - Database Integration
 * Initializes Echo AI using personality and diary data from Supabase
 */

import { EchoService } from './echo-service';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs/promises';
import * as path from 'path';

interface EchoFromDBConfig {
  backboardApiKey: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
  userId: string;
  outputDir?: string;
}

export class EchoFromDB {
  private supabase;
  private echo: EchoService;
  private config: EchoFromDBConfig;

  constructor(config: EchoFromDBConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
    this.echo = new EchoService({ apiKey: config.backboardApiKey });
  }

  /**
   * Fetch personality data from database and format as text
   */
  async fetchPersonalityText(): Promise<string> {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('personality_type, personality_data, name, email')
      .eq('id', this.config.userId)
      .single();

    if (error || !user) {
      throw new Error('User not found or no personality data');
    }

    if (!user.personality_data || !user.personality_type) {
      throw new Error('User has not completed personality quiz');
    }

    const personalityData = user.personality_data;
    const dimensions = personalityData.dimensions || [];
    const description = personalityData.description || {};

    // Build personality text
    let text = `PERSONALITY QUIZ RESULTS - ${user.name || 'User'}\n\n`;
    text += `Email: ${user.email}\n`;
    text += `Personality Type: ${user.personality_type}\n\n`;

    text += `PERSONALITY DIMENSIONS:\n`;
    dimensions.forEach((dim: any) => {
      const percentage = Math.round((dim.score / dim.maxScore) * 100);
      text += `- ${dim.dimension} (${percentage}%) - ${dim.tendency}\n`;
    });

    text += `\n`;

    if (description.traits) {
      text += `CORE TRAITS:\n`;
      description.traits.forEach((trait: string) => {
        text += `- ${trait}\n`;
      });
      text += `\n`;
    }

    if (description.communicationStyle) {
      text += `COMMUNICATION STYLE:\n${description.communicationStyle}\n\n`;
    }

    if (description.strengths) {
      text += `STRENGTHS:\n`;
      description.strengths.forEach((strength: string) => {
        text += `- ${strength}\n`;
      });
      text += `\n`;
    }

    if (description.values) {
      text += `CORE VALUES:\n`;
      description.values.forEach((value: string) => {
        text += `- ${value}\n`;
      });
      text += `\n`;
    }

    if (description.summary) {
      text += `SUMMARY:\n${description.summary}\n`;
    }

    return text;
  }

  /**
   * Fetch diary entries from database and format as text
   */
  async fetchDiaryEntriesText(): Promise<string[]> {
    const { data: entries, error } = await this.supabase
      .from('diary_entries')
      .select('content, entry_date')
      .eq('user_id', this.config.userId)
      .order('entry_date', { ascending: true });

    if (error) {
      throw error;
    }

    if (!entries || entries.length === 0) {
      console.warn('⚠️  No diary entries found for this user');
      return [];
    }

    // Format each entry with date
    return entries.map((entry) => {
      const date = new Date(entry.entry_date);
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      return `${formattedDate}\n${entry.content}`;
    });
  }

  /**
   * Save personality and diary data to files (optional)
   */
  async saveToFiles(): Promise<{ personalityPath: string; diaryPath: string }> {
    const outputDir = this.config.outputDir || path.join(__dirname, 'output');

    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });

    // Fetch data
    const personalityText = await this.fetchPersonalityText();
    const diaryEntries = await this.fetchDiaryEntriesText();

    // Save personality to file
    const personalityPath = path.join(outputDir, `personality-${this.config.userId}.txt`);
    await fs.writeFile(personalityPath, personalityText, 'utf-8');

    // Save diary entries to file
    const diaryPath = path.join(outputDir, `diary-${this.config.userId}.txt`);
    const diaryText = diaryEntries.join('\n\n');
    await fs.writeFile(diaryPath, diaryText, 'utf-8');

    return { personalityPath, diaryPath };
  }

  /**
   * Initialize Echo service with data from database
   */
  async initialize(): Promise<{ assistantId: string; threadId: string }> {
    console.log('🚀 Initializing Echo from database...\n');

    // Step 1: Fetch personality
    console.log('📋 Step 1: Fetching personality data from database...');
    const personalityText = await this.fetchPersonalityText();
    console.log(`✅ Personality data loaded\n`);

    // Step 2: Initialize Echo with personality
    console.log('🤖 Step 2: Creating Backboard assistant...');
    await this.echo.initialize(personalityText);
    console.log(`✅ Assistant created\n`);

    // Step 3: Fetch and upload diary entries
    console.log('📝 Step 3: Fetching diary entries from database...');
    const diaryEntries = await this.fetchDiaryEntriesText();

    if (diaryEntries.length > 0) {
      console.log(`✅ Found ${diaryEntries.length} diary entries`);
      console.log('📤 Uploading to Backboard memory...');
      await this.echo.uploadDiaryEntries(diaryEntries);
    } else {
      console.log('⚠️  No diary entries to upload');
    }

    // Get IDs for persistence
    const ids = this.echo.getIds();
    console.log('\n✅ Echo initialized successfully!');
    console.log(`📌 Assistant ID: ${ids.assistantId}`);
    console.log(`📌 Thread ID: ${ids.threadId}\n`);

    return {
      assistantId: ids.assistantId!,
      threadId: ids.threadId!,
    };
  }

  /**
   * Ask a question to the digital twin
   */
  async ask(question: string): Promise<string> {
    return this.echo.ask(question);
  }

  /**
   * Get the Echo service instance
   */
  getEchoService(): EchoService {
    return this.echo;
  }
}
