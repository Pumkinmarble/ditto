/**
 * Backboard.io TypeScript Types
 * Updated to match actual API responses
 */

export interface BackboardConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface CreateAssistantPayload {
  name: string;
  description?: string;
  system_prompt?: string;
  tools?: any[];
  tok_k?: number;
  embedding_provider?: string;
  embedding_model_name?: string;
  embedding_dims?: number;
}

export interface Assistant {
  assistant_id: string;
  name: string;
  description?: string | null;
  system_prompt?: string | null;
  tools?: any[] | null;
  tok_k?: number;
  embedding_provider?: string;
  embedding_model_name?: string;
  embedding_dims?: number;
  created_at: string;
}

export interface Thread {
  thread_id: string;
  assistant_id: string;
  created_at: string;
}

export interface Message {
  message_id: string;
  thread_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface SendMessagePayload {
  content: string;
  role?: "user" | "assistant" | "system";
  metadata?: Record<string, any>;
  send_to_llm?: boolean;
}

export interface QueryOptions {
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}
