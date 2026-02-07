import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const API_KEY = process.env.BACKBOARD_API_KEY!;
const BASE_URL = "https://app.backboard.io/api";

async function test() {
  console.log("🧪 Testing Message Sending\n");

  // Use the thread ID from the previous test
  const threadId = "c7164b4c-de83-408e-ad6d-1fff701f8be0";

  const testPayloads = [
    { text: "Hello, this is a test message" },
    { content: "Hello, this is a test message" },
    { message: "Hello, this is a test message" },
    { text: "Test", send_to_llm: false },
    { text_content: "Test message" },
  ];

  for (const payload of testPayloads) {
    try {
      console.log(`\nTesting payload:`, JSON.stringify(payload));
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
        console.log("✅ Success! Response:", JSON.stringify(data, null, 2));
        break; // Found the right format!
      } else {
        const error = await response.text();
        console.log(`❌ Error:`, error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
}

test();
