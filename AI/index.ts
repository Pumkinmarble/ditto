/**
 * Echo AI - Main Entry Point
 * Export all public APIs for the Echo digital twin system
 */

export { BackboardClient } from "./backboard-client";
export { EchoService } from "./echo-service";
export { EchoFromDB } from "./echo-from-db";
export type {
  BackboardConfig,
  CreateAssistantPayload,
  Assistant,
  Thread,
  Message,
  SendMessagePayload,
  QueryOptions,
} from "./types";
export type { EchoConfig } from "./echo-service";
