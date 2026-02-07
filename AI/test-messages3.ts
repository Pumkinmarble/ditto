import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const API_KEY = process.env.BACKBOARD_API_KEY!;
const BASE_URL = "https://app.backboard.io/api";

async function test() {
  console.log("🧪 Testing Backboard Support's Suggested Formats\n");

  const threadId = "c7164b4c-de83-408e-ad6d-1fff701f8be0";

  // Test formats from Backboard support
  const testPayloads = [
    // Format 1: Basic message
    { content: "Hello from test", role: "user" },

    // Format 2: Memory entry (no LLM)
    { text: "This is a diary entry about today", send_to_llm: false, type: "memory" },

    // Format 3: Query with LLM
    { content: "What is your favorite hobby?", role: "user", send_to_llm: true },

    // Try without role
    { text: "Test entry", send_to_llm: false },

    // Try content + send_to_llm
    { content: "Test message", send_to_llm: false },
  ];

  for (let i = 0; i < testPayloads.length; i++) {
    const payload = testPayloads[i];
    try {
      console.log(`\n[Test ${i + 1}] Payload:`, JSON.stringify(payload));
      const response = await fetch(`${BASE_URL}/threads/${threadId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify(payload),
      });

      console.log(`Status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ SUCCESS! This format works!");
        console.log("Response:", JSON.stringify(data, null, 2));
        console.log("\n" + "=".repeat(60));
        console.log("WORKING FORMAT:", JSON.stringify(payload, null, 2));
        console.log("=".repeat(60));
      } else {
        const error = await response.text();
        console.log(`❌ Failed:`, error.substring(0, 150));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
}

test();
