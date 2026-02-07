/**
 * Debug script to test Backboard API endpoints
 * This helps us figure out the correct API structure
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const API_KEY = process.env.BACKBOARD_API_KEY!;
const BASE_URL = "https://app.backboard.io/api";

async function testEndpoint(method: string, endpoint: string, body?: any) {
  console.log(`\n🧪 Testing: ${method} ${endpoint}`);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      return data;
    } else {
      const text = await response.text();
      console.log(`   Response (text):`, text);
      return text;
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error);
  }
}

async function main() {
  console.log("🔍 Backboard API Debug Tool\n");
  console.log(`API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`Base URL: ${BASE_URL}`);

  // Try common endpoint patterns
  await testEndpoint("GET", "/");
  await testEndpoint("GET", "/v1/assistants");
  await testEndpoint("GET", "/assistants");
  await testEndpoint("GET", "/threads");
  await testEndpoint("GET", "/health");
  await testEndpoint("GET", "/status");

  // Try creating an assistant with minimal payload
  await testEndpoint("POST", "/assistants", {
    name: "Test Assistant",
  });

  await testEndpoint("POST", "/v1/assistants", {
    name: "Test Assistant",
    model: "gemini-2.0-flash-exp",
  });

  console.log("\n✅ Debug test complete!");
  console.log("📋 Check the responses above to understand the API structure");
}

main();
