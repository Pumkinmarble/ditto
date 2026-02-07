/**
 * Backboard.io TypeScript Client
 * A lightweight client for interacting with Backboard's AI memory API
 */

import type {
  BackboardConfig,
  CreateAssistantPayload,
  Assistant,
  Thread,
  Message,
  SendMessagePayload,
  QueryOptions,
} from "./types";

export class BackboardClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: BackboardConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://app.backboard.io/api";
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Backboard API Error (${response.status}): ${error}`
      );
    }

    return response.json();
  }

  /**
   * Create a new assistant with specified LLM and configuration
   */
  async createAssistant(
    payload: CreateAssistantPayload
  ): Promise<Assistant> {
    return this.request<Assistant>("/assistants", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get an existing assistant by ID
   */
  async getAssistant(assistantId: string): Promise<Assistant> {
    return this.request<Assistant>(`/assistants/${assistantId}`, {
      method: "GET",
    });
  }

  /**
   * Create a new conversation thread
   */
  async createThread(assistantId: string): Promise<Thread> {
    return this.request<Thread>(`/assistants/${assistantId}/threads`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  /**
   * Get an existing thread by ID
   */
  async getThread(threadId: string): Promise<Thread> {
    return this.request<Thread>(`/threads/${threadId}`, {
      method: "GET",
    });
  }

  /**
   * Send a message to a thread
   * @param sendToLlm - If false, stores message in memory without generating response
   * Note: Backboard API requires FormData (multipart/form-data), not JSON
   */
  async sendMessage(
    threadId: string,
    payload: SendMessagePayload
  ): Promise<Message> {
    // Create FormData (required by Backboard API)
    const formData = new FormData();
    formData.append("content", payload.content);

    if (payload.send_to_llm !== undefined) {
      formData.append("send_to_llm", String(payload.send_to_llm));
    }

    if (payload.role) {
      formData.append("role", payload.role);
    }

    if (payload.metadata) {
      formData.append("metadata", JSON.stringify(payload.metadata));
    }

    // Make request with FormData (don't set Content-Type, fetch will set it with boundary)
    const url = `${this.baseUrl}/threads/${threadId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-API-Key": this.apiKey,
        // Don't set Content-Type for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Backboard API Error (${response.status}): ${error}`
      );
    }

    return response.json();
  }

  /**
   * Query the assistant with a question
   * Uses RAG to retrieve relevant context from memory
   */
  async query(
    threadId: string,
    question: string,
    options: QueryOptions = {}
  ): Promise<string> {
    const response = await this.sendMessage(threadId, {
      content: question,
      send_to_llm: true,
    });

    return response.content;
  }

  /**
   * Add diary entry to memory (without triggering LLM response)
   */
  async addDiaryEntry(
    threadId: string,
    entry: string,
    metadata?: Record<string, any>
  ): Promise<Message> {
    return this.sendMessage(threadId, {
      content: entry,
      send_to_llm: false, // Just store in memory, don't generate response
      metadata: {
        type: "diary_entry",
        ...metadata,
      },
    });
  }
}
