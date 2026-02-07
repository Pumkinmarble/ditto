import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const API_KEY = process.env.BACKBOARD_API_KEY!;
const BASE_URL = "https://app.backboard.io/api";

async function test() {
  console.log("🧪 Testing Thread Creation\n");

  // Use the assistant ID from the previous test
  const assistantId = "1ed30dc9-c38a-4c55-88b2-4c98aaa7afc3";

  try {
    console.log("Testing POST /threads with assistant_id...");
    const response = await fetch(`${BASE_URL}/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({ assistant_id: assistantId }),
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }

  // Try GET /assistants/{id}/threads
  try {
    console.log("\nTesting GET /assistants/{id}/threads...");
    const response = await fetch(`${BASE_URL}/assistants/${assistantId}/threads`, {
      method: "GET",
      headers: {
        "X-API-Key": API_KEY,
      },
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }

  // Try POST /assistants/{id}/threads
  try {
    console.log("\nTesting POST /assistants/{id}/threads...");
    const response = await fetch(`${BASE_URL}/assistants/${assistantId}/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({}),
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
