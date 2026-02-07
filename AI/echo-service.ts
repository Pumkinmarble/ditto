/**
 * Echo AI Service
 * Main service for the Echo digital twin that combines personality quiz
 * results with diary entries to create a personalized AI assistant
 */

import { BackboardClient } from "./backboard-client";
import type { Assistant, Thread } from "./types";
import * as fs from "fs/promises";

export interface EchoConfig {
  apiKey: string;
  personalityQuizPath?: string;
  diaryEntriesPath?: string;
}

export class EchoService {
  private client: BackboardClient;
  private assistant: Assistant | null = null;
  private thread: Thread | null = null;
  private personalityPrompt: string = "";

  constructor(config: EchoConfig) {
    this.client = new BackboardClient({ apiKey: config.apiKey });
  }

  /**
   * Initialize the Echo assistant with personality quiz results
   */
  async initialize(personalityText: string): Promise<void> {
    // Store personality prompt
    this.personalityPrompt = this.buildPersonalityPrompt(personalityText);

    // Create assistant with system prompt
    this.assistant = await this.client.createAssistant({
      name: "Echo - Digital Twin Assistant",
      description: "AI digital twin that learns from personality quiz and diary entries",
      system_prompt: this.personalityPrompt,
    });

    console.log(`✅ Assistant created: ${this.assistant.assistant_id}`);

    // Create a conversation thread
    this.thread = await this.client.createThread(this.assistant.assistant_id);
    console.log(`✅ Thread created: ${this.thread.thread_id}`);
  }

  /**
   * Build system prompt from personality quiz results
   */
  private buildPersonalityPrompt(personalityText: string): string {
    return `You are an AI digital twin designed to mimic a specific person's personality, thoughts, and communication style.

PERSONALITY PROFILE:
${personalityText}

INSTRUCTIONS:
- Answer questions as if you were this person
- Use their communication style, tone, and mannerisms
- Reference their experiences from diary entries when relevant
- Stay consistent with their personality traits
- Be authentic and natural in responses
- If you don't have enough context, say so honestly

Remember: You are representing this person's digital identity. Be thoughtful and authentic.`;
  }

  /**
   * Upload diary entries to Backboard's memory system
   */
  async uploadDiaryEntries(entries: string[]): Promise<void> {
    if (!this.thread) {
      throw new Error("Must call initialize() before uploading diary entries");
    }

    console.log(`📝 Uploading ${entries.length} diary entries...`);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      await this.client.addDiaryEntry(this.thread.thread_id, entry, {
        entry_number: i + 1,
        timestamp: new Date().toISOString(),
      });

      // Rate limiting: small delay between entries
      if (i < entries.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(`✅ ${entries.length} diary entries uploaded to memory`);
  }

  /**
   * Upload diary entries from a text file
   * Assumes each entry is separated by a blank line or delimiter
   */
  async uploadDiaryEntriesFromFile(
    filePath: string,
    delimiter: string = "\n\n"
  ): Promise<void> {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const entries = fileContent
      .split(delimiter)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);

    await this.uploadDiaryEntries(entries);
  }

  /**
   * Query the digital twin with a question
   * Uses RAG to pull relevant diary entries from memory
   */
  async ask(question: string): Promise<string> {
    if (!this.thread) {
      throw new Error("Must call initialize() before asking questions");
    }

    console.log(`\n❓ Question: ${question}`);
    const response = await this.client.query(this.thread.thread_id, question);
    console.log(`💬 Response: ${response}\n`);

    return response;
  }

  /**
   * Get assistant and thread IDs (for persistence)
   */
  getIds(): { assistantId: string | null; threadId: string | null } {
    return {
      assistantId: this.assistant?.assistant_id || null,
      threadId: this.thread?.thread_id || null,
    };
  }

  /**
   * Load existing assistant and thread (for resuming sessions)
   */
  async loadExisting(assistantId: string, threadId: string): Promise<void> {
    this.assistant = await this.client.getAssistant(assistantId);
    this.thread = await this.client.getThread(threadId);

    console.log(`✅ Loaded existing assistant: ${this.assistant.assistant_id}`);
    console.log(`✅ Loaded existing thread: ${this.thread.thread_id}`);
  }
}
