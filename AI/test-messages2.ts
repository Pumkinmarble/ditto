import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const API_KEY = process.env.BACKBOARD_API_KEY!;
const BASE_URL = "https://app.backboard.io/api";

async function test() {
  console.log("🧪 Testing Message Sending - Round 2\n");

  const threadId = "c7164b4c-de83-408e-ad6d-1fff701f8be0";

  const testPayloads = [
    { text_content: "Hello, this is a test", send_to_llm: false },
    { textContent: "Hello test" },
    { body: "Hello test" },
    { message: { content: "Hello" } },
    { message: { text: "Hello" } },
    { role: "user", content: "Hello" },
    { role: "user", text: "Hello" },
  ];

  for (const payload of testPayloads) {
    try {
      console.log(`\nTesting:`, JSON.stringify(payload));
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
        console.log("✅ SUCCESS! Correct format:", JSON.stringify(payload));
        console.log("Response:", JSON.stringify(data, null, 2));
        return; // Exit after finding the right format
      } else {
        const error = await response.text();
        console.log(`❌ ${error.substring(0, 100)}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Check documentation endpoint
  console.log("\n\nTrying to find API docs...");
  try {
    const response = await fetch(`${BASE_URL}/threads/${threadId}/messages`, {
      method: "OPTIONS",
      headers: { "X-API-Key": API_KEY },
    });
    console.log("OPTIONS Status:", response.status);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));
  } catch (e) {
    console.log("OPTIONS failed");
  }
}

test();
